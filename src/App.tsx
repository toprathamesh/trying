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
          setStatusMessage(`No exact match found. Try 'duck', 'helmet', 'boombox', 'car'...`);
          setLoading(false);
          return;
        }
        setStatusMessage("Found in library!");
      } else {
        setStatusMessage(`Generating model for "${inputValue}"...`);
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
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
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
        gap: '15px',
        zIndex: 100 
      }}>
        
        {/* Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={() => setMode('library')}
            style={{
              background: mode === 'library' ? '#ffffff' : 'transparent',
              color: mode === 'library' ? '#000000' : '#ffffff',
              border: '1px solid #ffffff',
              padding: '8px 20px',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.8rem'
            }}
          >
            Library
          </button>
          <button 
            onClick={() => setMode('generate')}
            style={{
              background: mode === 'generate' ? '#ffffff' : 'transparent',
              color: mode === 'generate' ? '#000000' : '#ffffff',
              border: '1px solid #ffffff',
              padding: '8px 20px',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.8rem'
            }}
          >
            Generate
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'library' ? "Search..." : "Describe..."}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '2px',
              border: '1px solid #333',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          />
          <button 
            onClick={handleAction}
            disabled={loading}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '2px',
              background: loading ? '#333333' : '#ffffff',
              color: loading ? '#888888' : '#000000',
              border: '1px solid #ffffff',
              fontWeight: 'bold',
              cursor: loading ? 'default' : 'pointer',
              minWidth: '100px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {loading ? '...' : 'GO'}
          </button>
        </div>

        {statusMessage && (
          <div style={{ 
            textAlign: 'center', 
            color: '#888', 
            fontSize: '0.8rem',
            marginTop: '5px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Top Left Info */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'normal' }}>TRYING</h1>
        <p style={{ color: '#666', fontSize: '0.8rem', margin: '5px 0 0 0', letterSpacing: '1px' }}>
          EXPERIMENTAL
        </p>
      </div>
    </div>
  )
}

export default App
