import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a 3D scene composer for an educational platform. Given a user's question or topic, you must create an explorable 3D scene using available 3D model assets.

AVAILABLE MODEL CATEGORIES (search these on Poly Pizza - a CC0 3D model library):
- Animals: dog, cat, bird, fish, horse, elephant, lion, bear, deer, rabbit, snake, frog, bee, butterfly, eagle, owl, penguin, shark, whale, dolphin, turtle, crab, octopus
- Nature: tree, flower, plant, rock, mountain, grass, mushroom, cactus, palm tree, pine tree, bush, log, leaf
- Buildings: house, castle, tower, church, barn, tent, lighthouse, windmill, bridge, gate, fence, wall
- Vehicles: car, truck, bus, airplane, helicopter, boat, ship, bicycle, motorcycle, train, rocket
- Food: apple, banana, orange, bread, cake, pizza, burger, ice cream, donut, cookie, watermelon, carrot, corn
- Objects: chair, table, lamp, book, clock, phone, computer, tv, camera, guitar, piano, drum, ball, sword, shield, crown, treasure chest, key, lantern, candle
- Science: microscope, telescope, globe, atom, crystal, magnet, beaker, test tube
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean the response
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const composition = JSON.parse(cleaned);

    // Validate and set defaults
    composition.elements = composition.elements.map((el: any) => ({
      ...el,
      position: el.position || { x: 0, y: 0, z: 5 },
      scale: el.scale || 1.0,
      rotation: el.rotation || 0,
    }));

    return new Response(JSON.stringify(composition), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Compose error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to compose scene',
        details: error instanceof Error ? error.message : 'Unknown error',
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

