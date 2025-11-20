import { useEffect, useState } from 'react';
import { BabylonSceneManager } from '../services/babylonService';

export function useBabylonScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [sceneManager, setSceneManager] = useState<BabylonSceneManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const manager = new BabylonSceneManager(canvasRef.current);
    setSceneManager(manager);

    return () => {
      manager.dispose();
    };
  }, [canvasRef]); // Re-run if canvas ref changes (should be stable)

  return sceneManager;
}

