interface LoadingProgressProps {
  visible: boolean;
  progress: number;
  status: string;
  title?: string;
  elements?: Array<{ name: string; loaded: boolean }>;
}

export const LoadingProgress = ({ 
  visible, 
  progress, 
  status,
  title,
  elements = []
}: LoadingProgressProps) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 5, 15, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      backdropFilter: 'blur(20px)'
    }}>
      {/* Logo / Title */}
      <div style={{
        marginBottom: 40,
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: 300,
          letterSpacing: 8,
          color: 'white',
          fontFamily: "'Space Grotesk', system-ui, sans-serif"
        }}>
          OBVIAN
        </h1>
        {title && (
          <p style={{
            margin: '12px 0 0',
            fontSize: '1rem',
            color: '#6B8AFF',
            letterSpacing: 1
          }}>
            {title}
          </p>
        )}
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: 400,
        maxWidth: '80vw'
      }}>
        {/* Progress Bar */}
        <div style={{
          height: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 20
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6B8AFF 0%, #A78BFA 100%)',
            borderRadius: 2,
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 20px rgba(107, 138, 255, 0.5)'
          }} />
        </div>

        {/* Status Text */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30
        }}>
          <span style={{
            color: '#888',
            fontSize: '0.85rem',
            letterSpacing: 0.5
          }}>
            {status}
          </span>
          <span style={{
            color: '#6B8AFF',
            fontSize: '0.85rem',
            fontFamily: 'monospace'
          }}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Elements List */}
        {elements.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 12
            }}>
              Scene Elements
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {elements.map((el, i) => (
                <div 
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: el.loaded 
                      ? 'rgba(107, 255, 138, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: el.loaded ? '#6BFF8A' : '#555',
                    fontSize: '0.7rem'
                  }}>
                    {el.loaded ? '✓' : '○'}
                  </div>
                  <span style={{
                    color: el.loaded ? '#CCC' : '#666',
                    fontSize: '0.85rem',
                    transition: 'color 0.3s'
                  }}>
                    {el.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.3
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 2,
              height: 2,
              background: '#6B8AFF',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
