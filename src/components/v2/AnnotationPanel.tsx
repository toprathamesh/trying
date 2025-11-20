import React from 'react';

interface AnnotationPanelProps {
  content: string;
  position: { x: number; y: number };
  visible: boolean;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ content, position, visible }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '200px',
      pointerEvents: 'none', // Let clicks pass through?
      transform: 'translate(-50%, -100%)', // Center above point
      marginTop: '-10px'
    }}>
      {content}
    </div>
  );
};

