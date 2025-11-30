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

Transform learning from **reading about things** to **stepping into them**.

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
Users navigate 3D environments in first-person, like a video game. Learning happens through exploration and curiosity.

### 2. AI as Curator
Gemini AI acts like a museum curator:
- Understands what you want to learn
- Composes relevant 3D scenes
- Positions objects naturally
- Explains things when asked

### 3. Click to Learn
Every object is interactive. Click anything → get an AI-powered explanation tailored to your level.

### 4. Open Source Assets
Use freely available 3D models (CC0 license) instead of expensive proprietary content. Eventually, generate custom models with AI.

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

### Phase 1: MVP ✅ (Current)
- [x] 3D scene with first-person controls
- [x] AI scene composition (Gemini)
- [x] Open-source 3D model library
- [x] Click-to-annotate with AI
- [x] Beautiful, immersive UI
- [x] Vercel deployment with secure API

### Phase 2: Expand Library
- [ ] Integrate Poly Pizza API (10,000+ models)
- [ ] Add Sketchfab free models
- [ ] Add Smithsonian 3D collection
- [ ] Model caching (IndexedDB)
- [ ] Search suggestions

### Phase 3: Generate Models
- [ ] AI-generated 3D models (Meshy/FLUX)
- [ ] Hybrid: search first, generate if not found
- [ ] Custom textures and materials

### Phase 4: Enhanced Experience
- [ ] Voice input ("Show me a...")
- [ ] Mobile touch controls
- [ ] VR/AR support
- [ ] Multi-user exploration
- [ ] Save/share scenes

### Phase 5: Education Platform
- [ ] Curriculum-aligned content
- [ ] Teacher dashboard
- [ ] Student progress tracking
- [ ] Quiz integration
- [ ] Classroom mode

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
- Every student has access to immersive 3D learning
- "Show me how a volcano works" → walk inside an erupting volcano
- "Explain DNA" → shrink down and explore a double helix
- Learning feels like playing, not studying

---

## Why Now?

1. **AI is ready** - Gemini can understand complex queries and compose scenes
2. **3D is accessible** - WebGL runs in any browser, no downloads
3. **Models are free** - CC0 libraries have thousands of quality assets
4. **Generation is emerging** - Text-to-3D is improving rapidly

The technology finally exists to make this vision real.

---

## Name Origin

**OBVIAN** = **OB**ject-based **VI**sual **AN**notation

Also evokes:
- "Obvious" - learning should be intuitive
- "Oblivion" - immerse yourself, forget you're studying

