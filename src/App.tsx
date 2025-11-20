import { useState } from 'react'
import { BabylonViewer } from './components/v2/BabylonViewer'
import { ModelGenerationService } from './services/generationService'

// Initialize services
const generationService = new ModelGenerationService();

function App() {
  const [modelUrl, setModelUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<'library' | 'generate'>('library');
  const [statusMessage, setStatusMessage] = useState("");

  const handleAction = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setModelUrl(undefined); // Clear current model
    
    try {
      let url: string | null = null;

      if (mode === 'library') {
        setStatusMessage(`Searching library for "${inputValue}"...`);
        // Simulate search time slightly
        await new Promise(r => setTimeout(r, 500)); 
        url = await generationService.searchLibrary(inputValue);
        
        if (!url) {
          setStatusMessage(`No exact match found in library. Try 'duck', 'helmet', 'boombox', 'car'...`);
          setLoading(false);
          return;
        }
        setStatusMessage("Found in library!");
      } else {
        setStatusMessage(`Generating model for "${inputValue}" with AI...`);
        url = await generationService.generateWithFLUX(inputValue);
        setStatusMessage("Generation complete!");
      }

      if (url) {
        console.log("Loading URL:", url);
        setModelUrl(url);
      }
    } catch (error) {
      console.error("Operation failed:", error);
      setStatusMessage("Error occurred. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <BabylonViewer 
        modelUrl={modelUrl} 
        onReady={() => console.log('Scene ready')} 
        onObjectClick={(name) => console.log('Clicked:', name)}
      />
      
      {/* Main UI Overlay */}
      <div style={{ 
        position: 'absolute', 
        bottom: 40, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '90%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 100 
      }}>
        
        {/* Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
          <button 
            onClick={() => setMode('library')}
            style={{
              background: mode === 'library' ? '#646cff' : 'rgba(0,0,0,0.6)',
              color: 'white',
              border: mode === 'library' ? '2px solid white' : '1px solid #555',
              padding: '8px 16px',
              borderRadius: '20px',
              opacity: mode === 'library' ? 1 : 0.7
            }}
          >
            📚 Search Library
          </button>
          <button 
            onClick={() => setMode('generate')}
            style={{
              background: mode === 'generate' ? '#d946ef' : 'rgba(0,0,0,0.6)',
              color: 'white',
              border: mode === 'generate' ? '2px solid white' : '1px solid #555',
              padding: '8px 16px',
              borderRadius: '20px',
              opacity: mode === 'generate' ? 1 : 0.7
            }}
          >
            ✨ Generate (AI)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'library' ? "Search existing models (e.g. 'duck', 'helmet')" : "Describe what to generate..."}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '24px',
              border: 'none',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          />
          <button 
            onClick={handleAction}
            disabled={loading}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '24px',
              background: loading ? '#555' : (mode === 'library' ? '#646cff' : '#d946ef'),
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              cursor: loading ? 'default' : 'pointer',
              minWidth: '100px'
            }}
          >
            {loading ? '...' : (mode === 'library' ? 'Search' : 'Create')}
          </button>
        </div>

        {statusMessage && (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '0.9rem',
            background: 'rgba(0,0,0,0.5)',
            padding: '5px 10px',
            borderRadius: '10px',
            alignSelf: 'center'
          }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Top Left Info */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>OBVIAN 2.0</h1>
        <p style={{ color: '#ddd', fontSize: '0.9rem', margin: '5px 0 0 0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          Phase 2: Hybrid Asset Pipeline
        </p>
      </div>
    </div>
  )
}

export default App
