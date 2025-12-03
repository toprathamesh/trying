# OBVIAN - Project Aim & Vision

---

## The Problem

Traditional learning is **passive**:
- Read text about a cell → forget it in a week
- Watch a video about the solar system → hard to grasp scale
- Look at 2D diagrams of anatomy → no spatial understanding

**Students don't experience what they're learning.**

---

## The Solution: OBVIAN

**OBVIAN** = **OB**ject-based **VI**sual **AN**notation

Transform learning and search from **reading answers** to **stepping into explorable worlds** that the AI composes for you.

```
Traditional:                    OBVIAN:
┌─────────────────┐            ┌─────────────────┐
│ "What is a cell?"│            │ "What is a cell?"│
│       ↓         │            │       ↓         │
│ Text + Images   │      →     │ 3D Cell Model   │
│ Read & Scroll   │            │ Walk Inside It  │
│ 2D Experience   │            │ Click Organelles│
│ Passive         │            │ AI Explains Each│
└─────────────────┘            └─────────────────┘
```

---

## Core Principles

### 1. Explore, Don't Read
Users navigate 3D environments in first-person, like a video game. Learning and search happen through **exploration, curiosity, and interaction**, not just scrolling text.

### 2. AI as Curator (and Director)
Gemini AI acts like a museum curator and scene director:
- Understands what you want to learn
- Composes relevant 3D scenes from natural language (text or voice)
- Picks and positions 3D objects naturally using open CC0 model libraries
- Explains things when asked, in text and voice, at the right level

### 3. Click (or Look) to Learn
Every object is interactive. Click or gaze at anything → get an AI-powered explanation, fun facts, and related topics, tailored to your level.

### 4. Open Source Assets First
Use freely available 3D models (CC0 license, e.g. Poly Pizza) instead of expensive proprietary content. Over time, mix in AI-generated 3D assets and let the system choose the best model per concept.

### 5. Device-Agnostic, AR-Ready
Start on the **web** (desktop/laptop) with Babylon.js. Design everything to extend to **WebXR on headsets (e.g. Quest 3)** and, eventually, **glasses** where you can ask a question and see the answer appear anchored in your real world.

---

## Target Users

| User | Use Case |
|------|----------|
| **Students (K-12)** | Explore biology, history, science concepts |
| **Teachers** | Create immersive lesson demos |
| **Curious Adults** | Learn about anything visually |
| **Museums** | Digital exhibit experiences |

---

## Inspiration

### falcraft (Minecraft Mod)
- Uses AI to generate 3D structures in Minecraft
- Converts text prompts → voxelized builds
- **What we borrowed:** The idea of AI-composed 3D scenes

### Minecraft Education Edition
- Learning through exploration and building
- **What we borrowed:** First-person controls, interactive world

### Google Arts & Culture
- Virtual museum tours
- **What we borrowed:** Educational annotations, exploration UI

---

## Roadmap

### Phase 1: Web MVP ✅ (Current)
- [x] 3D scene with first-person controls (Babylon.js)
- [x] AI scene composition (Gemini 2.5 Flash-Lite)
- [x] Open-source 3D model library via Poly Pizza
- [x] Click-to-annotate with AI
- [x] Voice input and speech output
- [x] Beautiful, immersive UI
- [x] Vercel deployment with secure API and proxies

### Phase 2: Smarter Scenes & Model Selection
- [ ] Model resolver that can pick the best model per concept (provider-agnostic)
- [ ] Visual scene validation with Gemini (use rendered images to refine layout/scale)
- [ ] Progressively better sizing and spacing rules for elements
- [ ] Model caching (IndexedDB / HTTP caching)

### Phase 3: WebXR & Headsets
- [ ] WebXR mode for Meta Quest 3 (run the same app in a headset)
- [ ] Hand/controller interaction (e.g. "pat the dog → wag tail")
- [ ] AR-style anchoring on planes in mixed reality
- [ ] Refined controls and UI for headset ergonomics

### Phase 4: AI-Generated Assets
- [ ] Integrate AI 3D generation (e.g. open-source / SaaS text-to-3D)
- [ ] Hybrid flow: search existing models first, generate when needed
- [ ] Use Gemini to rank existing vs AI-generated models from 1–100 using thumbnails

### Phase 5: Education & Search Platform
- [ ] Curriculum-aligned content and templates
- [ ] Teacher/creator dashboard
- [ ] Student progress tracking
- [ ] Quiz and assessment integration
- [ ] Shareable scene links and embeddable experiences

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first interaction | < 5 seconds |
| Scene load time | < 10 seconds |
| User engagement (avg session) | > 5 minutes |
| Learning retention improvement | +30% vs text |

---

## The Vision

**In 5 years:**
- Every student and curious adult has access to AI-composed explorable worlds
- "Show me how a volcano works" → walk inside an erupting volcano the AI builds for you
- "Explain DNA" → shrink down and explore a double helix, with objects you can pick and inspect
- "What is a fair coin toss?" → see real-time interactive examples, simulations, and visual proofs
- Learning and search feel like **playing in the answer**, not reading about it

---

## Why Now?

1. **AI is ready** - Gemini can understand complex queries, compose scenes, and analyze images
2. **3D & WebXR are accessible** - WebGL and WebXR run in modern browsers and headsets
3. **Models are free** - CC0 libraries like Poly Pizza have thousands of usable assets
4. **Generation is emerging** - Text-to-3D, neural rendering, and AR hardware are improving rapidly

The technology finally exists to make this vision real.

---

## Name Origin

**OBVIAN** = **OB**ject-based **VI**sual **AN**notation

Also evokes:
- "Obvious" - learning should be intuitive
- "Oblivion" - immerse yourself, forget you're studying

