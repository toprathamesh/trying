# OBVIAN - Current State

**Last Updated:** December 3, 2025  
**Version:** 0.2.0 (Web MVP with Poly Pizza + Voice)

---

## What's Working Now

### ✅ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| 3D Scene Rendering | ✅ Complete | Babylon.js powered 3D environment with sky-blue background, green ground, lighting, fog |
| First-Person Controls | ✅ Complete | WASD movement, mouse look, Shift to run |
| AI Scene Composition | ✅ Complete | Gemini 2.5 Flash-Lite composes multi-object scenes from queries (JSON only, no fallbacks) |
| 3D Model Loading | ✅ Complete | Loads GLB models from Poly Pizza via backend proxy (`/api/search-models`, `/api/proxy-model`) |
| Object Highlighting | ✅ Complete | Objects glow on hover |
| Click-to-Annotate | ✅ Complete | Click any object → AI generates educational explanation + fun facts |
| Voice Input & Output | ✅ Complete | Browser speech-to-text for queries, speech synthesis for annotations |
| Server-Side API | ✅ Complete | Gemini + Poly Pizza keys secured on Vercel edge functions, detailed error surfacing |

### ✅ UI Components

| Component | Status | Description |
|-----------|--------|-------------|
| Input Bar | ✅ Complete | Query input with mode toggle (AI Compose vs Quick Search) |
| Mode Toggle | ✅ Complete | Switch between AI-composed multi-object scenes and single-model quick search |
| Loading Screen | ✅ Complete | Progress bar with element list and statuses |
| Annotation Panel | ✅ Complete | Slide-in panel with explanation, fun fact, related topics, and voice playback |
| Controls Overlay | ✅ Complete | WASD hints (auto-hides after 10s) |
| Suggestion Chips | ✅ Complete | Clickable preset queries (e.g., "Solar system with planets") |
| Voice Controls | ✅ Complete | Microphone button for voice queries, speaker toggle for narration |

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React 19 + TypeScript + Vite + Babylon.js                  │
│                                                              │
│  App.tsx                                                     │
│    ├── BabylonViewer (3D canvas)                            │
│    ├── AnnotationPanel (AI explanations)                    │
│    ├── LoadingProgress (loading screen)                     │
│    ├── ControlsOverlay (WASD hints)                         │
│    └── Voice / input UI (text + mic + speaker toggle)       │
│                                                              │
│  Services:                                                   │
│    ├── sceneComposer.ts (AI scene orchestration)            │
│    ├── geminiService.ts (backend API client)                │
│    ├── polyPizzaService.ts (model search via proxy)         │
│    ├── babylonService.ts (3D engine wrapper)                │
│    └── speechService.ts (Web Speech API wrapper)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Serverless                        │
│                                                              │
│  api/compose.ts        → POST /api/compose                  │
│  api/annotate.ts       → POST /api/annotate                 │
│  api/search-models.ts  → GET /api/search-models             │
│  api/proxy-model.ts    → GET /api/proxy-model               │
│  api/validate-scene.ts → POST /api/validate-scene (WIP)     │
│                                                              │
│  Environment:                                               │
│    GEMINI_API_KEY                                           │
│    POLY_PIZZA_API_KEY                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│                                                              │
│  Google Gemini 2.5 Flash-Lite (AI)                          │
│  Poly Pizza 3D Library (CC0 3D assets)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Available 3D Models

Currently using **Poly Pizza** (CC0 license) via backend proxy:

- ~10,000+ low-poly models across categories: animals, nature, vehicles, buildings, food, furniture, fantasy, science props, etc.
- Models are searched by simple keywords (e.g. `dog`, `tree`, `castle`) provided by Gemini.
- All GLB downloads go through `/api/proxy-model` to avoid CORS issues and enable caching.

---

## File Structure

```
trying/
├── api/                      # Vercel serverless functions
│   ├── compose.ts           # Scene composition endpoint
│   ├── annotate.ts          # Object annotation endpoint
│   ├── search-models.ts     # Poly Pizza search proxy
│   ├── proxy-model.ts       # GLB proxy for model downloads
│   └── validate-scene.ts    # Visual scene validation (WIP)
├── docs/                     # Documentation
│   ├── CURRENT_STATE.md     # This file
│   ├── PROJECT_AIM.md       # Vision and goals
│   └── TECH_STACK.md        # Technologies used
├── src/
│   ├── components/v2/       # React components
│   │   ├── BabylonViewer.tsx
│   │   ├── AnnotationPanel.tsx
│   │   ├── ControlsOverlay.tsx
│   │   └── LoadingProgress.tsx
│   ├── services/            # Business logic
│   │   ├── geminiService.ts
│   │   ├── polyPizzaService.ts
│   │   ├── sceneComposer.ts
│   │   ├── babylonService.ts
│   │   └── speechService.ts
│   ├── hooks/               # React hooks
│   │   ├── useBabylonScene.ts
│   │   └── useCharacterController.ts
│   ├── App.tsx              # Main component
│   ├── main.tsx             # Entry point
│   └── style.css            # Global styles
├── vercel.json              # Vercel config
├── vite.config.ts           # Vite config
├── package.json
└── tsconfig.json
```

---

## Known Limitations

1. **Poly Pizza Only** - All models currently come from a single provider; no multi-library resolver yet
2. **No Model Generation** - Can't generate new 3D models yet (only search existing ones)
3. **No Persistence** - Scenes aren't saved or shareable
4. **No Mobile/Headset Controls** - Touch and WebXR/Quest 3 input not implemented yet
5. **Partial Caching** - Basic HTTP caching; no IndexedDB/offline model cache
6. **No Rate Limiting** - API could be abused without external protection

---

## Quick Commands

```bash
# Development (with API)
vercel dev

# Development (frontend only)
npm run dev

# Build
npm run build

# Deploy
vercel --prod
```

