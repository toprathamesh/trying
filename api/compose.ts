import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

// Models to try in order (fallback if one is overloaded)
const MODELS_TO_TRY = [
  'gemini-2.0-flash',           // Stable, reliable
  'gemini-1.5-flash',           // Fallback
];

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are a 3D scene composer for an educational platform. Given a user's question or topic, you must create an explorable 3D scene using available 3D model assets.

AVAILABLE MODEL CATEGORIES (search these on Poly Pizza - a CC0 3D model library):
- Animals: dog, cat, bird, fish, horse, elephant, lion, bear, deer, rabbit, snake, frog, bee, butterfly, eagle, owl, penguin, shark, whale, dolphin, turtle, crab, octopus, fox
- Nature: tree, flower, plant, rock, mountain, grass, mushroom, cactus, palm tree, pine tree, bush, log, leaf
- Buildings: house, castle, tower, church, barn, tent, lighthouse, windmill, bridge, gate, fence, wall
- Vehicles: car, truck, bus, airplane, helicopter, boat, ship, bicycle, motorcycle, train, rocket
- Food: apple, banana, orange, bread, cake, pizza, burger, ice cream, donut, cookie, watermelon, carrot, corn, avocado
- Objects: chair, table, lamp, book, clock, phone, computer, tv, camera, guitar, piano, drum, ball, sword, shield, crown, treasure chest, key, lantern, candle, helmet, bottle
- Science: microscope, telescope, globe, atom, crystal, magnet, beaker, test tube, brain
- Fantasy: dragon, unicorn, fairy, wizard, knight, goblin, treasure
- Sports: soccer ball, basketball, tennis racket, golf club, skateboard, surfboard

USER QUERY: "${query}"

RESPOND WITH VALID JSON ONLY (no markdown, no backticks):
{
  "title": "Scene title",
  "description": "Educational description of what's being shown (2-3 sentences)",
  "elements": [
    {
      "searchQuery": "exact search term for Poly Pizza (simple, 1-2 words)",
      "name": "Display name for this element",
      "description": "Brief educational description",
      "position": { "x": 0, "y": 0, "z": 5 },
      "scale": 1.0,
      "rotation": 0
    }
  ],
  "cameraPosition": { "x": 0, "y": 1.6, "z": -5 },
  "ambiance": "natural"
}

POSITIONING RULES:
- Center main subject at (0, 0, 5)
- Y is up: ground level is 0, objects sit ON the ground
- Spread elements naturally, like a museum exhibit or diorama
- Use x from -15 to 15, z from 0 to 30 for variety
- Scale: 1.0 = normal (about 1-2 meters), adjust based on real-world proportions
- Face objects toward camera start position when relevant

IMPORTANT:
- Create 1-5 elements maximum for performance
- Search queries should be SIMPLE words that will find 3D models
- Be educational but visually interesting
- Think like a museum curator or science exhibit designer`;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try models in order until one works
    let lastError: Error | null = null;
    let text = '';
    let usedModel = '';
    
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        usedModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break; // Success! Exit the loop
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError);
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError));
        // Continue to next model
      }
    }
    
    // If all models failed, return error
    if (!text) {
      return new Response(
        JSON.stringify({
          error: 'All models failed',
          details: lastError?.message || 'Unknown error',
          triedModels: MODELS_TO_TRY,
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Log raw response for debugging
    console.log('=== GEMINI RAW RESPONSE ===');
    console.log(text);
    console.log('=== END RAW RESPONSE ===');

    // Clean the response
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    console.log('=== CLEANED RESPONSE ===');
    console.log(cleaned);
    console.log('=== END CLEANED ===');

    let composition;
    try {
      composition = JSON.parse(cleaned);
    } catch (parseError) {
      // Return the raw text so we can see what Gemini sent
      return new Response(
        JSON.stringify({
          error: 'Failed to parse Gemini response as JSON',
          model: usedModel,
          rawResponse: text,
          cleanedResponse: cleaned,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate and set defaults
    composition.elements = composition.elements.map((el: any) => ({
      ...el,
      position: el.position || { x: 0, y: 0, z: 5 },
      scale: el.scale || 1.0,
      rotation: el.rotation || 0,
    }));

    // Include debug info in successful response
    return new Response(JSON.stringify({
      ...composition,
      _debug: {
        model: usedModel,
        rawResponseLength: text.length,
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Compose error:', error);
    // Return detailed error - NO FALLBACK
    return new Response(
      JSON.stringify({
        error: 'Failed to compose scene',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
