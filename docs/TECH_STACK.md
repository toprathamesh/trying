# OBVIAN - Tech Stack

Everything used and why.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend          │  Backend           │  External         │
├────────────────────┼────────────────────┼───────────────────┤
│  React 19          │  Vercel Serverless │  Google Gemini    │
│  TypeScript 5.9    │  Edge Runtime      │  Khronos glTF     │
│  Vite 7.2          │                    │                   │
│  Babylon.js 8.38   │                    │                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend

### React 19
**What:** UI library  
**Why:**
- Component-based architecture
- Hooks for state management
- Huge ecosystem
- Works seamlessly with Babylon.js via refs

**Used for:**
- All UI components (input bar, panels, overlays)
- State management (loading, scenes, annotations)
- Event handling

---

### TypeScript 5.9
**What:** Typed JavaScript  
**Why:**
- Catch errors at compile time
- Better IDE support (autocomplete, refactoring)
- Self-documenting code
- Essential for complex 3D math and API contracts

**Used for:**
- All source code
- Type definitions for 3D objects, API responses
- Interface contracts between services

---

### Vite 7.2
**What:** Build tool and dev server  
**Why:**
- Instant hot module replacement (HMR)
- Native ES modules (fast cold starts)
- Built-in TypeScript support
- Simple configuration
- Works great with Vercel

**Used for:**
- Development server
- Production builds
- Proxy configuration for local API testing

---

### Babylon.js 8.38
**What:** 3D rendering engine  
**Why:**
- Full-featured 3D engine (not just a renderer)
- Built-in physics, collisions, lighting
- Native glTF/GLB support
- First-class TypeScript support
- Better documentation than Three.js
- Highlight layer for hover effects

**Packages used:**
```json
"@babylonjs/core": "^8.38.0"      // Core engine
"@babylonjs/gui": "^8.38.0"       // 3D GUI elements
"@babylonjs/loaders": "^8.38.0"   // glTF loader
```

**Used for:**
- 3D scene rendering
- Camera controls (UniversalCamera)
- Model loading (SceneLoader)
- Collision detection
- Lighting (HemisphericLight, DirectionalLight)
- Hover highlighting (HighlightLayer)
- Fog and atmosphere

---

## Backend

### Vercel Serverless Functions
**What:** Edge-deployed API endpoints  
**Why:**
- Zero server management
- Automatic scaling
- Same deployment as frontend
- Edge runtime = fast globally
- Free tier is generous

**Files:**
```
api/
├── compose.ts    → POST /api/compose
└── annotate.ts   → POST /api/annotate
```

**Used for:**
- Secure Gemini API calls (key never exposed to browser)
- Request/response handling
- Error handling and fallbacks

---

### Edge Runtime
**What:** Vercel's lightweight serverless runtime  
**Why:**
- Faster cold starts than Node.js
- Global deployment (runs close to users)
- Lower latency for API calls

**Config:**
```typescript
export const config = {
  runtime: 'edge',
};
```

---

## External Services

### Google Gemini 2.0 Flash
**What:** Google's latest AI model  
**Why:**
- Fast responses (optimized for speed)
- Strong instruction following
- JSON mode for structured output
- Free tier available
- Better than GPT for structured scene composition

**Model:** `gemini-2.0-flash-exp`

**Used for:**
1. **Scene Composition** - Understanding queries and creating multi-object layouts
2. **Object Annotation** - Generating educational explanations

**SDK:**
```json
"@google/generative-ai": "latest"
```

---

### Khronos glTF Sample Models
**What:** Official glTF test models  
**Why:**
- CC0 license (free, no attribution)
- High quality
- Reliable CDN (GitHub raw)
- Standard format (GLB)

**URL Pattern:**
```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/{ModelName}/glTF-Binary/{ModelName}.glb
```

**Used for:**
- All 3D models in the current version
- Fallback when search fails

---

## File-by-File Breakdown

### `/src/App.tsx`
**Purpose:** Main application component  
**Dependencies:** React, all components, SceneComposer  
**Responsibilities:**
- State management (loading, scene, annotations)
- User input handling
- Coordinating components

---

### `/src/services/geminiService.ts`
**Purpose:** API client for Gemini endpoints  
**Dependencies:** Fetch API  
**Responsibilities:**
- Call `/api/compose` for scene composition
- Call `/api/annotate` for object explanations
- Handle errors with fallbacks

---

### `/src/services/polyPizzaService.ts`
**Purpose:** 3D model search  
**Dependencies:** None (pure TypeScript)  
**Responsibilities:**
- Map search terms to model URLs
- Keyword synonyms (dog → fox)
- Fallback model (box)

---

### `/src/services/sceneComposer.ts`
**Purpose:** Orchestrate scene creation  
**Dependencies:** GeminiService, PolyPizzaService  
**Responsibilities:**
- Take user query
- Get composition from Gemini
- Find models for each element
- Return ready-to-load scene

---

### `/src/services/babylonService.ts`
**Purpose:** 3D engine wrapper  
**Dependencies:** Babylon.js  
**Responsibilities:**
- Scene setup (ground, lights, fog)
- Model loading and positioning
- Camera configuration
- Collision detection
- Hover highlighting

---

### `/src/hooks/useCharacterController.ts`
**Purpose:** First-person movement  
**Dependencies:** Babylon.js, React  
**Responsibilities:**
- WASD key handling
- Movement speed (walk/run)
- Camera-relative movement

---

### `/src/components/v2/BabylonViewer.tsx`
**Purpose:** 3D canvas component  
**Dependencies:** Babylon.js, React  
**Responsibilities:**
- Render canvas element
- Initialize scene manager
- Expose methods via ref
- Handle click events

---

## Why Not Alternatives?

### Why Babylon.js over Three.js?
- Better TypeScript support
- Built-in collision system
- HighlightLayer for hover effects
- More complete engine (Three.js is lower-level)

### Why Vite over Create React App?
- 10x faster HMR
- Native ES modules
- Better build performance
- Simpler configuration

### Why Gemini over OpenAI?
- Free tier with generous limits
- Better structured output (JSON mode)
- Faster for this use case
- gemini-2.0-flash is optimized for speed

### Why Vercel over AWS/Firebase?
- Zero configuration deployment
- Frontend + API in one place
- Automatic HTTPS
- Great free tier
- Edge functions are fast

---

## Performance Considerations

### Bundle Size
Main chunk is ~6MB (Babylon.js is large). Mitigations:
- Code splitting for loaders
- Tree shaking enabled
- Dynamic imports possible

### Model Loading
GLB files are 100KB-5MB each. Mitigations:
- Parallel loading
- Progress indicators
- Future: IndexedDB caching

### API Latency
Gemini calls take 1-3 seconds. Mitigations:
- Edge runtime (global)
- Streaming possible (not implemented)
- Fallback responses

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | Vercel | Gemini API authentication |

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| API | `vercel dev` (local) | Vercel Edge |
| Frontend | Vite dev server | Static files on CDN |
| API Key | `.env` file | Vercel env vars |
| URL | `localhost:3000` | `your-app.vercel.app` |

