import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

interface Annotation {
    title: string;
    explanation: string;
    funFact: string;
}

export class AnnotationService {
  // private geminiClient: GoogleGenerativeAI;
  
  constructor() {
      // Initialize AI client
  }

  async generateAnnotation(
    objectName: string, 
    context: string
  ): Promise<Annotation> {
    // Mock response for now
    return {
        title: objectName,
        explanation: `This is a ${objectName}.`,
        funFact: "Did you know this is a placeholder?"
    };
  }
  
  create3DLabel(
    text: string, 
    position: BABYLON.Vector3, 
    scene: BABYLON.Scene
  ) {
    // Create 3D text label in Babylon.js
    const plane = BABYLON.MeshBuilder.CreatePlane(
      "label", 
      { width: 2, height: 0.5 }, 
      scene
    );
    plane.position = position;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    
    // Add GUI texture
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    const textBlock = new GUI.TextBlock();
    textBlock.text = text;
    textBlock.color = "white";
    textBlock.fontSize = 24;
    advancedTexture.addControl(textBlock);
    
    return plane;
  }
}

