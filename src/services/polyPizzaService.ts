/**
 * Model Service
 * 
 * Uses Khronos glTF Sample Models (CC0 license) directly.
 * No external API needed - all models are hosted on GitHub.
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
}

// All available models from Khronos glTF samples
const AVAILABLE_MODELS: Record<string, PolyPizzaModel> = {
  'fox': {
    id: 'fox',
    title: 'Fox',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'duck': {
    id: 'duck',
    title: 'Duck',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'dragon': {
    id: 'dragon',
    title: 'Dragon',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DragonAttenuation/glTF-Binary/DragonAttenuation.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'helmet': {
    id: 'helmet',
    title: 'Damaged Helmet',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'lantern': {
    id: 'lantern',
    title: 'Lantern',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'avocado': {
    id: 'avocado',
    title: 'Avocado',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'car': {
    id: 'car',
    title: 'Toy Car',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'chair': {
    id: 'chair',
    title: 'Sheen Chair',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'bottle': {
    id: 'bottle',
    title: 'Water Bottle',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'brain': {
    id: 'brain',
    title: 'Brain Stem',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'boombox': {
    id: 'boombox',
    title: 'Boom Box',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'monkey': {
    id: 'monkey',
    title: 'Suzanne (Monkey)',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Suzanne/glTF-Binary/Suzanne.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'sponza': {
    id: 'sponza',
    title: 'Sponza Palace',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sponza/glTF-Binary/Sponza.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'flight_helmet': {
    id: 'flight_helmet',
    title: 'Flight Helmet',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'corset': {
    id: 'corset',
    title: 'Corset',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF-Binary/Corset.glb',
    thumbnail: '',
    license: 'CC0'
  },
  'cloth': {
    id: 'cloth',
    title: 'Sheen Cloth',
    author: 'Khronos Group',
    downloadUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenCloth/glTF-Binary/SheenCloth.glb',
    thumbnail: '',
    license: 'CC0'
  }
};

// Aliases for common search terms
const ALIASES: Record<string, string> = {
  'dog': 'fox',
  'cat': 'fox',
  'animal': 'fox',
  'pet': 'fox',
  'bird': 'duck',
  'light': 'lantern',
  'lamp': 'lantern',
  'food': 'avocado',
  'fruit': 'avocado',
  'vehicle': 'car',
  'automobile': 'car',
  'seat': 'chair',
  'furniture': 'chair',
  'water': 'bottle',
  'drink': 'bottle',
  'music': 'boombox',
  'radio': 'boombox',
  'speaker': 'boombox',
  'armor': 'helmet',
  'warrior': 'helmet',
  'knight': 'helmet',
  'anatomy': 'brain',
  'science': 'brain',
  'organ': 'brain',
  'fantasy': 'dragon',
  'creature': 'dragon',
  'monster': 'dragon',
  'ape': 'monkey',
  'primate': 'monkey',
  'palace': 'sponza',
  'building': 'sponza',
  'architecture': 'sponza',
  'pilot': 'flight_helmet',
  'aviator': 'flight_helmet',
  'fashion': 'corset',
  'fabric': 'cloth',
  'textile': 'cloth',
};

export class PolyPizzaService {
  /**
   * Search for 3D models - uses local library only (no API calls)
   */
  async search(query: string, _limit: number = 5): Promise<SearchResult> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Direct match
    if (AVAILABLE_MODELS[normalizedQuery]) {
      return {
        models: [AVAILABLE_MODELS[normalizedQuery]],
        total: 1,
        query: normalizedQuery
      };
    }
    
    // Check aliases
    const aliasKey = ALIASES[normalizedQuery];
    if (aliasKey && AVAILABLE_MODELS[aliasKey]) {
      return {
        models: [AVAILABLE_MODELS[aliasKey]],
        total: 1,
        query: normalizedQuery
      };
    }
    
    // Partial match in model names
    for (const key in AVAILABLE_MODELS) {
      if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
        return {
          models: [AVAILABLE_MODELS[key]],
          total: 1,
          query: normalizedQuery
        };
      }
    }
    
    // Partial match in aliases
    for (const alias in ALIASES) {
      if (alias.includes(normalizedQuery) || normalizedQuery.includes(alias)) {
        const modelKey = ALIASES[alias];
        if (AVAILABLE_MODELS[modelKey]) {
          return {
            models: [AVAILABLE_MODELS[modelKey]],
            total: 1,
            query: normalizedQuery
          };
        }
      }
    }
    
    // No match - return fox as default (it's a nice model)
    console.warn(`No model found for "${query}", using fox as default`);
    return {
      models: [AVAILABLE_MODELS['fox']],
      total: 1,
      query: normalizedQuery
    };
  }

  getModelById(id: string): PolyPizzaModel | null {
    return AVAILABLE_MODELS[id] || null;
  }

  getAllFallbackModels(): PolyPizzaModel[] {
    return Object.values(AVAILABLE_MODELS);
  }
  
  // Get list of available model names (for Gemini prompt)
  static getAvailableModelNames(): string[] {
    return Object.keys(AVAILABLE_MODELS);
  }
}
