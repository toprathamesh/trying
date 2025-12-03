# OBVIAN - Tech Stack

Everything used and why.

---

## Overview

**OBVIAN is an AI‑native explorable world engine for learning and search.**  
You ask a question (by text or voice), and the system composes an **interactive 3D scene + narration**, running on the web today and designed to extend to **WebXR/AR headsets and, eventually, glasses**.

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend          │  Backend           │  External         │
├────────────────────┼────────────────────┼───────────────────┤
│  React 19          │  Vercel Serverless │  Google Gemini    │
│  TypeScript 5.9    │  Edge Runtime      │  Poly Pizza 3D    │
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

### Google Gemini 2.5 Flash-Lite (Preview)
**What:** Google's fastest multimodal AI model  
**Why:**
- Ultra-fast responses (~100-300ms for simple tasks)
- **Supports image understanding** - can see thumbnails and validate layouts
- 1 million token context window
- Structured JSON output
- Free tier available
- Perfect for high-throughput educational apps

**Model Used:**

- `gemini-2.5-flash-lite-preview-09-2025` – used for **everything** (scene composition, annotation, and visual validation).  
  There are **no model fallbacks**: if Gemini fails, the app surfaces the real error and raw JSON for debugging.

**Capabilities:**
- ✅ Text, Image, Video, Audio, PDF input
- ✅ Up to 3,000 images per request
- ✅ Object detection & spatial understanding
- ✅ Structured outputs (JSON mode)
- ✅ Function calling

**Used for:**
1. **Scene Composition** – Understanding queries and creating multi‑object layouts as JSON.
2. **Object Annotation** – Generating educational explanations and related topics.
3. **Visual Validation (planned)** – Analyzing rendered scene images and thumbnails to refine spatial arrangement and scaling.

**SDK:**
```json
"@google/generative-ai": "^0.24.1"
```

---

### Poly Pizza 3D Library
**What:** Large public library of CC0 low‑poly 3D models  
**Why:**
- CC0 license (free, no attribution)
- 10k+ models across many everyday categories (animals, food, vehicles, buildings, etc.)
- GLB format that Babylon.js can load directly
- Great for educational, stylized, and browser‑friendly scenes

**Used for:**
- All 3D models in the current version (no other model library is used)
- Search is proxied via `/api/search-models` to avoid CORS and hide the Poly Pizza API key
- GLB downloads are proxied via `/api/proxy-model` for CORS‑safe loading and caching

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
- Call `/api/compose` for scene composition (Gemini 2.5 Flash‑Lite)
- Call `/api/annotate` for object explanations
- Surface raw errors and Gemini JSON back to the UI (no static fallbacks)

---

### `/src/services/polyPizzaService.ts`
**Purpose:** 3D model search via backend proxy  
**Dependencies:** Browser Fetch API  
**Responsibilities:**
- Call `/api/search-models` for Poly Pizza search
- Normalize search terms and results into a consistent `PolyPizzaModel` shape
- Convert Poly Pizza download URLs into `/api/proxy-model` URLs for CORS‑safe loading

---

### `/src/services/sceneComposer.ts`
**Purpose:** Orchestrate scene creation  
**Dependencies:** GeminiService, PolyPizzaService  
**Responsibilities:**
- Take user query (text or voice transcript)
- Get composition JSON from Gemini
- Resolve models for each element via Poly Pizza
- Return a ready‑to‑load scene, streaming progress as elements are found/loaded

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

