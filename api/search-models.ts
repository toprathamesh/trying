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

// Poly Pizza v1.1 uses PascalCase for all fields
interface PolyPizzaResult {
  ID: string;
  Title: string;
  Creator?: { Username: string };
  Thumbnail?: string;
  Download?: string;  // Direct GLB download URL
  Category?: string;
}

interface PolyPizzaResponse {
  total: number;
  results: PolyPizzaResult[];
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
      console.log('⚠️ POLY_PIZZA_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          models: [],
          total: 0,
          query,
          _note: 'No API key configured'
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Call Poly Pizza API v1.1 - keyword goes in PATH, not query string!
    // Endpoint: /search/{keyword}?Limit=N
    const apiUrl = `https://api.poly.pizza/v1.1/search/${encodeURIComponent(query)}?Limit=${limit}`;
    console.log(`📡 Calling: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-auth-token': apiKey.trim(),
      },
    });

    const responseText = await response.text();
    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response body: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`Poly Pizza API error: ${response.status} - ${responseText}`);
      // Return empty result so frontend uses fallback
      return new Response(
        JSON.stringify({ 
          models: [],
          total: 0,
          query,
          _error: `Poly Pizza returned ${response.status}`,
          _details: responseText.substring(0, 200)
        }),
        {
          status: 200, // Return 200 so frontend gracefully falls back
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Poly Pizza response:', responseText);
      return new Response(
        JSON.stringify({ models: [], total: 0, query }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    console.log(`✅ Poly Pizza returned ${data.total || 0} total, ${data.results?.length || 0} in this page`);

    // Transform v1.1 response (PascalCase) to our format (camelCase)
    const results = data.results || [];
    const models = results.map((item: PolyPizzaResult) => ({
      id: item.ID,
      title: item.Title || 'Untitled',
      author: item.Creator?.Username || 'Unknown',
      downloadUrl: item.Download,
      thumbnail: item.Thumbnail || '',
      license: 'CC0',
      category: item.Category
    })).filter((m) => m.downloadUrl);
    
    console.log(`📦 Processed ${models.length} models with download URLs`);

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

