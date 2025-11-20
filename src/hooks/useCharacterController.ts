import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

export function useCharacterController(scene: BABYLON.Scene | undefined) {
  const keys = useRef({
    w: false, a: false, s: false, d: false,
    shift: false, space: false
  });
  
  useEffect(() => {
    if (!scene) return;

    // Keyboard listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key in keys.current) {
          keys.current[key as keyof typeof keys.current] = false;
        }
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    const walkSpeed = 5;
    const runSpeed = 10;
    // const jumpSpeed = 8; // Not implementing gravity/physics jump fully yet without physics engine enabled
    
    // Movement loop
    const observer = scene.onBeforeRenderObservable.add(() => {
      if (!scene.activeCamera) return;
      
      const camera = scene.activeCamera as BABYLON.UniversalCamera;
      const deltaTime = scene.getEngine().getDeltaTime() / 1000;
      const speed = keys.current.shift ? runSpeed : walkSpeed;
      
      // We need to ensure we are moving relative to camera view but constrained to XZ plane mostly
      // UniversalCamera handles basic movement, but we are overriding/augmenting it here.
      // If we want PURE manual control, we should detach default keyboard control from camera.
      // But for now, let's just apply the translation manually if we want "game-like" strafing.
      
      // Note: UniversalCamera.attachControl already adds WASD support. 
      // If we want to ADD to it (like sprint), we can. 
      // If we want to REPLACE it, we should remove keys from camera.keysUp, etc.
      
      // For this implementation, let's assume we want to handle it manually to support Sprint (Shift).
      // To avoid conflict, we might want to clear default keys if we rely solely on this.
      // But let's just implement the logic:

      const forward = camera.getDirection(BABYLON.Axis.Z);
      const right = camera.getDirection(BABYLON.Axis.X);
      
      // Flatten vectors to XZ plane for walking
      forward.y = 0;
      forward.normalize();
      right.y = 0;
      right.normalize();

      if (keys.current.w) {
        camera.position.addInPlace(forward.scale(speed * deltaTime));
      }
      if (keys.current.s) {
        camera.position.subtractInPlace(forward.scale(speed * deltaTime));
      }
      if (keys.current.a) {
        camera.position.subtractInPlace(right.scale(speed * deltaTime));
      }
      if (keys.current.d) {
        camera.position.addInPlace(right.scale(speed * deltaTime));
      }
      
      // Simple Jump (very basic, no physics engine)
      /*
      if (keys.current.space) {
        camera.position.y += speed * deltaTime;
      }
      */
    });
    
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      scene.onBeforeRenderObservable.remove(observer);
    };
  }, [scene]);
}

