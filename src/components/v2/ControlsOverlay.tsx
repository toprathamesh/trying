interface ControlsOverlayProps {
  showHint?: boolean;
}

export const ControlsOverlay = ({ showHint = true }: ControlsOverlayProps) => {
  if (!showHint) return null;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 120,
      left: 20,
      padding: '16px 20px',
      background: 'rgba(10, 10, 20, 0.8)',
      borderRadius: 12,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      zIndex: 100,
      maxWidth: 220
    }}>
      <div style={{
        fontSize: '0.65rem',
        color: '#6B8AFF',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12
      }}>
        Controls
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ControlItem 
          keys={['W', 'A', 'S', 'D']} 
          action="Move" 
        />
        <ControlItem 
          keys={['Mouse']} 
          action="Look around" 
        />
        <ControlItem 
          keys={['Shift']} 
          action="Run" 
        />
        <ControlItem 
          keys={['Click']} 
          action="Inspect object" 
        />
      </div>
    </div>
  );
};

interface ControlItemProps {
  keys: string[];
  action: string;
}

const ControlItem = ({ keys, action }: ControlItemProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10
  }}>
    <div style={{
      display: 'flex',
      gap: 3
    }}>
      {keys.map((key, i) => (
        <span
          key={i}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 4,
            padding: '3px 7px',
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: '#CCC',
            minWidth: key.length > 1 ? 'auto' : 20,
            textAlign: 'center',
            boxShadow: '0 2px 0 rgba(0,0,0,0.3)'
          }}
        >
          {key}
        </span>
      ))}
    </div>
    <span style={{
      fontSize: '0.75rem',
      color: '#888'
    }}>
      {action}
    </span>
  </div>
);
