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

    const prompt = `You are a 3D scene composer for an educational platform. Given a user's question or topic, create an explorable 3D scene.

⚠️ CRITICAL: You can ONLY use these exact model names in searchQuery. No other models exist:

AVAILABLE MODELS (use these EXACT names in searchQuery):
- fox (use for: dog, cat, wolf, any animal)
- duck (use for: bird, chicken, any flying animal)
- dragon (use for: fantasy creatures, dinosaurs, monsters)
- helmet (use for: armor, warrior, battle, medieval)
- lantern (use for: light, lamp, candle, fire)
- avocado (use for: food, fruit, nature, plant)
- car (use for: vehicle, transport, driving)
- chair (use for: furniture, seat, sitting)
- bottle (use for: water, drink, container)
- brain (use for: science, anatomy, biology, organ)
- boombox (use for: music, sound, radio, speaker)
- monkey (use for: ape, primate, animal)
- sponza (use for: building, palace, architecture, room)
- flight_helmet (use for: pilot, aviation, flying)
- corset (use for: fashion, clothing)
- cloth (use for: fabric, textile, material)

USER QUERY: "${query}"

RESPOND WITH VALID JSON ONLY (no markdown, no backticks):
{
  "title": "Scene title",
  "description": "Educational description of what's being shown (2-3 sentences)",
  "elements": [
    {
      "searchQuery": "MUST be one of: fox, duck, dragon, helmet, lantern, avocado, car, chair, bottle, brain, boombox, monkey, sponza, flight_helmet, corset, cloth",
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
