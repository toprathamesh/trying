/**
 * 3D Model Service - Poly Pizza Only
 * 
 * Uses Poly Pizza API (10,400+ CC0 models from Google Poly archive)
 * No fallbacks - if search fails, we show the error
 */

export interface PolyPizzaModel {
  id: string;
  title: string;
  author: string;
  downloadUrl: string;
  thumbnail: string;
  license: string;
  category?: string;
}

export interface SearchResult {
  models: PolyPizzaModel[];
  total: number;
  query: string;
  error?: string;
}

/**
 * Proxy Poly Pizza URLs through our backend to avoid CORS
 */
function proxyUrl(url: string): string {
  if (!url) return '';
  return `/api/proxy-model?url=${encodeURIComponent(url)}`;
}

export class PolyPizzaService {
  /**
   * Search for 3D models - Poly Pizza only
   */
  async search(query: string, limit: number = 1): Promise<SearchResult> {
    const normalizedQuery = query.toLowerCase().trim();
    
    console.log(`🔍 Searching Poly Pizza for: ${normalizedQuery}`);
    
    try {
      const response = await fetch(`/api/search-models?q=${encodeURIComponent(normalizedQuery)}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Poly Pizza API error:`, errorData);
        return {
          models: [],
          total: 0,
          query: normalizedQuery,
          error: errorData.error || `API error: ${response.status}`
        };
      }
      
      const data = await response.json();
      
      if (data.models && data.models.length > 0) {
        console.log(`✅ Found: ${data.models[0].title}`);
        // Proxy the download URLs
        const proxiedModels = data.models.map((m: PolyPizzaModel) => ({
          ...m,
          downloadUrl: proxyUrl(m.downloadUrl)
        }));
        return { ...data, models: proxiedModels };
      }
      
      console.warn(`⚠️ No models found for: ${normalizedQuery}`);
      return {
        models: [],
        total: 0,
        query: normalizedQuery,
        error: `No 3D model found for "${query}"`
      };
      
    } catch (error) {
      console.error(`❌ Search failed:`, error);
      return {
        models: [],
        total: 0,
        query: normalizedQuery,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }
}

export const polyPizzaService = new PolyPizzaService();
