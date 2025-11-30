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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const annotation = JSON.parse(cleaned);

    return new Response(JSON.stringify(annotation), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Annotate error:', error);
    return new Response(
      JSON.stringify({
        title: 'Interesting Object',
        explanation: 'This is an interesting object to explore.',
        funFact: 'Every object has a story to tell!',
        relatedTopics: ['exploration', 'learning', 'discovery'],
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

