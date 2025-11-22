# Transparens AI - Backend

Backend API server for Transparens AI, providing transparent AI answers with evidence graphs.

## Architecture

The backend implements a clean separation between:

1. **Research Agent** (`services/researchAgent.ts`) - Uses Exa API to fetch relevant sources
2. **Answer Agent** (`services/answerAgent.ts`) - Uses LLM to generate answers ONLY from provided sources
3. **Evidence Graph Builder** (`services/evidenceGraph.ts`) - Constructs a graph linking questions → answer blocks → sources

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
EXA_API_KEY=your_exa_api_key_here
LLM_API_KEY=your_llm_api_key_here
PORT=3001
NODE_ENV=development
```

**Required API Keys:**
- `EXA_API_KEY` - Get from [Exa](https://exa.ai/)
- `LLM_API_KEY` - OpenAI or Anthropic API key (implementation pending)

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Type checking:
```bash
npm run type-check
```

Testing the research agent:
```bash
npm run test:research
```

## API Endpoints

### POST /api/answer

Ask a question and receive a structured answer with sources and evidence graph.

**Request:**
```json
{
  "question": "What is AI transparency?"
}
```

**Response:**
```json
{
  "question": "What is AI transparency?",
  "answer": {
    "text": "Full answer text...",
    "blocks": [
      {
        "id": "ans-1",
        "type": "paragraph",
        "text": "AI transparency refers to...",
        "source_ids": ["s1", "s3"]
      }
    ]
  },
  "sources": [
    {
      "id": "s1",
      "title": "Source Title",
      "url": "https://example.com",
      "snippet": "Relevant excerpt...",
      "score": 0.95
    }
  ],
  "evidence_graph": {
    "nodes": [
      { "id": "q", "type": "question", "label": "What is AI transparency?" },
      { "id": "ans-1", "type": "answer_block", "label": "AI transparency refers to..." },
      { "id": "s1", "type": "source", "label": "Source Title" }
    ],
    "edges": [
      { "from": "q", "to": "ans-1", "relation": "answers" },
      { "from": "ans-1", "to": "s1", "relation": "supports" }
    ]
  },
  "meta": {
    "model": "stub-llm-v1",
    "retrieval_latency_ms": 500,
    "answer_latency_ms": 800,
    "total_latency_ms": 1300
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T12:00:00.000Z",
  "environment": "development"
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── config/
│   │   └── env.ts            # Environment configuration
│   ├── routes/
│   │   └── answerRoute.ts    # /api/answer endpoint
│   ├── services/
│   │   ├── researchAgent.ts  # Exa-based source retrieval
│   │   ├── answerAgent.ts    # LLM-based answer generation
│   │   └── evidenceGraph.ts  # Evidence graph builder
│   └── types/
│       └── shared.ts         # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Current Status

### ✅ Phase 1: Project Setup (Complete)
- Complete TypeScript type system
- Express server with CORS and logging
- Full API endpoint structure
- Evidence graph generation

### ✅ Phase 2: Exa Research Agent (Complete)
- **Full Exa API integration** in `researchAgent.ts`
- Optimized for RAG use cases with:
  - 5 high-quality sources per query
  - Full text content (up to 10,000 characters)
  - Highlights/snippets (3 sentences, 5 per URL)
  - Relevance scoring
- Graceful error handling with stub fallback
- Safe API key management
- Test harness for unit testing (`npm run test:research`)
- Integration with `/api/answer` endpoint

### 🚧 Phase 3: LLM Answer Agent (TODO)
- LLM integration in `answerAgent.ts`
- Answer generation ONLY from provided sources
- Source attribution and block structuring
- Production error handling

### 🚧 Future Enhancements
- Rate limiting
- Caching layer for repeated queries
- More comprehensive testing suite
- Performance optimizations

## Development Notes

### Exa Integration

The `researchAgent.ts` now includes full Exa API integration:

**Request Configuration:**
- Endpoint: `https://api.exa.ai/search`
- Authentication: `x-api-key` header
- Search parameters optimized for RAG:
  - `numResults: 5` - Quality over quantity
  - `type: 'auto'` - Let Exa choose best search method (neural vs deep)
  - `text.maxCharacters: 10000` - Full content for LLM context
  - `highlights` - Concise snippets for quick reference

**Error Handling:**
- Missing API key → Falls back to stub sources with warning
- Network errors → Falls back to stub sources with error log
- API errors → Parses error response and falls back gracefully

**Response Mapping:**
- Maps Exa results to `Source` type
- Generates sequential IDs (`s1`, `s2`, etc.)
- Extracts snippets from highlights or text preview
- Preserves metadata (published date, author, scores, etc.)

### Testing

**Unit Testing:**
Run the research agent test harness:
```bash
npm run test:research
```

This tests the agent with multiple sample questions and validates:
- Source structure (id, title, url, snippet, score)
- API integration (if EXA_API_KEY is set)
- Stub fallback (if EXA_API_KEY is missing)
- Error handling

**Integration Testing:**
Test the full pipeline via the API:
```bash
# Start the server
npm run dev

# In another terminal, test with curl
curl -X POST http://localhost:3001/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Transparens AI?"}'
```

### Next Steps

The Answer Agent (`answerAgent.ts`) is currently stubbed. Phase 3 will implement:
1. LLM API integration (OpenAI/Anthropic)
2. Prompt engineering to ensure answers cite sources
3. Answer block generation with source attribution
4. Production-ready error handling
