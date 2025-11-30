# OBVIAN - Current State

**Last Updated:** November 30, 2025  
**Version:** 0.1.0 (MVP)

---

## What's Working Now

### ✅ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| 3D Scene Rendering | ✅ Complete | Babylon.js powered 3D environment with ground, lighting, fog |
| First-Person Controls | ✅ Complete | WASD movement, mouse look, Shift to run |
| AI Scene Composition | ✅ Complete | Gemini 2.0 Flash composes multi-object scenes from queries |
| 3D Model Loading | ✅ Complete | Loads GLB models from Khronos sample library |
| Object Highlighting | ✅ Complete | Objects glow on hover |
| Click-to-Annotate | ✅ Complete | Click any object → AI generates educational explanation |
| Server-Side API | ✅ Complete | Gemini API key secured on Vercel serverless functions |

### ✅ UI Components

| Component | Status | Description |
|-----------|--------|-------------|
| Input Bar | ✅ Complete | Query input with mode toggle |
| Mode Toggle | ✅ Complete | Switch between AI Compose and Quick Search |
| Loading Screen | ✅ Complete | Progress bar with element list |
| Annotation Panel | ✅ Complete | Slide-in panel with explanation, fun fact, related topics |
| Controls Overlay | ✅ Complete | WASD hints (auto-hides after 10s) |
| Suggestion Chips | ✅ Complete | Clickable preset queries |

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
│    └── ControlsOverlay (WASD hints)                         │
│                                                              │
│  Services:                                                   │
│    ├── sceneComposer.ts (orchestrator)                      │
│    ├── geminiService.ts (API client)                        │
│    ├── polyPizzaService.ts (model search)                   │
│    └── babylonService.ts (3D engine wrapper)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Serverless                        │
│                                                              │
│  api/compose.ts   → POST /api/compose                       │
│  api/annotate.ts  → POST /api/annotate                      │
│                                                              │
│  Environment: GEMINI_API_KEY                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│                                                              │
│  Google Gemini 2.0 Flash (AI)                               │
│  Khronos glTF Sample Models (3D assets)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Available 3D Models

Currently using Khronos glTF Sample Models (CC0 license):

| Model | Search Terms |
|-------|--------------|
| Fox | fox, dog, animal |
| Duck | duck, bird |
| Dragon | dragon, fantasy, mythical |
| Helmet | helmet, armor, battle |
| Lantern | lantern, light, lamp |
| Avocado | avocado, food, fruit |
| Chair | chair, furniture, seat |
| Bottle | bottle, water, drink |
| Brain | brain, anatomy, science |
| Car | car, vehicle, transport |
| Sponza | sponza, palace, architecture |
| Monkey | monkey, suzanne, primate |

---

## File Structure

```
trying/
├── api/                      # Vercel serverless functions
│   ├── compose.ts           # Scene composition endpoint
│   └── annotate.ts          # Object annotation endpoint
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
│   │   └── babylonService.ts
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

1. **Limited Model Library** - Only ~15 models from Khronos samples
2. **No Model Generation** - Can't generate new 3D models yet
3. **No Persistence** - Scenes aren't saved
4. **No Mobile Controls** - Touch/joystick not implemented
5. **No Caching** - Models re-download each time
6. **No Rate Limiting** - API could be abused

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

