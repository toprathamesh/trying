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

export interface SceneValidationSuggestion {
  elementIndex: number;
  issue?: string;
  suggestedPosition?: { x: number; y: number; z: number };
  suggestedScale?: number;
}

export interface SceneValidationResult {
  isValid: boolean;
  layoutScore: number;
  suggestions: SceneValidationSuggestion[];
  overallFeedback: string;
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
    const response = await fetch(`${this.baseUrl}/api/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userQuery }),
    });

    const data = await response.json();
    
    // Log the full response for debugging
    console.log('=== COMPOSE API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== END ===');

    if (!response.ok) {
      // Throw with full error details
      throw new Error(JSON.stringify(data, null, 2));
    }

    return data;
  }

  /**
   * Generates educational annotation for a clicked object
   */
  async annotateObject(
    objectName: string,
    context: string,
    userLevel: 'child' | 'teen' | 'adult' = 'teen'
  ): Promise<ObjectAnnotation> {
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

    const data = await response.json();
    
    console.log('=== ANNOTATE API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== END ===');

    if (!response.ok) {
      throw new Error(JSON.stringify(data, null, 2));
    }

    return data;
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

  /**
   * Validate a composed scene layout using the backend visual validator.
   */
  async validateScene(payload: {
    elements: Array<{
      name: string;
      position: { x: number; y: number; z: number };
      scale: number;
      thumbnailUrl?: string;
    }>;
    sceneGoal: string;
    sceneImageBase64?: string | null;
  }): Promise<SceneValidationResult> {
    const response = await fetch(`${this.baseUrl}/api/validate-scene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        // Also send as sceneImage for compatibility with the API
        sceneImage: payload.sceneImageBase64,
      }),
    });

    const data = await response.json();

    console.log('=== VALIDATE SCENE RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== END ===');

    if (!response.ok) {
      throw new Error(JSON.stringify(data, null, 2));
    }

    return data as SceneValidationResult;
  }
}
