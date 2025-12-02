/**
 * Poly Pizza API Proxy
 * 
 * This runs on Vercel's server, so no CORS issues!
 * FREE tier: 3000 requests/month
 * 
 * Poly Pizza has 10,400+ CC0 3D models from Google Poly archive + more
 * Get your free API key at: https://poly.pizza/settings/api
 */

export const config = {
  runtime: 'edge',
};

interface PolyPizzaResult {
  id: string;
  title: string;
  creator?: { username: string };
  thumbnail?: string;
  download?: string;  // Direct GLB download URL
}

interface PolyPizzaResponse {
  results: PolyPizzaResult[];
  count: number;
  next?: string;
}

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit') || '5';

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter "q" is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log(`🔍 Searching Poly Pizza for: ${query}`);

    // Get API key from environment
    const apiKey = process.env.POLY_PIZZA_API_KEY;
    if (!apiKey) {
      console.log('⚠️ POLY_PIZZA_API_KEY not configured, using fallback models');
      return new Response(
        JSON.stringify({ 
          error: 'Poly Pizza API key not configured',
          message: 'Add POLY_PIZZA_API_KEY to your Vercel environment variables. Get a free key at https://poly.pizza/settings/api',
          models: [],
          total: 0,
          query
        }),
        {
          status: 200, // Return 200 so frontend uses fallback
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Call Poly Pizza API v1.1 from server (no CORS!)
    const apiUrl = `https://api.poly.pizza/v1.1/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'x-auth-token': apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Poly Pizza API error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: 'Poly Pizza API error', 
          status: response.status,
          message: await response.text()
        }),
        {
          status: response.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data: PolyPizzaResponse = await response.json();
    
    console.log(`✅ Found ${data.results?.length || 0} models`);

    // Transform to our format
    const models = (data.results || []).map((item: PolyPizzaResult) => ({
      id: item.id,
      title: item.title,
      author: item.creator?.username || 'Unknown',
      downloadUrl: item.download,
      thumbnail: item.thumbnail,
      license: 'CC0',
    })).filter((m: any) => m.downloadUrl); // Only include models with download URLs

    return new Response(JSON.stringify({
      models,
      total: data.count || models.length,
      query,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to search models',
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

