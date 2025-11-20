import { useRef, useEffect } from 'react';
import { useBabylonScene } from '../../hooks/useBabylonScene';
import { useCharacterController } from '../../hooks/useCharacterController';

interface BabylonViewerProps {
  modelUrl?: string;
  onReady?: () => void;
  onObjectClick?: (objectName: string) => void;
}

export const BabylonViewer = ({ modelUrl, onReady, onObjectClick }: BabylonViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManager = useBabylonScene(canvasRef);
  
  // Enable character controller
  useCharacterController(sceneManager?.getScene());
  
  useEffect(() => {
    if (sceneManager && modelUrl) {
      sceneManager.loadModel(modelUrl)
        .then(() => {
          console.log(`Model loaded: ${modelUrl}`);
        })
        .catch((err) => {
          console.error("Failed to load model", err);
        });
    }
  }, [sceneManager, modelUrl]);

  useEffect(() => {
    if (sceneManager && onReady) {
       // We could wait for scene to be ready, but for now just call it
       onReady();
    }
  }, [sceneManager, onReady]);

  // Setup click handling
  useEffect(() => {
    if (!sceneManager || !onObjectClick) return;

    const scene = sceneManager.getScene();
    const observer = scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === 4) { // POINTERDOWN = 4 in Babylon (using direct number or enum)
            // 4 is actually POINTERDOWN, check import for enum
            // Import enum or use BABYLON.PointerEventTypes.POINTERDOWN
        }
    });
    
    // Better approach: use scene.onPointerDown
    const originalOnPointerDown = scene.onPointerDown;
    scene.onPointerDown = (evt, pickResult) => {
        if (pickResult.hit && pickResult.pickedMesh) {
            onObjectClick(pickResult.pickedMesh.name);
        }
        if (originalOnPointerDown) originalOnPointerDown(evt, pickResult);
    };

    return () => {
        // Cleanup if needed, though scene dispose handles most
        if (scene.onPointerDown === originalOnPointerDown) {
             scene.onPointerDown = undefined!; // difficult to restore perfectly if multiple things attach
        }
    };
  }, [sceneManager, onObjectClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', outline: 'none' }} 
      />
      {/* Overlay UI can go here */}
    </div>
  );
};

