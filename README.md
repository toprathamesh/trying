# 🎨 OBVIAN - Immersive 3D Learning Platform

**Transform how you learn.** Instead of reading about concepts, step into explorable 3D worlds and experience them in first-person.

![OBVIAN Screenshot](docs/screenshot.png)

## ✨ Features

### 🧠 AI-Powered Scene Composition
Ask anything, and Gemini AI will compose a scene with multiple 3D objects intelligently positioned:
- *"Show me a rainforest ecosystem"* → Trees, animals, water features, all placed naturally
- *"The solar system"* → Sun and planets at appropriate scales and positions
- *"Medieval castle"* → Building with towers, gates, and surrounding elements

### 🎮 First-Person Exploration
- **WASD** - Move around the scene
- **Mouse** - Look around
- **Shift** - Run
- **Click** - Inspect any object for AI-powered explanations

### 💡 Smart Annotations
Click any object and Gemini provides:
- Educational explanations
- Fun facts
- Related topics to explore

### 🏛️ Open-Source 3D Model Library
Uses CC0 3D models from:
- Khronos glTF Sample Models
- Poly Pizza API (fallback)
- More sources coming soon!

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Get a Gemini API Key
- Visit [Google AI Studio](https://aistudio.google.com/apikey)
- Create a new API key
- Copy it

### 3. Run the App
```bash
npm run dev
```

### 4. Enter Your API Key
- Open http://localhost:5173
- Enter your Gemini API key
- Click "Start Exploring"

### 5. Try These Queries
- "A dog playing in a park"
- "Solar system with planets"
- "Medieval castle"
- "Rainforest ecosystem"

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React + TypeScript                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  App.tsx    │  │ BabylonViewer│  │ AnnotationPanel  │   │
│  │  (State)    │  │ (3D Canvas)  │  │ (AI Explanations)│   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼──────────────────┼──────────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Services Layer                           │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │SceneComposer │  │ GeminiService │  │ PolyPizzaService│  │
│  │(Orchestrator)│  │(AI Generation)│  │(3D Model Search)│  │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Babylon.js Engine                        │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │Scene Manager │  │CharacterControl│  │ Highlight Layer│   │
│  │(Model Loading)│ │(WASD + Mouse)  │  │(Hover Effects) │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **3D Engine**: Babylon.js 8.x
- **AI**: Google Gemini 2.0 Flash
- **3D Assets**: Khronos glTF Samples, Poly Pizza API
- **Styling**: CSS-in-JS with custom theming

## 📁 Project Structure

```
src/
├── components/
│   └── v2/
│       ├── BabylonViewer.tsx    # 3D canvas component
│       ├── AnnotationPanel.tsx  # AI annotation UI
│       ├── ControlsOverlay.tsx  # WASD hints
│       └── LoadingProgress.tsx  # Loading screen
├── services/
│   ├── geminiService.ts         # Gemini AI integration
│   ├── polyPizzaService.ts      # 3D model search
│   ├── sceneComposer.ts         # Orchestrator
│   └── babylonService.ts        # 3D scene manager
├── hooks/
│   ├── useBabylonScene.ts       # Scene hook
│   └── useCharacterController.ts # Movement hook
├── App.tsx                       # Main application
└── style.css                     # Global styles
```

## 🎯 Modes

### AI Compose Mode
Gemini analyzes your query and creates a multi-object scene:
1. Understands what you want to explore
2. Determines which 3D models to include
3. Calculates intelligent positioning
4. Loads models from the library
5. Sets up camera and ambiance

### Quick Search Mode
Directly search for a single 3D model:
- "fox" → Loads a fox model
- "dragon" → Loads a dragon model
- "car" → Loads a car model

## 🎨 Design Philosophy

OBVIAN follows a **museum exhibit** design approach:
- Objects are positioned naturally, like a diorama
- Lighting creates atmosphere and depth
- Interactive elements invite exploration
- AI annotations provide context

## 🔮 Roadmap

### Phase 1 (Current) ✅
- [x] Babylon.js integration
- [x] Gemini scene composition
- [x] 3D model library (Khronos)
- [x] First-person controls
- [x] Click-to-annotate

### Phase 2 (Planned)
- [ ] AI-generated 3D models (FLUX/Meshy integration)
- [ ] Voice input for queries
- [ ] Mobile touch controls
- [ ] Model caching (IndexedDB)

### Phase 3 (Future)
- [ ] Multi-user exploration
- [ ] VR/AR support
- [ ] Curriculum-aligned content
- [ ] Teacher dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - Use freely for educational purposes!

## 🙏 Acknowledgments

- [Babylon.js](https://www.babylonjs.com/) - Incredible 3D engine
- [Google Gemini](https://ai.google.dev/) - AI scene composition
- [Khronos glTF Samples](https://github.com/KhronosGroup/glTF-Sample-Models) - CC0 3D models
- [falcraft](https://github.com/blendi-remade/falcraft) - Inspiration for AI-powered 3D generation

---

**Built with ❤️ for the future of immersive learning**

*"Step into knowledge. Explore. Understand."*

