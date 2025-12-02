/**
 * 3D Model Service
 * 
 * Uses Khronos glTF-Sample-Assets (CC0 license) - 100+ free models!
 * No external API needed - all models are hosted on GitHub.
 * 
 * Source: https://github.com/KhronosGroup/glTF-Sample-Assets
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

// Base URL for the new Khronos Sample Assets repo
const BASE_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models';

// Helper to create model entry
const model = (name: string, displayName?: string, category?: string): PolyPizzaModel => ({
  id: name.toLowerCase(),
  title: displayName || name,
  author: 'Khronos Group',
  downloadUrl: `${BASE_URL}/${name}/glTF-Binary/${name}.glb`,
  thumbnail: '',
  license: 'CC0',
  category
});

// All available models from Khronos glTF-Sample-Assets
const AVAILABLE_MODELS: Record<string, PolyPizzaModel> = {
  // Animals
  'fox': model('Fox', 'Fox', 'animal'),
  'duck': model('Duck', 'Duck', 'animal'),
  'fish': model('BarramundiFish', 'Barramundi Fish', 'animal'),
  'mosquito': model('MosquitoInAmber', 'Mosquito in Amber', 'animal'),
  
  // People/Characters
  'man': model('CesiumMan', 'Walking Man', 'character'),
  'person': model('CesiumMan', 'Walking Man', 'character'),
  'human': model('CesiumMan', 'Walking Man', 'character'),
  'figure': model('RiggedFigure', 'Human Figure', 'character'),
  
  // Vehicles
  'car': model('ToyCar', 'Toy Car', 'vehicle'),
  'truck': model('CesiumMilkTruck', 'Milk Truck', 'vehicle'),
  
  // Furniture
  'chair': model('SheenChair', 'Sheen Chair', 'furniture'),
  'sofa': model('GlamVelvetSofa', 'Velvet Sofa', 'furniture'),
  'couch': model('GlamVelvetSofa', 'Velvet Sofa', 'furniture'),
  'ottoman': model('SpecularSilkPouf', 'Silk Pouf', 'furniture'),
  'pouf': model('SpecularSilkPouf', 'Silk Pouf', 'furniture'),
  
  // Nature/Plants
  'plant': model('DiffuseTransmissionPlant', 'Plant', 'nature'),
  'flower': model('GlassVaseFlowers', 'Flowers in Vase', 'nature'),
  'flowers': model('GlassVaseFlowers', 'Flowers in Vase', 'nature'),
  'vase': model('GlassVaseFlowers', 'Flowers in Vase', 'nature'),
  
  // Food
  'avocado': model('Avocado', 'Avocado', 'food'),
  'orange': model('MandarinOrange', 'Mandarin Orange', 'food'),
  'fruit': model('MandarinOrange', 'Mandarin Orange', 'food'),
  'olives': model('IridescentDishWithOlives', 'Dish with Olives', 'food'),
  
  // Objects
  'lantern': model('Lantern', 'Lantern', 'object'),
  'lamp': model('StainedGlassLamp', 'Stained Glass Lamp', 'object'),
  'light': model('Lantern', 'Lantern', 'object'),
  'bottle': model('WaterBottle', 'Water Bottle', 'object'),
  'camera': model('AntiqueCamera', 'Antique Camera', 'object'),
  'watch': model('ChronographWatch', 'Chronograph Watch', 'object'),
  'clock': model('ChronographWatch', 'Chronograph Watch', 'object'),
  'shoe': model('MaterialsVariantsShoe', 'Shoe', 'object'),
  'sunglasses': model('SunglassesKhronos', 'Sunglasses', 'object'),
  'glasses': model('SunglassesKhronos', 'Sunglasses', 'object'),
  'boombox': model('BoomBox', 'Boom Box', 'object'),
  'radio': model('BoomBox', 'Boom Box', 'object'),
  'speaker': model('BoomBox', 'Boom Box', 'object'),
  'music': model('BoomBox', 'Boom Box', 'object'),
  'candle': model('GlassHurricaneCandleHolder', 'Candle Holder', 'object'),
  'window': model('GlassBrokenWindow', 'Broken Window', 'object'),
  'pot': model('PotOfCoals', 'Pot of Coals', 'object'),
  'fire': model('PotOfCoals', 'Pot of Coals', 'object'),
  
  // Armor/Helmets
  'helmet': model('DamagedHelmet', 'Damaged Helmet', 'armor'),
  'flight_helmet': model('FlightHelmet', 'Flight Helmet', 'armor'),
  'pilot': model('FlightHelmet', 'Flight Helmet', 'armor'),
  'scifi_helmet': model('SciFiHelmet', 'Sci-Fi Helmet', 'armor'),
  'armor': model('DamagedHelmet', 'Damaged Helmet', 'armor'),
  
  // Fantasy/Creatures
  'dragon': model('DragonAttenuation', 'Dragon', 'fantasy'),
  
  // Science/Anatomy
  'brain': model('BrainStem', 'Brain Stem', 'science'),
  'skull': model('ScatteringSkull', 'Skull', 'science'),
  'anatomy': model('BrainStem', 'Brain Stem', 'science'),
  
  // Architecture
  'sponza': model('Sponza', 'Sponza Palace', 'architecture'),
  'palace': model('Sponza', 'Sponza Palace', 'architecture'),
  'building': model('Sponza', 'Sponza Palace', 'architecture'),
  
  // Other
  'monkey': model('Suzanne', 'Suzanne (Monkey)', 'character'),
  'suzanne': model('Suzanne', 'Suzanne (Monkey)', 'character'),
  'corset': model('Corset', 'Corset', 'fashion'),
  'cloth': model('SheenCloth', 'Sheen Cloth', 'material'),
  'fabric': model('SheenCloth', 'Sheen Cloth', 'material'),
  'refrigerator': model('CommercialRefrigerator', 'Refrigerator', 'appliance'),
  'fridge': model('CommercialRefrigerator', 'Refrigerator', 'appliance'),
};

// Common word mappings
const WORD_MAPPINGS: Record<string, string> = {
  'dog': 'fox',
  'cat': 'fox',
  'wolf': 'fox',
  'animal': 'fox',
  'pet': 'fox',
  'bird': 'duck',
  'chicken': 'duck',
  'water': 'bottle',
  'drink': 'bottle',
  'seat': 'chair',
  'furniture': 'chair',
  'vehicle': 'car',
  'automobile': 'car',
  'tree': 'plant',
  'nature': 'plant',
  'food': 'avocado',
  'warrior': 'helmet',
  'knight': 'helmet',
  'soldier': 'helmet',
  'battle': 'helmet',
  'medieval': 'helmet',
  'science': 'brain',
  'organ': 'brain',
  'head': 'skull',
  'bone': 'skull',
  'skeleton': 'skull',
  'monster': 'dragon',
  'creature': 'dragon',
  'fantasy': 'dragon',
  'dinosaur': 'dragon',
  'ape': 'monkey',
  'primate': 'monkey',
  'gorilla': 'monkey',
  'room': 'sponza',
  'architecture': 'sponza',
  'interior': 'sponza',
  'time': 'watch',
  'wristwatch': 'watch',
  'photo': 'camera',
  'photography': 'camera',
  'appliance': 'refrigerator',
  'kitchen': 'refrigerator',
  'insect': 'mosquito',
  'bug': 'mosquito',
  'aviation': 'flight_helmet',
  'aviator': 'flight_helmet',
  'pilot_helmet': 'flight_helmet',
  'futuristic': 'scifi_helmet',
  'scifi': 'scifi_helmet',
  'space': 'scifi_helmet',
};

export class PolyPizzaService {
  /**
   * Search for 3D models - uses local library only (no API calls)
   */
  async search(query: string, _limit: number = 5): Promise<SearchResult> {
    const normalizedQuery = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    // Direct match
    if (AVAILABLE_MODELS[normalizedQuery]) {
      console.log(`✅ Direct match: ${normalizedQuery}`);
      return {
        models: [AVAILABLE_MODELS[normalizedQuery]],
        total: 1,
        query: normalizedQuery
      };
    }
    
    // Check word mappings
    if (WORD_MAPPINGS[normalizedQuery] && AVAILABLE_MODELS[WORD_MAPPINGS[normalizedQuery]]) {
      const mappedKey = WORD_MAPPINGS[normalizedQuery];
      console.log(`✅ Mapped: ${normalizedQuery} → ${mappedKey}`);
      return {
        models: [AVAILABLE_MODELS[mappedKey]],
        total: 1,
        query: normalizedQuery
      };
    }
    
    // Partial match in model names
    for (const key in AVAILABLE_MODELS) {
      if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
        console.log(`✅ Partial match: ${normalizedQuery} ≈ ${key}`);
        return {
          models: [AVAILABLE_MODELS[key]],
          total: 1,
          query: normalizedQuery
        };
      }
    }
    
    // Partial match in word mappings
    for (const word in WORD_MAPPINGS) {
      if (word.includes(normalizedQuery) || normalizedQuery.includes(word)) {
        const mappedKey = WORD_MAPPINGS[word];
        if (AVAILABLE_MODELS[mappedKey]) {
          console.log(`✅ Partial mapping: ${normalizedQuery} ≈ ${word} → ${mappedKey}`);
          return {
            models: [AVAILABLE_MODELS[mappedKey]],
            total: 1,
            query: normalizedQuery
          };
        }
      }
    }
    
    // No match - return fox as default (it's a nice model)
    console.warn(`⚠️ No model found for "${query}", using fox as default`);
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
    // Return unique models (some are aliased)
    const unique = new Map<string, PolyPizzaModel>();
    for (const model of Object.values(AVAILABLE_MODELS)) {
      if (!unique.has(model.downloadUrl)) {
        unique.set(model.downloadUrl, model);
      }
    }
    return Array.from(unique.values());
  }
  
  // Get list of available model names (for Gemini prompt)
  static getAvailableModelNames(): string[] {
    return Object.keys(AVAILABLE_MODELS);
  }
}
