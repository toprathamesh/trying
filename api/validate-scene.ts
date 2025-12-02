import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

// Use Flash-Lite for visual understanding - it supports images!
const MODEL = 'gemini-2.5-flash-lite';

interface SceneElement {
  name: string;
  thumbnailUrl?: string;
  position: { x: number; y: number; z: number };
  scale: number;
}

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
    const { elements, sceneGoal } = await req.json() as {
      elements: SceneElement[];
      sceneGoal: string;
    };

    if (!elements || elements.length === 0) {
      return new Response(JSON.stringify({ error: 'Elements are required' }), {
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
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Build content parts with images if thumbnails are available
    const contentParts: any[] = [];

    // Add text description of the scene
    contentParts.push({
      text: `You are a 3D scene layout validator. Analyze these elements and their arrangement for the scene goal: "${sceneGoal}"

ELEMENTS IN SCENE:
${elements.map((el, i) => `${i + 1}. ${el.name} at position (${el.position.x}, ${el.position.y}, ${el.position.z}) with scale ${el.scale}`).join('\n')}

${elements.some(el => el.thumbnailUrl) ? 'I have included thumbnail images of some models below.' : ''}

RESPOND WITH VALID JSON ONLY:
{
  "isValid": true/false,
  "layoutScore": 1-10,
  "suggestions": [
    {
      "elementIndex": 0,
      "issue": "description of issue",
      "suggestedPosition": { "x": 0, "y": 0, "z": 0 },
      "suggestedScale": 1.0
    }
  ],
  "overallFeedback": "One sentence about the scene composition"
}`
    });

    // Add thumbnail images if available
    for (const element of elements) {
      if (element.thumbnailUrl) {
        try {
          // Fetch the image and convert to base64
          const imageResponse = await fetch(element.thumbnailUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = btoa(
              new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            const mimeType = imageResponse.headers.get('content-type') || 'image/png';
            
            contentParts.push({
              inlineData: {
                mimeType,
                data: base64Image,
              },
            });
            contentParts.push({
              text: `[Image above is: ${element.name}]`,
            });
          }
        } catch (e) {
          // Skip if image fetch fails
          console.log(`Failed to fetch thumbnail for ${element.name}:`, e);
        }
      }
    }

    const result = await model.generateContent(contentParts);
    const text = result.response.text();

    // Clean and parse response
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const validation = JSON.parse(cleaned);

    return new Response(JSON.stringify(validation), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Validate scene error:', error);
    return new Response(
      JSON.stringify({
        isValid: true,
        layoutScore: 7,
        suggestions: [],
        overallFeedback: 'Scene validation unavailable, proceeding with current layout.',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

