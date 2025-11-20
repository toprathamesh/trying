import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export class BabylonSceneManager {
  private scene: BABYLON.Scene;
  private engine: BABYLON.Engine;
  private camera: BABYLON.UniversalCamera;
  
  constructor(canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    
    // Initialize camera property before setupScene
    this.camera = new BABYLON.UniversalCamera(
      "camera", 
      new BABYLON.Vector3(0, 1.6, 0), 
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
    // Lighting
    const light = new BABYLON.HemisphericLight(
      "light", 
      new BABYLON.Vector3(0, 1, 0), 
      this.scene
    );
    light.intensity = 0.7;
    
    // Camera (first-person) configuration
    this.camera.attachControl(canvas, true);
    // Remove default keyboard input to use our custom controller (for sprint etc)
    this.camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    
    this.camera.speed = 0.5;
    this.camera.angularSensibility = 2000;
    this.camera.minZ = 0.1;
    
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground", 
      { width: 100, height: 100 }, 
      this.scene
    );
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    
    // Enable collisions
    this.scene.collisionsEnabled = true;
    this.camera.checkCollisions = true;
    this.camera.applyGravity = true;
    
    // Define ellipsoid for collision (player size)
    this.camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);
  }
  
  async loadModel(url: string) {
    try {
      // Clear existing meshes except ground and skybox (if any)
      const meshesToDispose = this.scene.meshes.filter(m => m.name !== "ground" && m.name !== "skybox");
      meshesToDispose.forEach(m => m.dispose());

      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "", 
        "", 
        url, 
        this.scene,
        undefined,
        ".glb" // Explicitly hint the file type if needed, though usually auto-detected
      );
      
      // Auto-scale model to reasonable size
      this.normalizeModel(result.meshes);
      
      // Add collision
      result.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
      });
      
      return result;
    } catch (error) {
      console.error("Error loading model:", error);
      throw error;
    }
  }
  
  private normalizeModel(meshes: BABYLON.AbstractMesh[]) {
    if (meshes.length === 0) return;

    // Calculate bounding box and scale to 5 units max
    // We need to find the root mesh or calculate bounds of all meshes
    let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    let max = new BABYLON.Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

    meshes.forEach(mesh => {
        const boundingInfo = mesh.getBoundingInfo();
        const boundingBox = boundingInfo.boundingBox;
        
        min = BABYLON.Vector3.Minimize(min, boundingBox.minimumWorld);
        max = BABYLON.Vector3.Maximize(max, boundingBox.maximumWorld);
    });

    const size = max.subtract(min);
    const maxSize = Math.max(size.x, size.y, size.z);
    
    if (maxSize === 0) return;

    const scale = 5 / maxSize;
    
    // Apply scale to the first mesh (usually the root) or a parent container
    // Ideally, we should parent everything to a new root if not already
    const root = meshes[0];
    root.scaling = new BABYLON.Vector3(scale, scale, scale);
    
    // Position on ground
    root.position.y = 0;
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public dispose() {
    this.engine.dispose();
  }
}

