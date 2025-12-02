import { useState, useRef, useCallback, useEffect } from 'react';
import { BabylonViewer } from './components/v2/BabylonViewer';
import type { BabylonViewerHandle } from './components/v2/BabylonViewer';
import { AnnotationPanel } from './components/v2/AnnotationPanel';
import { ControlsOverlay } from './components/v2/ControlsOverlay';
import { LoadingProgress } from './components/v2/LoadingProgress';
import { SceneComposer } from './services/sceneComposer';
import type { ComposedScene } from './services/sceneComposer';
import type { ObjectAnnotation } from './services/geminiService';
import { speechService } from './services/speechService';

// Initialize scene composer (no API key needed - backend handles it)
const sceneComposer = new SceneComposer();

function App() {
  // Core state
  const viewerRef = useRef<BabylonViewerHandle>(null);
  const isComposingRef = useRef(false); // Track if currently composing (prevents race conditions)
  
  // UI state
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'compose' | 'quick'>('compose');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState<ComposedScene | null>(null);
  const [showControls, setShowControls] = useState(true);
  
  // Annotation state
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotationLoading, setAnnotationLoading] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<ObjectAnnotation | null>(null);
  const [clickedObjectName, setClickedObjectName] = useState('');
  
  // Speech state
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  // Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([
    'A dog playing in a park',
    'Solar system with planets',
    'Medieval castle',
    'Rainforest ecosystem',
    'Human brain anatomy'
  ]);

  // Handle scene composition - accepts optional query to avoid stale state
  const handleCompose = useCallback(async (queryOverride?: string) => {
    const query = queryOverride || inputValue;
    if (!query.trim() || !viewerRef.current) return;
    
    // Stop any ongoing voice recognition or speech
    speechService.stopListening();
    speechService.stop();
    setIsListening(false);
    
    // If already composing, don't start a new composition (use ref to avoid stale closure)
    if (isComposingRef.current) {
      console.log('Already composing, skipping...');
      return;
    }
    
    isComposingRef.current = true;
    setIsLoading(true);
    setShowAnnotation(false);
    setCurrentAnnotation(null);
    
    // Update input value if using override
    if (queryOverride) {
      setInputValue(queryOverride);
    }
    
    try {
      if (mode === 'compose') {
        // AI-composed scene with multiple elements
        const scene = await sceneComposer.composeFromQuery(query, (update) => {
          setLoadingStatus(
            update.status === 'loading' 
              ? 'Asking AI to compose your scene...'
              : update.status === 'partial'
                ? `Finding 3D models (${update.elements.filter(e => e.loaded).length}/${update.elements.length})...`
                : 'Complete!'
          );
          setLoadingProgress(update.progress);
          setCurrentScene(update);
        });
        
        // Load the scene into Babylon
        setLoadingStatus('Loading 3D models into scene...');
        await viewerRef.current.loadComposedScene(scene.elements, (loaded, total) => {
          setLoadingProgress(80 + (20 * loaded / total));
          setLoadingStatus(`Loading models (${loaded}/${total})...`);
        });
        
        // Set camera and ambiance
        viewerRef.current.setCameraPosition(scene.composition.cameraPosition);
        viewerRef.current.setAmbiance(scene.composition.ambiance);
        
        // Get related suggestions
        const related = await sceneComposer.getRelatedSuggestions();
        if (related.length > 0) {
          setSuggestions(related);
        }
        
      } else {
        // Quick mode - just search and load single model
        setLoadingStatus('Searching for model...');
        setLoadingProgress(30);
        
        const scene = await sceneComposer.quickCompose(query);
        setCurrentScene(scene);
        
        setLoadingStatus('Loading 3D model...');
        setLoadingProgress(60);
        
        await viewerRef.current.loadComposedScene(scene.elements);
        
        setLoadingProgress(100);
      }
      
    } catch (error) {
      console.error('Composition failed:', error);
      setLoadingStatus('Error: ' + (error as Error).message);
    } finally {
      isComposingRef.current = false;
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  }, [inputValue, mode]);

  // Handle object click
  const handleObjectClick = useCallback(async (objectName: string, meshName: string) => {
    setClickedObjectName(objectName);
    setShowAnnotation(true);
    setAnnotationLoading(true);
    setCurrentAnnotation(null);
    
    // Stop any current speech
    speechService.stop();
    
    try {
      const annotation = await sceneComposer.annotateObject(objectName, meshName);
      setCurrentAnnotation(annotation);
      
      // Speak the annotation if speech is enabled
      if (speechEnabled && annotation) {
        speechService.speakAnnotation(annotation);
      }
    } catch (error) {
      console.error('Annotation failed:', error);
    } finally {
      setAnnotationLoading(false);
    }
  }, [speechEnabled]);

  // Handle related topic click
  const handleRelatedClick = useCallback((topic: string) => {
    setInputValue(topic);
    setShowAnnotation(false);
    speechService.stop();
  }, []);
  
  // Handle annotation close
  const handleAnnotationClose = useCallback(() => {
    setShowAnnotation(false);
    speechService.stop();
  }, []);
  
  // Toggle speech output
  const handleSpeechToggle = useCallback(() => {
    const newState = speechService.toggle();
    setSpeechEnabled(newState);
  }, []);
  
  // Voice input - listen for commands
  const handleVoiceInput = useCallback(async () => {
    if (!speechService.isRecognitionSupported()) {
      alert('Voice input is not supported in this browser. Try Chrome!');
      return;
    }
    
    // If already listening, stop it
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }
    
    // Don't start if already composing (let current composition finish)
    if (isComposingRef.current) {
      console.log('Already composing, please wait...');
      return;
    }
    
    try {
      setIsListening(true);
      // Stop any current speech output
      speechService.stop();
      
      const transcript = await speechService.listen();
      setIsListening(false);
      
      if (transcript && transcript.trim()) {
        const cleanTranscript = transcript.trim();
        console.log('🎤 Voice input received:', cleanTranscript);
        
        // Update input field
        setInputValue(cleanTranscript);
        
        // Auto-submit immediately with the transcript directly (don't wait for state)
        handleCompose(cleanTranscript);
      } else {
        console.log('🎤 Empty transcript, ignoring');
      }
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
    }
  }, [isListening, handleCompose]);

  // Hide controls after initial period
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative', 
      backgroundColor: '#000',
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* 3D Scene */}
      <BabylonViewer 
        ref={viewerRef}
        onReady={() => console.log('Scene ready')} 
        onObjectClick={handleObjectClick}
      />
      
      {/* Loading Screen */}
      <LoadingProgress
        visible={isLoading}
        progress={loadingProgress}
        status={loadingStatus}
        title={currentScene?.composition.title}
        elements={currentScene?.elements.map(e => ({ 
          name: e.name, 
          loaded: e.loaded 
        })) || []}
      />
      
      {/* Annotation Panel */}
      <AnnotationPanel
        annotation={currentAnnotation}
        objectName={clickedObjectName}
        visible={showAnnotation}
        loading={annotationLoading}
        onClose={handleAnnotationClose}
        onRelatedClick={handleRelatedClick}
      />
      
      {/* Controls Hint */}
      <ControlsOverlay showHint={showControls} />
      
      {/* Scene Info (top left) */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        left: 24, 
        zIndex: 100, 
        pointerEvents: 'none' 
      }}>
        <h1 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: '1.4rem', 
          letterSpacing: 3, 
          fontWeight: 300,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)'
        }}>
          OBVIAN
        </h1>
        {currentScene && (
          <>
            <p style={{ 
              color: '#6B8AFF', 
              fontSize: '0.85rem', 
              margin: '6px 0 0', 
              letterSpacing: 1 
            }}>
              {currentScene.composition.title}
            </p>
            <p style={{ 
              color: '#666', 
              fontSize: '0.75rem', 
              margin: '4px 0 0',
              maxWidth: 300,
              lineHeight: 1.4
            }}>
              {currentScene.composition.description}
            </p>
          </>
        )}
      </div>
      
      {/* Main Input UI */}
      <div style={{ 
        position: 'absolute', 
        bottom: 30, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '90%',
        maxWidth: 700,
        zIndex: 100 
      }}>
        {/* Suggestions */}
        {!isLoading && !currentScene && suggestions.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            {suggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(s);
                  setTimeout(handleCompose, 50);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 20,
                  padding: '8px 16px',
                  color: '#AAA',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
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
                {s}
              </button>
            ))}
          </div>
        )}
        
        {/* Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4,
          marginBottom: 12,
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 25,
          padding: 4,
          width: 'fit-content',
          margin: '0 auto 12px',
          backdropFilter: 'blur(10px)'
        }}>
          <button 
            onClick={() => setMode('compose')}
            style={{
              background: mode === 'compose' 
                ? 'linear-gradient(135deg, #6B8AFF 0%, #A78BFA 100%)'
                : 'transparent',
              color: mode === 'compose' ? 'white' : '#888',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: 0.5
            }}
          >
            AI Compose
          </button>
          <button 
            onClick={() => setMode('quick')}
            style={{
              background: mode === 'quick' 
                ? 'linear-gradient(135deg, #6B8AFF 0%, #A78BFA 100%)'
                : 'transparent',
              color: mode === 'quick' ? 'white' : '#888',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: 0.5
            }}
          >
            Quick Search
          </button>
        </div>

        {/* Input Bar */}
        <div style={{ 
          display: 'flex', 
          gap: 10,
          background: 'rgba(15, 15, 25, 0.9)',
          borderRadius: 16,
          padding: 6,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Microphone Button */}
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: isListening 
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              cursor: isLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            🎤
          </button>
          
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening 
              ? "Listening..."
              : mode === 'compose' 
                ? "What would you like to explore? (e.g., 'The solar system')"
                : "Search for a 3D model (e.g., 'fox', 'car', 'dragon')"
            }
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'transparent',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCompose()}
          />
          <button 
            onClick={handleCompose}
            disabled={isLoading || !inputValue.trim()}
            style={{ 
              padding: '14px 28px', 
              borderRadius: 12,
              background: (!isLoading && inputValue.trim())
                ? 'linear-gradient(135deg, #6B8AFF 0%, #A78BFA 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: (!isLoading && inputValue.trim()) ? 'pointer' : 'default',
              fontSize: '0.9rem',
              letterSpacing: 1,
              transition: 'all 0.2s',
              boxShadow: (!isLoading && inputValue.trim())
                ? '0 4px 20px rgba(107, 138, 255, 0.4)'
                : 'none'
            }}
          >
            {isLoading ? '...' : 'Explore'}
          </button>
        </div>
        
        <p style={{
          textAlign: 'center',
          color: '#555',
          fontSize: '0.7rem',
          marginTop: 10,
          letterSpacing: 0.5
        }}>
          {mode === 'compose' 
            ? 'AI will compose a scene with multiple 3D objects' 
            : 'Quickly search and load a single 3D model'}
        </p>
      </div>

      {/* Side Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 100
      }}>
        {/* Speech Toggle Button */}
        <button
          onClick={handleSpeechToggle}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: speechEnabled 
              ? 'rgba(107, 138, 255, 0.2)' 
              : 'rgba(255, 255, 255, 0.08)',
            border: speechEnabled 
              ? '1px solid rgba(107, 138, 255, 0.4)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: speechEnabled ? '#6B8AFF' : '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            transition: 'all 0.2s'
          }}
          title={speechEnabled ? 'Disable voice' : 'Enable voice'}
        >
          {speechEnabled ? '🔊' : '🔇'}
        </button>
        
        {/* Toggle Controls Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
          }}
          title="Toggle controls"
        >
          ?
        </button>
      </div>

      {/* Import Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}

export default App;
