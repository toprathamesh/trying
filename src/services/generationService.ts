export class ModelGenerationService {
  // Public GitHub raw links for reliable testing
  private readonly LIBRARY_DB: Record<string, string> = {
    "duck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    "boombox": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb",
    "helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    "lantern": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb",
    "avocado": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    "buggy": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb",
  };

  // Mappings for broader terms
  private readonly KEYWORD_MAPPING: Record<string, string> = {
    "biology": "duck",
    "animal": "duck",
    "bird": "duck",
    "physics": "boombox",
    "music": "boombox",
    "sound": "boombox",
    "history": "helmet",
    "artifact": "helmet",
    "war": "helmet",
    "light": "lantern",
    "food": "avocado",
    "plant": "avocado",
    "car": "buggy",
    "vehicle": "buggy",
    "transport": "buggy"
  };

  async searchLibrary(query: string): Promise<string | null> {
    console.log(`Searching library for: ${query}`);
    const normalizedQuery = query.toLowerCase().trim();
    
    // 1. Direct match
    if (this.LIBRARY_DB[normalizedQuery]) {
      return this.LIBRARY_DB[normalizedQuery];
    }

    // 2. Keyword mapping match
    if (this.KEYWORD_MAPPING[normalizedQuery]) {
      const key = this.KEYWORD_MAPPING[normalizedQuery];
      return this.LIBRARY_DB[key];
    }

    // 3. Fuzzy search (contains)
    for (const key in this.LIBRARY_DB) {
      if (normalizedQuery.includes(key)) {
        return this.LIBRARY_DB[key];
      }
    }
    
    // 4. Check mapped keywords (contains)
    for (const key in this.KEYWORD_MAPPING) {
      if (normalizedQuery.includes(key)) {
        const target = this.KEYWORD_MAPPING[key];
        return this.LIBRARY_DB[target];
      }
    }

    return null;
  }

  async generateWithFLUX(prompt: string): Promise<string> {
    console.log("Generating with FLUX (Mock):", prompt);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return a different model to distinguish from library (e.g. Lantern)
    // In reality, this would call the API
    return "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SciFiHelmet/glTF-Binary/SciFiHelmet.glb";
  }
}
