import type { ObjectAnnotation } from '../../services/geminiService';

interface AnnotationPanelProps {
  annotation: ObjectAnnotation | null;
  objectName: string;
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onRelatedClick: (topic: string) => void;
}

export const AnnotationPanel = ({ 
  annotation, 
  objectName, 
  visible, 
  loading,
  onClose,
  onRelatedClick 
}: AnnotationPanelProps) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 340,
      background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%)',
      borderRadius: 16,
      padding: 24,
      zIndex: 200,
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16
      }}>
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: '#6B8AFF',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 4
          }}>
            Inspecting
          </div>
          <h3 style={{
            margin: 0,
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: 600,
            fontFamily: "'Space Grotesk', system-ui, sans-serif"
          }}>
            {loading ? objectName : (annotation?.title || objectName)}
          </h3>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#888',
            width: 28,
            height: 28,
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#888';
          }}
        >
          ×
        </button>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '30px 0'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(107, 138, 255, 0.2)',
            borderTopColor: '#6B8AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            marginTop: 16,
            color: '#888',
            fontSize: '0.85rem'
          }}>
            Generating explanation...
          </div>
        </div>
      ) : annotation ? (
        <>
          {/* Explanation */}
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <p style={{
              margin: 0,
              color: '#E0E0E0',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}>
              {annotation.explanation}
            </p>
          </div>

          {/* Fun Fact */}
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: 'linear-gradient(135deg, rgba(107, 138, 255, 0.15) 0%, rgba(107, 138, 255, 0.05) 100%)',
            borderRadius: 12,
            border: '1px solid rgba(107, 138, 255, 0.2)'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#6B8AFF',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>💡</span> Fun Fact
            </div>
            <p style={{
              margin: 0,
              color: '#C0C8FF',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              fontStyle: 'italic'
            }}>
              {annotation.funFact}
            </p>
          </div>

          {/* Related Topics */}
          {annotation.relatedTopics && annotation.relatedTopics.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.7rem',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 10
              }}>
                Explore Related
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8
              }}>
                {annotation.relatedTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => onRelatedClick(topic)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#AAA',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(107, 138, 255, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(107, 138, 255, 0.4)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#AAA';
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
