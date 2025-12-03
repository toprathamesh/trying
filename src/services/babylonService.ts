import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import type { LoadedSceneElement } from './sceneComposer';

export interface ModelLoadResult {
  meshes: BABYLON.AbstractMesh[];
  rootMesh: BABYLON.AbstractMesh;
  elementId: string;
}

export class BabylonSceneManager {
  private scene: BABYLON.Scene;
  private engine: BABYLON.Engine;
  private camera: BABYLON.UniversalCamera;
  private loadedModels: Map<string, BABYLON.AbstractMesh[]> = new Map();
  private highlightLayer: BABYLON.HighlightLayer | null = null;
  private currentlyHovered: BABYLON.AbstractMesh | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true, { 
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    
    // Initialize camera property before setupScene
    this.camera = new BABYLON.UniversalCamera(
      "camera", 
      new BABYLON.Vector3(0, 1.6, -5), 
      this.scene
    );

    this.setupScene(canvas);
    
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
  
  private setupScene(canvas: HTMLCanvasElement) {
    // Sky blue background
    this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.98, 1); // Sky blue
    
    // Main hemispheric light - brighter for outdoor scene
    const hemiLight = new BABYLON.HemisphericLight(
      "hemiLight", 
      new BABYLON.Vector3(0, 1, 0), 
      this.scene
    );
    hemiLight.intensity = 1.0;
    hemiLight.groundColor = new BABYLON.Color3(0.3, 0.5, 0.3); // Green tint for ground reflection
    
    // Directional light (sun) for shadows and definition
    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(-1, -2, 1),
      this.scene
    );
    dirLight.intensity = 0.8;
    dirLight.position = new BABYLON.Vector3(10, 20, -10);
    dirLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.9); // Warm sunlight
    
    // Camera configuration
    this.camera.attachControl(canvas, true);
    this.camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    this.camera.speed = 0.5;
    this.camera.angularSensibility = 2000;
    this.camera.minZ = 0.1;
    
    // Ground - natural green grass (smooth, no grid)
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground", 
      { width: 200, height: 200, subdivisions: 1 }, // Smooth surface, no subdivisions
      this.scene
    );
    
    // Create ground material - natural grass green color
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
    // Slightly darker natural grass green: RGB(46, 125, 50) = #2E7D32
    groundMaterial.diffuseColor = new BABYLON.Color3(0.18, 0.49, 0.2); // Darker grass green
    groundMaterial.specularColor = new BABYLON.Color3(0.05, 0.15, 0.08); // Low specular for matte grass
    groundMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.05, 0.02); // Very subtle green tint
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    ground.receiveShadows = true;
    
    // No grid overlay - plain natural grass
    
    // Fog for depth - sky blue fog
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.005; // Lighter fog for outdoor scene
    this.scene.fogColor = new BABYLON.Color3(0.53, 0.81, 0.98); // Sky blue fog
    
    // Enable collisions
    this.scene.collisionsEnabled = true;
    this.camera.checkCollisions = true;
    this.camera.applyGravity = false; // Disable for free movement
    this.camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);
    
    // Highlight layer for hover effects
    this.highlightLayer = new BABYLON.HighlightLayer("highlight", this.scene);
    this.highlightLayer.innerGlow = false;
    this.highlightLayer.outerGlow = true;
    
    // Setup hover detection
    this.setupHoverDetection();
  }
  
  private setupHoverDetection() {
    this.scene.onPointerMove = (_evt, pickResult) => {
      // Remove previous highlight
      if (this.currentlyHovered && this.highlightLayer) {
        this.highlightLayer.removeMesh(this.currentlyHovered as BABYLON.Mesh);
        this.currentlyHovered = null;
      }
      
      // Add new highlight
      if (pickResult.hit && pickResult.pickedMesh && this.highlightLayer) {
        // Don't highlight ground or grid
        if (pickResult.pickedMesh.name === 'ground' || 
            pickResult.pickedMesh.name.startsWith('grid')) {
          return;
        }
        
        this.currentlyHovered = pickResult.pickedMesh;
        this.highlightLayer.addMesh(
          pickResult.pickedMesh as BABYLON.Mesh, 
          new BABYLON.Color3(0.3, 0.7, 1)
        );
      }
    };
  }
  
  /**
   * Load a single model at a specific position
   */
  async loadModel(url: string, elementId?: string): Promise<ModelLoadResult> {
    try {
      // Clear existing meshes if no element ID (single model mode)
      if (!elementId) {
        this.clearAllModels();
      }

      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "", 
        "", 
        url, 
        this.scene,
        undefined,
        ".glb"
      );
      
      // Get the root mesh
      const rootMesh = result.meshes[0];
      const id = elementId || `model-${Date.now()}`;
      
      // Store reference
      this.loadedModels.set(id, result.meshes);
      
      // Normalize and position
      this.normalizeModel(result.meshes);
      
      // Add collision to all meshes
      result.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.metadata = { elementId: id };
      });
      
      return {
        meshes: result.meshes,
        rootMesh,
        elementId: id
      };
    } catch (error) {
      console.error("Error loading model:", error);
      throw error;
    }
  }
  
  /**
   * Load multiple models for a composed scene
   */
  async loadComposedScene(
    elements: LoadedSceneElement[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    // Clear existing models
    this.clearAllModels();
    
    let loaded = 0;
    const total = elements.length;
    
    for (const element of elements) {
      try {
        console.log(`Loading: ${element.model.title} at`, element.position);
        
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          "", 
          "", 
          element.model.downloadUrl, 
          this.scene,
          undefined,
          ".glb"
        );
        
        const rootMesh = result.meshes[0];
        const elementId = `element-${element.searchQuery}-${Date.now()}`;
        
        // Store reference
        this.loadedModels.set(elementId, result.meshes);
        
        // Calculate bounds and normalize scale
        const targetSize = element.scale * 3; // Base size of 3 units
        this.normalizeModelToSize(result.meshes, targetSize);
        
        // Position the model
        rootMesh.position.x = element.position.x;
        rootMesh.position.z = element.position.z;
        
        // Ground the model (ensure Y=0 is ground level)
        this.groundModel(result.meshes);
        
        // Apply rotation if specified
        if (element.rotation) {
          rootMesh.rotation.y = (element.rotation * Math.PI) / 180;
        }
        
        // Add collision and metadata
        result.meshes.forEach(mesh => {
          mesh.checkCollisions = true;
          mesh.metadata = { 
            elementId,
            elementName: element.name,
            elementDescription: element.description
          };
        });
        
        // Store mesh IDs back on the element
        element.meshIds = result.meshes.map(m => m.uniqueId.toString());
        element.loaded = true;
        
        loaded++;
        onProgress?.(loaded, total);
        
      } catch (error) {
        console.error(`Failed to load model for ${element.searchQuery}:`, error);
        loaded++;
        onProgress?.(loaded, total);
      }
    }
  }
  
  private normalizeModel(meshes: BABYLON.AbstractMesh[]) {
    this.normalizeModelToSize(meshes, 5); // Default to 5 units
    this.groundModel(meshes);
  }
  
  private normalizeModelToSize(meshes: BABYLON.AbstractMesh[], targetSize: number) {
    if (meshes.length === 0) return;

    // Force bounds computation
    meshes.forEach(mesh => mesh.computeWorldMatrix(true));
    
    // Calculate combined bounding box
    let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

    meshes.forEach(mesh => {
      if (mesh.getTotalVertices() > 0) {
        const boundingInfo = mesh.getBoundingInfo();
        const boundingBox = boundingInfo.boundingBox;
        min = BABYLON.Vector3.Minimize(min, boundingBox.minimumWorld);
        max = BABYLON.Vector3.Maximize(max, boundingBox.maximumWorld);
      }
    });

    const size = max.subtract(min);
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    if (maxDimension === 0 || !isFinite(maxDimension)) return;

    const scale = targetSize / maxDimension;
    
    // Apply scale to root mesh
    const root = meshes[0];
    root.scaling = new BABYLON.Vector3(scale, scale, scale);
  }
  
  private groundModel(meshes: BABYLON.AbstractMesh[]) {
    if (meshes.length === 0) return;
    
    // Force recompute after scaling
    meshes.forEach(mesh => mesh.computeWorldMatrix(true));
    
    // Find the lowest point
    let minY = Number.MAX_VALUE;
    meshes.forEach(mesh => {
      if (mesh.getTotalVertices() > 0) {
        const boundingInfo = mesh.getBoundingInfo();
        minY = Math.min(minY, boundingInfo.boundingBox.minimumWorld.y);
      }
    });
    
    if (isFinite(minY)) {
      // Move root mesh so bottom touches ground
      const root = meshes[0];
      root.position.y -= minY;
    }
  }
  
  /**
   * Clear all loaded models
   */
  clearAllModels() {
    const meshesToDispose = this.scene.meshes.filter(m => 
      m.name !== "ground" && 
      !m.name.startsWith('grid') &&
      m.name !== "skybox"
    );
    meshesToDispose.forEach(m => m.dispose());
    this.loadedModels.clear();
  }
  
  /**
   * Set camera position
   */
  setCameraPosition(position: { x: number; y: number; z: number }) {
    this.camera.position = new BABYLON.Vector3(position.x, position.y, position.z);
    // Look toward the center/scene
    this.camera.setTarget(new BABYLON.Vector3(0, 1, 5));
  }
  
  /**
   * Set scene ambiance
   */
  setAmbiance(ambiance: 'bright' | 'dim' | 'dramatic' | 'natural') {
    const hemiLight = this.scene.getLightByName("hemiLight") as BABYLON.HemisphericLight;
    const dirLight = this.scene.getLightByName("dirLight") as BABYLON.DirectionalLight;
    
    switch (ambiance) {
      case 'bright':
        hemiLight.intensity = 1.2;
        dirLight.intensity = 0.8;
        // Keep sky/grass colors, just make scene slightly clearer
        this.scene.fogDensity = 0.004;
        break;
      case 'dim':
        hemiLight.intensity = 0.4;
        dirLight.intensity = 0.3;
        // Slightly increase fog for mood without changing background color
        this.scene.fogDensity = 0.012;
        break;
      case 'dramatic':
        hemiLight.intensity = 0.3;
        dirLight.intensity = 1.0;
        // A bit more fog for drama, keep colors the same
        this.scene.fogDensity = 0.01;
        break;
      case 'natural':
      default:
        hemiLight.intensity = 0.7;
        dirLight.intensity = 0.5;
        // Default outdoor feel
        this.scene.fogDensity = 0.005;
        break;
    }
  }
  
  /**
   * Get element info from picked mesh
   */
  getElementFromMesh(mesh: BABYLON.AbstractMesh): { name: string; description: string } | null {
    if (mesh.metadata?.elementName) {
      return {
        name: mesh.metadata.elementName,
        description: mesh.metadata.elementDescription || ''
      };
    }
    return null;
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public getCamera(): BABYLON.UniversalCamera {
    return this.camera;
  }

  public dispose() {
    this.engine.dispose();
  }
}
