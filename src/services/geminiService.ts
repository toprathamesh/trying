export interface SceneElement {
  searchQuery: string;
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
  scale: number;
  rotation?: number;
}

export interface SceneComposition {
  title: string;
  description: string;
  elements: SceneElement[];
  cameraPosition: { x: number; y: number; z: number };
  ambiance: 'bright' | 'dim' | 'dramatic' | 'natural';
}

export interface ObjectAnnotation {
  title: string;
  explanation: string;
  funFact: string;
  relatedTopics: string[];
}

/**
 * GeminiService - Calls our backend API (which uses Gemini)
 * The API key is stored securely on the server
 */
export class GeminiService {
  private baseUrl: string;

  constructor() {
    // In production, this will be the same domain
    // In development, Vite proxy handles it
    this.baseUrl = import.meta.env.DEV ? '' : '';
  }

  /**
   * Analyzes user query and generates a scene composition with multiple 3D elements
   */
  async composeScene(userQuery: string): Promise<SceneComposition> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to compose scene');
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini scene composition failed:', error);
      // Fallback to simple single-object scene
      return {
        title: userQuery,
        description: `Exploring: ${userQuery}`,
        elements: [
          {
            searchQuery: userQuery.split(' ')[0].toLowerCase(),
            name: userQuery,
            description: 'An object to explore',
            position: { x: 0, y: 0, z: 5 },
            scale: 1.0,
          },
        ],
        cameraPosition: { x: 0, y: 1.6, z: -3 },
        ambiance: 'natural',
      };
    }
  }

  /**
   * Generates educational annotation for a clicked object
   */
  async annotateObject(
    objectName: string,
    context: string,
    userLevel: 'child' | 'teen' | 'adult' = 'teen'
  ): Promise<ObjectAnnotation> {
    try {
      const response = await fetch(`${this.baseUrl}/api/annotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectName,
          context,
          level: userLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to annotate object');
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini annotation failed:', error);
      return {
        title: objectName,
        explanation: 'This is an interesting object to explore.',
        funFact: 'Every object has a story to tell!',
        relatedTopics: ['exploration', 'learning', 'discovery'],
      };
    }
  }

  /**
   * Suggests related queries based on what the user is exploring
   */
  async suggestRelated(currentQuery: string): Promise<string[]> {
    // For now, return static suggestions
    // Can be expanded to call an API endpoint later
    const suggestions: Record<string, string[]> = {
      animal: ['dog breeds', 'cat behavior', 'wildlife habitats', 'endangered species'],
      nature: ['rainforest', 'ocean life', 'desert ecosystem', 'mountain geology'],
      space: ['solar system', 'mars exploration', 'black holes', 'galaxies'],
      history: ['ancient rome', 'medieval castles', 'egyptian pyramids', 'world war'],
      science: ['human anatomy', 'cell structure', 'chemistry lab', 'physics experiments'],
    };

    const lowered = currentQuery.toLowerCase();
    for (const [key, values] of Object.entries(suggestions)) {
      if (lowered.includes(key)) {
        return values;
      }
    }

    return ['solar system', 'rainforest ecosystem', 'human anatomy', 'medieval castle'];
  }
}
