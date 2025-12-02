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

    // Call Poly Pizza API v1.1 from server
    const apiUrl = `https://api.poly.pizza/v1.1/search?Keyword=${encodeURIComponent(query)}`;
    console.log(`📡 Calling: ${apiUrl}`);
    console.log(`🔑 API Key length: ${apiKey.length}`);
    
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
    
    console.log(`✅ Found ${data.results?.length || data.Results?.length || 0} models`);

    // Transform to our format (handle both v1 and v1.1 response formats)
    const results = data.results || data.Results || [];
    const models = results.map((item: any) => ({
      id: item.id || item.ID || item.Slug,
      title: item.title || item.Title || item.Name || 'Untitled',
      author: item.creator?.username || item.Creator?.Username || item.Author || 'Unknown',
      downloadUrl: item.download || item.Download || item.DownloadUrl,
      thumbnail: item.thumbnail || item.Thumbnail || '',
      license: 'CC0',
    })).filter((m: any) => m.downloadUrl);
    
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

