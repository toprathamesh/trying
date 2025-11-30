/**
 * Poly Pizza API Service
 * 
 * Poly Pizza is a free CC0 3D model search engine that aggregates models from:
 * - Google Poly (archived)
 * - Sketchfab (CC0 section)
 * - And other sources
 * 
 * All models are CC0 licensed - free to use with no attribution required.
 * API Documentation: https://poly.pizza/docs
 */

export interface PolyPizzaModel {
  id: string;
  title: string;
  author: string;
  downloadUrl: string;  // GLB format
  thumbnail: string;
  license: string;
  category?: string;
}

export interface SearchResult {
  models: PolyPizzaModel[];
  total: number;
  query: string;
}

export class PolyPizzaService {
  private readonly API_BASE = 'https://api.poly.pizza/v1';
  private readonly CORS_PROXY = 'https://corsproxy.io/?';
  
  // Fallback models from Khronos glTF samples (always available)
  private readonly FALLBACK_MODELS: Record<string, PolyPizzaModel> = {
    'duck': {
      id: 'duck-khronos',
      title: 'Duck',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'helmet': {
      id: 'helmet-khronos',
      title: 'Damaged Helmet',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'lantern': {
      id: 'lantern-khronos',
      title: 'Lantern',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'avocado': {
      id: 'avocado-khronos',
      title: 'Avocado',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'car': {
      id: 'car-khronos',
      title: 'Toy Car',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'fox': {
      id: 'fox-khronos',
      title: 'Fox',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'brain': {
      id: 'brain-khronos',
      title: 'Brain Stem',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'box': {
      id: 'box-khronos',
      title: 'Box',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'boom': {
      id: 'boom-khronos',
      title: 'Boom Box',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'boombox': {
      id: 'boom-khronos',
      title: 'Boom Box',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'corset': {
      id: 'corset-khronos',
      title: 'Corset',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF-Binary/Corset.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'dragon': {
      id: 'dragon-khronos',
      title: 'Dragon',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DragonAttenuation/glTF-Binary/DragonAttenuation.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'flight': {
      id: 'flight-khronos',
      title: 'Flight Helmet',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'suzanne': {
      id: 'suzanne-khronos',
      title: 'Suzanne (Monkey)',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Suzanne/glTF-Binary/Suzanne.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'monkey': {
      id: 'suzanne-khronos',
      title: 'Suzanne (Monkey)',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Suzanne/glTF-Binary/Suzanne.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'sponza': {
      id: 'sponza-khronos',
      title: 'Sponza Palace',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sponza/glTF-Binary/Sponza.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'water': {
      id: 'water-khronos',
      title: 'Water Bottle',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'bottle': {
      id: 'water-khronos',
      title: 'Water Bottle',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'sheen': {
      id: 'sheen-khronos',
      title: 'Sheen Chair',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'chair': {
      id: 'sheen-khronos',
      title: 'Sheen Chair',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
      thumbnail: '',
      license: 'CC0'
    },
    'cloth': {
      id: 'cloth-khronos',
      title: 'Sheen Cloth',
      author: 'Khronos Group',
      downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenCloth/glTF-Binary/SheenCloth.glb',
      thumbnail: '',
      license: 'CC0'
    }
  };

  // Keyword mappings to help find relevant models
  private readonly KEYWORD_MAPPINGS: Record<string, string[]> = {
    'animal': ['fox', 'duck'],
    'bird': ['duck'],
    'dog': ['fox'],
    'pet': ['fox', 'duck'],
    'nature': ['avocado', 'fox'],
    'food': ['avocado'],
    'fruit': ['avocado'],
    'vehicle': ['car'],
    'transport': ['car'],
    'music': ['boombox'],
    'audio': ['boombox'],
    'sound': ['boombox'],
    'light': ['lantern'],
    'lamp': ['lantern'],
    'armor': ['helmet'],
    'battle': ['helmet'],
    'war': ['helmet'],
    'medieval': ['helmet', 'dragon'],
    'fantasy': ['dragon'],
    'mythical': ['dragon'],
    'architecture': ['sponza'],
    'building': ['sponza'],
    'palace': ['sponza'],
    'brain': ['brain'],
    'anatomy': ['brain'],
    'body': ['brain'],
    'science': ['brain', 'bottle'],
    'furniture': ['chair'],
    'seat': ['chair'],
    'drink': ['bottle'],
    'container': ['bottle', 'box'],
    'primate': ['monkey'],
    'ape': ['monkey'],
    'fabric': ['cloth'],
    'material': ['cloth'],
    'textile': ['cloth']
  };

  /**
   * Search for 3D models using Poly Pizza API
   * Falls back to curated Khronos samples if API fails
   */
  async search(query: string, limit: number = 5): Promise<SearchResult> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // First, try Poly Pizza API with CORS proxy
    try {
      const result = await this.searchPolyPizza(normalizedQuery, limit);
      if (result.models.length > 0) {
        return result;
      }
    } catch (error) {
      console.log('Poly Pizza API unavailable, using fallbacks:', error);
    }
    
    // Fallback to curated models
    return this.searchFallback(normalizedQuery);
  }

  private async searchPolyPizza(query: string, limit: number): Promise<SearchResult> {
    // Poly Pizza's API endpoint
    const url = `${this.CORS_PROXY}${encodeURIComponent(
      `${this.API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    )}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Poly Pizza API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map Poly Pizza response to our interface
    const models: PolyPizzaModel[] = (data.results || []).map((item: any) => ({
      id: item.id || item.slug,
      title: item.title || item.name,
      author: item.author?.name || 'Unknown',
      downloadUrl: item.download?.glb || item.formats?.glb?.url,
      thumbnail: item.thumbnail || item.preview,
      license: 'CC0',
      category: item.category
    })).filter((m: PolyPizzaModel) => m.downloadUrl);
    
    return {
      models,
      total: data.total || models.length,
      query
    };
  }

  private searchFallback(query: string): SearchResult {
    const models: PolyPizzaModel[] = [];
    
    // Direct match
    if (this.FALLBACK_MODELS[query]) {
      models.push(this.FALLBACK_MODELS[query]);
    }
    
    // Keyword mapping
    const mappedKeys = this.KEYWORD_MAPPINGS[query] || [];
    for (const key of mappedKeys) {
      if (this.FALLBACK_MODELS[key] && !models.find(m => m.id === this.FALLBACK_MODELS[key].id)) {
        models.push(this.FALLBACK_MODELS[key]);
      }
    }
    
    // Partial match in keys
    for (const key in this.FALLBACK_MODELS) {
      if (key.includes(query) || query.includes(key)) {
        if (!models.find(m => m.id === this.FALLBACK_MODELS[key].id)) {
          models.push(this.FALLBACK_MODELS[key]);
        }
      }
    }
    
    // Partial match in keyword mappings
    for (const keyword in this.KEYWORD_MAPPINGS) {
      if (keyword.includes(query) || query.includes(keyword)) {
        for (const key of this.KEYWORD_MAPPINGS[keyword]) {
          if (this.FALLBACK_MODELS[key] && !models.find(m => m.id === this.FALLBACK_MODELS[key].id)) {
            models.push(this.FALLBACK_MODELS[key]);
          }
        }
      }
    }
    
    // If still nothing, return a default
    if (models.length === 0) {
      models.push(this.FALLBACK_MODELS['box']);
    }
    
    return {
      models,
      total: models.length,
      query
    };
  }

  /**
   * Get a specific model by ID
   */
  getModelById(id: string): PolyPizzaModel | null {
    for (const key in this.FALLBACK_MODELS) {
      if (this.FALLBACK_MODELS[key].id === id) {
        return this.FALLBACK_MODELS[key];
      }
    }
    return null;
  }

  /**
   * Get all available fallback models (for browsing)
   */
  getAllFallbackModels(): PolyPizzaModel[] {
    const unique = new Map<string, PolyPizzaModel>();
    for (const key in this.FALLBACK_MODELS) {
      const model = this.FALLBACK_MODELS[key];
      if (!unique.has(model.id)) {
        unique.set(model.id, model);
      }
    }
    return Array.from(unique.values());
  }
}

