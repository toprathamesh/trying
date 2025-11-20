import React from 'react';

interface ControlsOverlayProps {
  mobile: boolean;
  onMove: (direction: {x: number, y: number}) => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ mobile, onMove }) => {
  if (!mobile) return null;

  return (
    <div className="controls-overlay" style={{ position: 'absolute', bottom: 20, left: 20 }}>
       {/* Mobile Joystick Placeholder */}
       <div style={{ 
         width: 100, 
         height: 100, 
         background: 'rgba(255,255,255,0.2)', 
         borderRadius: '50%',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
       }}>
          <div style={{ width: 40, height: 40, background: 'white', borderRadius: '50%' }} />
       </div>
    </div>
  );
};

