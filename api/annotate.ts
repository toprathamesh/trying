import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

// Fast model for quick annotations
const MODEL = 'gemini-2.5-flash-lite-preview-06-17';

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
    const { objectName, context, level = 'teen' } = await req.json();

    if (!objectName) {
      return new Response(JSON.stringify({ error: 'objectName is required' }), {
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

    const levelGuide: Record<string, string> = {
      child: 'Explain like talking to a curious 8 year old. Use simple words and fun comparisons.',
      teen: 'Explain clearly for a middle/high school student. Be engaging and informative.',
      adult: 'Explain with detail appropriate for a college student or adult learner.',
    };

    const prompt = `You are an educational AI assistant explaining objects in a 3D learning environment.

OBJECT CLICKED: "${objectName}"
SCENE CONTEXT: "${context || 'Exploring a 3D scene'}"
EXPLANATION LEVEL: ${levelGuide[level] || levelGuide.teen}

Generate an educational annotation. RESPOND WITH VALID JSON ONLY:
{
  "title": "Catchy 3-5 word title",
  "explanation": "1-2 sentence educational explanation",
  "funFact": "One surprising or interesting fact",
  "relatedTopics": ["topic1", "topic2", "topic3"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log('=== ANNOTATE RAW RESPONSE ===');
    console.log(text);
    console.log('=== END ===');
    
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    let annotation;
    try {
      annotation = JSON.parse(cleaned);
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to parse Gemini response',
          rawResponse: text,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown',
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

    return new Response(JSON.stringify(annotation), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Annotate error:', error);
    // NO FALLBACK - show real error
    return new Response(
      JSON.stringify({
        error: 'Annotation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
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

