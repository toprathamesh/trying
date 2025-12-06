import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useBabylonScene } from '../../hooks/useBabylonScene';
import { useCharacterController } from '../../hooks/useCharacterController';
import type { LoadedSceneElement } from '../../services/sceneComposer';
import { BabylonSceneManager } from '../../services/babylonService';

interface BabylonViewerProps {
  onReady?: () => void;
  onObjectClick?: (objectName: string, meshName: string) => void;
}

export interface BabylonViewerHandle {
  getSceneManager: () => BabylonSceneManager | null;
  loadModel: (url: string) => Promise<void>;
  loadComposedScene: (elements: LoadedSceneElement[], onProgress?: (loaded: number, total: number) => void) => Promise<void>;
  setCameraPosition: (pos: { x: number; y: number; z: number }) => void;
  setAmbiance: (ambiance: 'bright' | 'dim' | 'dramatic' | 'natural') => void;
  clearScene: () => void;
  captureScreenshot: (width?: number, height?: number) => Promise<string | null>;
}

export const BabylonViewer = forwardRef<BabylonViewerHandle, BabylonViewerProps>(
  ({ onReady, onObjectClick }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManager = useBabylonScene(canvasRef);
    
    // Enable character controller
    useCharacterController(sceneManager?.getScene());

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getSceneManager: () => sceneManager,
      loadModel: async (url: string) => {
        if (sceneManager) {
          await sceneManager.loadModel(url);
        }
      },
      loadComposedScene: async (elements: LoadedSceneElement[], onProgress?: (loaded: number, total: number) => void) => {
        if (sceneManager) {
          await sceneManager.loadComposedScene(elements, onProgress);
        }
      },
      setCameraPosition: (pos: { x: number; y: number; z: number }) => {
        if (sceneManager) {
          sceneManager.setCameraPosition(pos);
        }
      },
      setAmbiance: (ambiance: 'bright' | 'dim' | 'dramatic' | 'natural') => {
        if (sceneManager) {
          sceneManager.setAmbiance(ambiance);
        }
      },
      clearScene: () => {
        if (sceneManager) {
          sceneManager.clearAllModels();
        }
      },
      captureScreenshot: async (width?: number, height?: number) => {
        if (!sceneManager) return null;
        return sceneManager.captureScreenshot(width, height);
      }
    }), [sceneManager]);

    // Notify when ready
    useEffect(() => {
      if (sceneManager && onReady) {
        onReady();
      }
    }, [sceneManager, onReady]);

    // Setup click handling
    useEffect(() => {
      if (!sceneManager || !onObjectClick) return;

      const scene = sceneManager.getScene();
      
      scene.onPointerDown = (evt, pickResult) => {
        // Only process left clicks
        if (evt.button !== 0) return;
        
        if (pickResult.hit && pickResult.pickedMesh) {
          const meshName = pickResult.pickedMesh.name;
          
          // Skip ground and grid
          if (meshName === 'ground' || meshName.startsWith('grid')) {
            return;
          }
          
          // Get element info from metadata
          const elementInfo = sceneManager.getElementFromMesh(pickResult.pickedMesh);
          const objectName = elementInfo?.name || meshName;
          
          onObjectClick(objectName, meshName);
        }
      };

      return () => {
        scene.onPointerDown = undefined!;
      };
    }, [sceneManager, onObjectClick]);

    return (
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          outline: 'none',
          display: 'block'
        }} 
      />
    );
  }
);

BabylonViewer.displayName = 'BabylonViewer';
