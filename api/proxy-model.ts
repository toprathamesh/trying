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
    let modelUrl = searchParams.get('url');

    if (!modelUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Decode the URL (it might be double-encoded)
    try {
      modelUrl = decodeURIComponent(modelUrl);
    } catch (e) {
      // Already decoded or invalid, use as-is
    }

    // Only allow trusted sources
    const allowedDomains = [
      'static.poly.pizza',
      'raw.githubusercontent.com',
      'github.com',
    ];
    
    let url: URL;
    try {
      url = new URL(modelUrl);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log(`📥 Proxying model: ${modelUrl}`);

    // Fetch the model
    const response = await fetch(modelUrl, {
      headers: {
        'Accept': 'model/gltf-binary, application/octet-stream, */*',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch model: ${response.status} - ${errorText.substring(0, 200)}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch model',
        status: response.status,
        details: errorText.substring(0, 200)
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the binary data - use body directly for Edge Runtime
    const data = await response.arrayBuffer();

    if (!data || data.byteLength === 0) {
      console.error('Empty response from model URL');
      return new Response(JSON.stringify({ 
        error: 'Empty response from model server'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log(`✅ Proxied ${data.byteLength} bytes`);

    // Return with proper CORS headers and correct MIME type
    return new Response(data, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': data.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Expose-Headers': 'Content-Length',
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

