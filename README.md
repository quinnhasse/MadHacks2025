# Lexon AI

> **Lexon AI Answers You Can Trust**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-000000.svg)](https://threejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991.svg)](https://openai.com/)
[![Exa](https://img.shields.io/badge/Exa-API-orange.svg)](https://exa.ai/)

Lexon AI is a revolutionary answer system that eliminates the "AI black box" problem. Unlike traditional AI systems, every answer is fully transparent with complete source attribution and an interactive 3D evidence graph that visualizes exactly how conclusions are reached.

Built for **MadHacks 2025**.

---

## The Problem

Traditional AI systems generate answers from their training data with no way to verify claims or trace reasoning. Users are left trusting a black box, unable to distinguish fact from hallucination.

## The Solution

Lexon AI uses **strict separation of concerns**:

1. **Research Agent** retrieves sources from the web via Exa API
2. **Answer Agent** generates answers using ONLY those sources (no training data)
3. **Evidence Graph Builder** constructs a multi-layer graph linking questions → answer blocks → sources
4. **3D Visualization** lets you explore the reasoning process interactively

Every claim is traceable. Every source is verifiable. Complete transparency.

---

## Key Features

- **Verifiable Answers**: The LLM can ONLY use retrieved sources, never its training data
- **Structured Responses**: Answers broken into logical conceptual blocks with explicit citations
- **Interactive 3D Graphs**: Explore evidence relationships with React Three Fiber visualization
- **Multi-Layer Architecture**: 4-layer graph (question → answer → sources → supporting concepts)
- **Multiple Visualizations**: Switch between flat, spherical, and layered layouts with white/rainbow/semantic coloring
- **Graceful Degradation**: System continues functioning even when individual components fail
- **Real-Time Generation**: Watch answers and graphs build dynamically

---

## How It Works

```
User Question
    ↓
Research Agent (Exa API)
    ↓  Retrieves 6-12 relevant sources
    ↓
Answer Agent (GPT-4o-mini)
    ↓  Generates answer ONLY using sources
    ↓  Structures into conceptual blocks
    ↓
Evidence Graph Builder
    ↓  Constructs 4-layer graph
    ↓  Adds semantic similarity edges
    ↓
3D Visualization (React Three Fiber)
    ↓  Interactive exploration
    ↓
User sees transparent, verifiable answer
```

### Evidence Graph Architecture (4 Layers)

The graph is **answer-centric** with concentric layers:

- **Layer 0** (center): `answer_root` node + `question` node (side connection)
- **Layer 1**: `answer_block` nodes - distinct concepts radiating from center
- **Layer 2**: `direct_source` nodes - primary evidence at periphery
- **Layer 3**: `secondary_source` nodes - supporting concepts underpinning sources

**Edge Types:**
- `answers`: question→answer_root, answer_root→blocks (structural)
- `supports`: blocks→sources (citation)
- `underpins`: source→secondary_source (supporting)
- `semantic_related`: weighted similarity edges between related nodes

---

## Tech Stack

### Backend
- **TypeScript** - Type-safe implementation
- **Node.js** + **Express** - API server
- **Exa API** - Neural search for source retrieval
- **OpenAI GPT-4o-mini** - Answer generation (with strict source constraints)
- **Custom Embeddings** - Semantic similarity for graph enhancement

### Frontend
- **React 18** - Component architecture
- **Vite** - Fast dev server and build tool
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - 3D helpers and abstractions
- **Three.js** - WebGL 3D rendering
- **Framer Motion** - UI animations
- **@react-spring/three** - Physics-based node animations

### Visualization
- 3D force-directed graph layout
- Particle flow animations on edges
- Dynamic camera controls (orbit, pan, zoom)
- Hover effects and selection states
- Background particle system

---

## Quick Start

### Prerequisites

- **Node.js 18+** (for backend and frontend)
- **npm** or **pnpm**
- **Exa API Key** ([get one here](https://exa.ai/))
- **OpenAI API Key** ([get one here](https://platform.openai.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Lexon-ai.git
cd Lexon-ai

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   EXA_API_KEY=your_exa_api_key_here
#   LLM_API_KEY=your_openai_api_key_here

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Example API Call

```bash
curl -X POST http://localhost:3001/api/answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is AI transparency and why does it matter?",
    "density": "medium"
  }'
```

**Response:**
```json
{
  "question": "What is AI transparency...",
  "answer": {
    "blocks": [
      {
        "id": "block_1",
        "type": "paragraph",
        "text": "AI transparency refers to...",
        "source_ids": ["src_1", "src_2"]
      }
    ]
  },
  "sources": [...],
  "evidence_graph": {
    "nodes": [...],
    "edges": [...]
  },
  "meta": {
    "degraded": false,
    "timestamp": "2025-11-23T..."
  }
}
```

---

## Project Structure

```
Lexon-ai/
├── backend/                      # Node.js/TypeScript API server
│   ├── src/
│   │   ├── index.ts              # Express server setup
│   │   ├── routes/
│   │   │   └── answer.ts         # POST /api/answer endpoint
│   │   ├── services/
│   │   │   ├── researchAgent.ts  # Exa-based source retrieval
│   │   │   ├── answerAgent.ts    # GPT-4o-mini answer generation
│   │   │   ├── evidenceGraph.ts  # Graph construction
│   │   │   ├── secondarySourceAgent.ts  # Layer 3 extraction
│   │   │   ├── semanticGraphBuilder.ts  # Similarity edges
│   │   │   └── labelGenerator.ts # Short label generation
│   │   ├── types/
│   │   │   └── shared.ts         # TypeScript definitions
│   │   └── config/
│   │       └── config.ts         # Environment variables
│   ├── scripts/                  # Test scripts
│   │   ├── test-research-agent.ts
│   │   ├── test-answer-agent.ts
│   │   └── test-evidence-graph.ts
│   └── package.json
│
└── frontend/                     # React/Vite 3D visualization
    ├── src/
    │   ├── App.tsx               # Main application state
    │   ├── components/
    │   │   ├── GraphVisualization.tsx  # 3D scene orchestrator
    │   │   ├── Node.tsx          # Individual node rendering
    │   │   ├── AnimatedNode.tsx  # Spring physics nodes
    │   │   ├── Edge.tsx          # Connection rendering
    │   │   ├── ParticleSystem.tsx # Background particles
    │   │   ├── ControlsPanel.tsx # Layout/color controls
    │   │   ├── SearchBar.tsx     # Question input
    │   │   └── DetailPanel.tsx   # Node detail view
    │   ├── types/
    │   │   └── index.ts          # Frontend type definitions
    │   └── main.tsx
    └── package.json
```

---

## API Documentation

### `POST /api/answer`

Generate a transparent answer with evidence graph.

**Request Body:**
```json
{
  "question": "Your question here",
  "density": "medium"  // optional: "low" | "medium" | "high"
}
```

**Parameters:**
- `question` (required): The question to answer
- `density` (optional): Controls graph complexity
  - `low`: 6 sources, simpler graph
  - `medium`: 9 sources (default)
  - `high`: 12 sources, richer graph

**Response:**
```json
{
  "question": "Your question here",
  "answer": {
    "blocks": [
      {
        "id": "block_1",
        "type": "paragraph",
        "text": "Answer text...",
        "source_ids": ["src_1", "src_2"],
        "label": "Main Concept",
        "shortLabel": "Concept"
      }
    ]
  },
  "sources": [
    {
      "id": "src_1",
      "url": "https://example.com/article",
      "title": "Article Title",
      "text": "Excerpt from source...",
      "author": "Author Name",
      "publishedDate": "2025-01-15"
    }
  ],
  "evidence_graph": {
    "nodes": [
      {
        "id": "node_1",
        "type": "answer_block",
        "label": "Main Concept",
        "shortLabel": "Concept",
        "metadata": {
          "layer": 1,
          "sourceId": "block_1"
        }
      }
    ],
    "edges": [
      {
        "source": "answer_root",
        "target": "node_1",
        "relation": "answers",
        "weight": 1.0
      }
    ]
  },
  "meta": {
    "degraded": false,
    "timestamp": "2025-11-23T12:00:00Z",
    "researchTimeMs": 1234,
    "answerTimeMs": 5678
  }
}
```

**Error Handling:**
- If research fails: Returns empty sources array with `degraded: true`
- If answer generation fails: Returns fallback answer listing available sources
- System never crashes - always returns valid JSON

---

## Architecture Deep Dive

### Design Principles

1. **Separation of Concerns**: Research and answer generation are independent processes
2. **Source Constraint**: LLM can ONLY use retrieved sources, never training data
3. **Structured Output**: Answers broken into conceptual blocks (not arbitrary chunks)
4. **Transparency**: Every claim traceable via evidence graph
5. **Graceful Degradation**: Individual component failures don't crash the system

### Answer Blocks as Conceptual Units

**IMPORTANT:** Blocks represent **distinct concepts**, not arbitrary text splits:
- Simple questions: 1-2 blocks
- Complex questions: 3-8 blocks
- Each block forms a logical branch in visualization
- Only create new blocks for genuinely distinct concepts

### Error Handling Philosophy

All services follow the pattern:
1. Input validation (fail fast)
2. API calls with exponential backoff retries
3. Graceful degradation on failure
4. Structured logging
5. Return degraded data instead of throwing

**Examples:**
- Research failures → continue with empty sources
- Answer failures → use fallback listing sources
- Graph failures → return minimal graph (question node only)
- Enhancement failures (L3, semantic edges) → log warning, continue without

### Frontend Visualization

**Layout Modes:**
- **Flat**: 2D circular layout for simple exploration
- **Spherical**: 3D sphere surface for aesthetic view
- **Layered**: Concentric shells by graph depth (recommended)

**Color Modes:**
- **White**: Clean monochrome theme
- **Rainbow**: Colorful node differentiation
- **Semantic**: Color by node type/layer (recommended)

**Controls:**
- Mouse drag: Rotate camera
- Mouse wheel: Zoom in/out
- Right-click drag: Pan camera
- Hover: Highlight node and connections
- Click: Select node (shows details in panel)

---

## Development

### Backend Development

```bash
cd backend

# Development server with auto-reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
npm start

# Test individual components
npm run test:research   # Test Exa API integration
npm run test:answer     # Test OpenAI answer generation
npm run test:graph      # Test evidence graph construction
npm run test:enhanced   # Test enhanced graph with semantic edges
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `backend/.env`:
```env
EXA_API_KEY=your_exa_api_key_here
LLM_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
```

### Logging

All logs follow: `[ServiceName] Message with context`

Examples:
```typescript
console.log('[ResearchAgent] Searching for: "What is AI transparency?"');
console.log('[AnswerAgent] Generated answer with 5 blocks');
console.log('[EvidenceGraph] Added 12 semantic edges');
console.warn('[AnswerAgent] Failed to generate labels, using fallbacks');
console.error('[ResearchAgent] Error calling Exa API:', error);
```

---

## Performance Considerations

### Backend
- **Source truncation**: Each source limited to 1000 chars to manage context
- **Total context budget**: 30,000 chars max to prevent token overflow
- **Embedding batching**: Semantic graph builder processes in batches
- **Density levels**: Control graph complexity (6-12 sources)

### Frontend
- **Node instancing**: Use instanced meshes for many nodes
- **LOD (Level of Detail)**: Reduce geometry for distant nodes
- **Frustum culling**: Three.js handles off-screen optimization
- **Animation throttling**: Spring physics (not continuous updates)
- **Tested with graphs up to 50 nodes**

---

## Known Limitations

- Backend requires valid API keys (EXA_API_KEY, LLM_API_KEY)
- Exa API has rate limits (~100 requests/day on free tier)
- OpenAI API costs: ~$0.001-0.01 per answer
- Large graphs (>50 nodes) may impact frontend performance
- Secondary source extraction and semantic edges add ~2-5s latency
- No caching yet (every request hits APIs)

---

## Future Enhancements

- [ ] **Caching layer** - Redis for repeated queries
- [ ] **Rate limiting** - Per-IP request throttling
- [ ] **Additional LLM providers** - Claude, Gemini support
- [ ] **Graph analytics** - Centrality, clustering metrics
- [ ] **Advanced filtering** - Filter by node type, date, source credibility
- [ ] **Export functionality** - Save graphs as JSON, PNG, or interactive HTML
- [ ] **Collaborative exploration** - Multi-user graph viewing
- [ ] **Mobile-optimized UI** - Touch controls for 3D navigation
- [ ] **Progressive graph loading** - Stream nodes as they're generated
- [ ] **Source credibility scoring** - Rank sources by authority

---

## Contributing

This project was built for MadHacks 2025 as a demonstration of transparent AI architecture. Contributions, suggestions, and feedback are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code patterns (see `CLAUDE.md` for detailed guidelines)
4. Test your changes (`npm run test:*` in backend)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

---

## Built For MadHacks 2025

Lexon AI was created to demonstrate that AI systems can be both powerful and transparent. By separating research from reasoning and visualizing the evidence graph, we show that users shouldn't have to trust a black box.

**Team:** [Your team info here]

**Technologies:** TypeScript, React, Three.js, OpenAI, Exa

**Hackathon:** MadHacks 2025

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Made with transparency at MadHacks 2025**
