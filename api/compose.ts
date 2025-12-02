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

    const prompt = `You are a 3D scene composer for an educational platform. Create an explorable 3D scene.

⚠️ CRITICAL: You can ONLY use these exact model names in searchQuery:

AVAILABLE MODELS:
ANIMALS: fox, duck, fish, mosquito
PEOPLE: man, person, figure (walking human)
VEHICLES: car, truck
FURNITURE: chair, sofa, couch, ottoman
NATURE: plant, flower, flowers, vase
FOOD: avocado, orange, fruit, olives
LIGHTING: lantern, lamp, candle
OBJECTS: bottle, camera, watch, clock, shoe, sunglasses, boombox, radio, pot, window, refrigerator
HELMETS: helmet, flight_helmet, scifi_helmet, armor
FANTASY: dragon
SCIENCE: brain, skull, anatomy
ARCHITECTURE: sponza, palace, building
OTHER: monkey, corset, cloth, fabric

MAPPING HINTS (use these when user asks for something not in list):
- dog/cat/wolf → fox
- bird/chicken → duck
- tree/nature → plant
- time → watch
- food → avocado or orange
- monster/dinosaur → dragon
- soldier/knight/warrior → helmet
- room/interior → sponza

USER QUERY: "${query}"

RESPOND WITH VALID JSON ONLY (no markdown, no backticks):
{
  "title": "Scene title",
  "description": "Educational description (2-3 sentences)",
  "elements": [
    {
      "searchQuery": "MUST be from the available models list above",
      "name": "Display name",
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
- searchQuery MUST be exactly one of the 16 available model names listed above
- Create 1-5 elements maximum
- Be creative with positioning and scale to tell a story
- If the user asks for something not in the list, use the closest available model
- Example: "show me a dog" → use "fox", "show me a tree" → use "avocado"`;

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
