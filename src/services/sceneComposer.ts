import { GeminiService } from './geminiService';
import type { SceneComposition, SceneElement, ObjectAnnotation, SceneValidationResult, SceneValidationSuggestion } from './geminiService';
import { PolyPizzaService } from './polyPizzaService';
import type { PolyPizzaModel } from './polyPizzaService';
import { ModelResolver } from './modelResolver';

export interface LoadedSceneElement extends SceneElement {
  model: PolyPizzaModel;
  meshIds: string[];
  loaded: boolean;
}

export interface ComposedScene {
  composition: SceneComposition;
  elements: LoadedSceneElement[];
  status: 'loading' | 'partial' | 'complete' | 'error';
  progress: number;
}

export type SceneUpdateCallback = (scene: ComposedScene) => void;

/**
 * SceneComposer - The brain of OBVIAN
 * 
 * Takes a user query and orchestrates:
 * 1. Backend API (Gemini) to understand and compose the scene
 * 2. Poly Pizza to find actual 3D models
 * 3. Babylon.js scene loading (via callback)
 * 4. AI-powered annotations for interactivity
 */
export class SceneComposer {
  private gemini: GeminiService;
  private polyPizza: PolyPizzaService;
  private modelResolver: ModelResolver;
  private currentScene: ComposedScene | null = null;

  constructor() {
    // No API key needed - backend handles it
    this.gemini = new GeminiService();
    this.polyPizza = new PolyPizzaService();
    this.modelResolver = new ModelResolver();
  }

  /**
   * Main entry point - compose a scene from a user query
   */
  async composeFromQuery(
    query: string,
    onUpdate?: SceneUpdateCallback
  ): Promise<ComposedScene> {
    // Initialize scene state
    this.currentScene = {
      composition: {
        title: 'Loading...',
        description: 'Composing your scene...',
        elements: [],
        cameraPosition: { x: 0, y: 1.6, z: -5 },
        ambiance: 'natural'
      },
      elements: [],
      status: 'loading',
      progress: 0
    };
    
    onUpdate?.(this.currentScene);

    try {
      // Step 1: Get AI composition from backend
      console.log('🧠 Asking AI to compose scene for:', query);
      const composition = await this.gemini.composeScene(query);
      
      this.currentScene.composition = composition;
      this.currentScene.progress = 20;
      onUpdate?.(this.currentScene);
      
      console.log('📋 Scene composition:', composition);

      // Step 2: Find models for each element
      const loadedElements: LoadedSceneElement[] = [];
      const totalElements = composition.elements.length;
      
      for (let i = 0; i < totalElements; i++) {
        const element = composition.elements[i];
        console.log(`🔍 Searching for model: ${element.searchQuery}`);
        
        // Ask Poly Pizza for multiple candidates, then let the resolver pick the best
        const searchResult = await this.polyPizza.search(element.searchQuery, 8);
        const chosen = this.modelResolver.chooseBestModel(element, searchResult);

        if (chosen) {
          console.log(`✅ Using model: ${chosen.title} (${chosen.downloadUrl})`);

          loadedElements.push({
            ...element,
            model: chosen,
            meshIds: [],
            loaded: false,
          });
        } else {
          const reason = searchResult.error || 'No suitable model found';
          console.warn(`❌ Skipping element "${element.name}": ${reason}`);
        }
        
        // Update progress
        this.currentScene.elements = loadedElements;
        this.currentScene.progress = 20 + (60 * (i + 1) / totalElements);
        this.currentScene.status = 'partial';
        onUpdate?.(this.currentScene);
      }

      // Step 3: Mark as complete
      this.currentScene.status = 'complete';
      this.currentScene.progress = 100;
      onUpdate?.(this.currentScene);
      
      console.log('🎉 Scene composition complete!', this.currentScene);
      return this.currentScene;

    } catch (error) {
      console.error('❌ Scene composition failed:', error);
      this.currentScene.status = 'error';
      onUpdate?.(this.currentScene);
      throw error;
    }
  }

  /**
   * Get annotation for a clicked object
   */
  async annotateObject(objectName: string, meshName?: string): Promise<ObjectAnnotation> {
    const context = this.currentScene?.composition.description || 'Exploring a 3D scene';
    
    // Find the element this mesh belongs to
    let elementName = objectName;
    if (this.currentScene) {
      for (const element of this.currentScene.elements) {
        if (element.meshIds.includes(meshName || '')) {
          elementName = element.name;
          break;
        }
      }
    }
    
    return this.gemini.annotateObject(elementName, context);
  }

  /**
   * Get suggestions for related queries
   */
  async getRelatedSuggestions(): Promise<string[]> {
    if (!this.currentScene) return [];
    return this.gemini.suggestRelated(this.currentScene.composition.title);
  }

  /**
   * Quick compose - skip AI, just search directly
   */
  async quickCompose(searchTerm: string): Promise<ComposedScene> {
    const pseudoElement: SceneElement = {
      searchQuery: searchTerm,
      name: searchTerm,
      description: '',
      position: { x: 0, y: 0, z: 5 },
      scale: 1.0,
    };

    const searchResult = await this.polyPizza.search(searchTerm, 8);
    const chosen = this.modelResolver.chooseBestModel(pseudoElement, searchResult);
    
    if (!chosen) {
      throw new Error(`No models found for: ${searchTerm}`);
    }
        
    return {
      composition: {
        title: chosen.title,
        description: `Exploring: ${chosen.title}`,
        elements: [{
          searchQuery: searchTerm,
          name: chosen.title,
          description: '',
          position: { x: 0, y: 0, z: 5 },
          scale: 1.0
        }],
        cameraPosition: { x: 0, y: 1.6, z: -3 },
        ambiance: 'natural'
      },
      elements: [{
        searchQuery: searchTerm,
        name: chosen.title,
        description: '',
        position: { x: 0, y: 0, z: 5 },
        scale: 1.0,
        model: chosen,
        meshIds: [],
        loaded: false
      }],
      status: 'complete',
      progress: 100
    };
  }

  /**
   * Get current scene
   */
  getCurrentScene(): ComposedScene | null {
    return this.currentScene;
  }

  /**
   * Validate the current layout and apply suggested refinements (position/scale).
   */
  async validateSceneLayout(
    sceneGoal: string,
    elements: LoadedSceneElement[],
    sceneImageBase64?: string | null
  ): Promise<{ validation: SceneValidationResult; adjustedElements: LoadedSceneElement[] }> {
    const validation = await this.gemini.validateScene({
      elements: elements.map(el => ({
        name: el.name,
        position: el.position,
        scale: el.scale,
        thumbnailUrl: el.model.thumbnail,
      })),
      sceneGoal,
      sceneImageBase64: sceneImageBase64 || undefined,
    });

    const adjustedElements = this.applySuggestions(elements, validation.suggestions);

    if (this.currentScene) {
      this.currentScene = {
        ...this.currentScene,
        elements: adjustedElements,
      };
    }

    return { validation, adjustedElements };
  }

  private applySuggestions(
    elements: LoadedSceneElement[],
    suggestions: SceneValidationSuggestion[]
  ): LoadedSceneElement[] {
    if (!suggestions || suggestions.length === 0) return elements;

    const updated = elements.map((el) => ({
      ...el,
      position: { ...el.position },
      scale: el.scale,
    }));

    for (const suggestion of suggestions) {
      const idx = suggestion.elementIndex;
      if (idx < 0 || idx >= updated.length) continue;

      if (suggestion.suggestedPosition) {
        updated[idx].position = {
          x: suggestion.suggestedPosition.x ?? updated[idx].position.x,
          y: suggestion.suggestedPosition.y ?? updated[idx].position.y,
          z: suggestion.suggestedPosition.z ?? updated[idx].position.z,
        };
      }

      if (suggestion.suggestedScale && suggestion.suggestedScale > 0) {
        updated[idx].scale = suggestion.suggestedScale;
      }
    }

    return updated;
  }

}
