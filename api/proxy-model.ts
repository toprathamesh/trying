/**
 * GLB Model Proxy
 * 
 * Downloads 3D models from external sources (like Poly Pizza)
 * and serves them to the browser, bypassing CORS restrictions.
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS preflight
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
    const { searchParams } = new URL(req.url);
    const modelUrl = searchParams.get('url');

    if (!modelUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only allow trusted sources
    const allowedDomains = [
      'static.poly.pizza',
      'raw.githubusercontent.com',
      'github.com',
    ];
    
    const url = new URL(modelUrl);
    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`📥 Proxying model: ${modelUrl}`);

    // Fetch the model
    const response = await fetch(modelUrl, {
      headers: {
        'Accept': 'model/gltf-binary, application/octet-stream, */*',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch model: ${response.status}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch model',
        status: response.status 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the binary data
    const data = await response.arrayBuffer();

    console.log(`✅ Proxied ${data.byteLength} bytes`);

    // Return with proper CORS headers
    return new Response(data, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to proxy model',
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

