# Short Label Implementation for 3D Visualization

## Overview

This document describes the implementation of `shortLabel` field for evidence graph nodes, intended for use in the 3D frontend visualization.

## What is `shortLabel`?

The `shortLabel` field provides a concise, human-readable label (1-3 words max) for each node in the evidence graph. While the existing `label` field contains longer, truncated text for tooltips and detailed views, `shortLabel` is designed to be displayed directly on the node in the 3D visualization.

## Node Types and Label Strategies

### 1. `answer_root` Node
- **Strategy**: Hard-coded
- **Value**: `"Answer"`
- **Example**: `"Answer"`

### 2. `question` Node
- **Strategy**: Heuristic extraction
- **Implementation**: Extracts 2-3 key words from the question, removing common question words
- **Examples**:
  - `"What is AI transparency?"` → `"AI transparency"`
  - `"How can we ensure fairness in hiring models?"` → `"Fair hiring models"`

### 3. `answer_block` Nodes
- **Strategy**: LLM-generated section titles
- **Implementation**: Uses GPT-4o-mini to generate 1-3 word section labels
- **Examples**:
  - Block explaining definition → `"AI Transparency"`
  - Block listing benefits → `"Key Benefits"`
  - Block covering risks → `"Ethical Risks"`
  - Block covering policy → `"AI Transparency Policy"`
- **Fallback**: If LLM fails, uses simple heuristics (pattern matching) or defaults to `"Block N"`

### 4. `direct_source` Nodes
- **Strategy**: Domain brand extraction with title fallback
- **Implementation**:
  1. Parse URL domain to extract brand name (e.g., `zendesk.com` → `"Zendesk"`)
  2. Handle special cases like IBM, AWS, MIT (preserve uppercase)
  3. Fall back to compressed title if domain extraction fails
- **Examples**:
  - `https://www.zendesk.com/blog/...` → `"Zendesk"`
  - `https://www.ibm.com/think/...` → `"IBM"`
  - `https://www.geeksforgeeks.org/...` → `"Geeksforgeeks"`
  - `https://www.salesforce.com/...` → `"Salesforce"`

### 5. `secondary_source` Nodes
- **Strategy**: LLM-generated concept tags
- **Implementation**: Enhanced SecondarySourceAgent to generate both `title` and `short_label`
- **Examples**:
  - `"Understanding AI Processes"` → `"AI processes"`
  - `"Accountability in AI"` → `"AI accountability"`
  - `"User Trust and Acceptance"` → `"User trust"`
  - `"Understanding AI Transparency"` → `"AI clarity"`

## Implementation Details

### Files Modified

#### 1. `/backend/src/types/shared.ts`
- Added `shortLabel?: string` field to `EvidenceNode` interface

#### 2. `/backend/src/utils/labelGenerator.ts` (NEW)
Utility module containing:
- `extractDomainBrand(url: string): string` - Extracts brand from domain
- `generateQuestionLabel(question: string): string` - Generates topic label from question
- `generateSourceLabel(title: string, url: string): string` - Generates source brand label
- `generateAnswerBlockLabel(blockText: string): Promise<string>` - LLM-based block label generation
- `generateAnswerBlockLabels(blockTexts: string[]): Promise<string[]>` - Batch label generation

#### 3. `/backend/src/services/evidenceGraph.ts`
Updated node creation for all types:
- Line 87: Added `shortLabel: 'Answer'` to answer_root
- Line 99: Added `shortLabel: generateQuestionLabel(question)` to question node
- Lines 115-123: Batch generate shortLabels for all answer blocks using LLM
- Line 134: Added shortLabel to answer_block nodes
- Line 204: Added `shortLabel: generateSourceLabel(source.title, source.url)` to direct_source nodes
- Line 231: Map `short_label` from SecondarySourceAgent to `shortLabel` on secondary_source nodes

#### 4. `/backend/src/services/secondarySourceAgent.ts`
Enhanced to generate short_label:
- Line 39: Added `short_label: string` to `SecondarySourceNode` interface
- Lines 111-117: Updated LLM system prompt to request `short_label` field
- Lines 152-193: Updated validation to extract `short_label` from LLM response
- Line 331: Map `short_label` to SecondarySourceNode objects

## LLM Efficiency

The implementation minimizes LLM calls:
- **answer_root**: Hard-coded (0 LLM calls)
- **question**: Simple regex/heuristic (0 LLM calls)
- **answer_block**: 1 LLM call per block (typically 3-5 blocks = 3-5 calls)
- **direct_source**: Domain parsing (0 LLM calls)
- **secondary_source**: Reuses existing LLM call from SecondarySourceAgent (0 additional calls)

**Total additional LLM cost**: ~3-5 small GPT-4o-mini calls per answer for answer block labels

## Error Handling

All label generation is wrapped in try-catch blocks with graceful fallbacks:
- If domain extraction fails → use compressed title
- If LLM fails for answer blocks → use simple pattern matching or "Block N"
- If short_label missing from secondary concepts → use title as fallback
- Graph building never crashes due to label generation failures

## Testing

End-to-end test with `curl POST /api/answer` confirms:
- ✅ All 31 nodes have `shortLabel` values
- ✅ No nodes have null or empty `shortLabel`
- ✅ Labels are concise (1-3 words as specified)
- ✅ Node breakdown:
  - 1 answer_root: `"Answer"`
  - 1 question: `"AI transparency"`
  - 4 answer_blocks: LLM-generated section titles
  - 10 direct_sources: Brand names (Zendesk, IBM, Geeksforgeeks, etc.)
  - 15 secondary_sources: Concept tags (AI processes, AI accountability, etc.)

## JSON Response Structure

Example node with shortLabel:

```json
{
  "id": "s1",
  "type": "direct_source",
  "label": "What is AI transparency? A comprehensive guide - Zendesk",
  "shortLabel": "Zendesk",
  "metadata": {
    "fullText": "AI transparency builds trust...",
    "url": "https://www.zendesk.com/blog/ai-transparency/",
    "layer": 2,
    "citationCount": 3
  }
}
```

## Usage in Frontend

The frontend 3D visualization should:
1. Render `shortLabel` directly on the node
2. Use `label` for hover tooltips
3. Use `metadata.fullText` for expanded detail views/sidebars

## Future Improvements

Potential enhancements:
1. Add caching for LLM-generated labels to reduce API costs
2. Fine-tune block label prompts based on user feedback
3. Add A/B testing to compare different labeling strategies
4. Implement label length validation (warn if >20 characters)
5. Add configuration to control label generation verbosity

## Notes

- Non-breaking change: `shortLabel` is optional field
- Existing `label` and `metadata.fullText` fields unchanged
- All label generation is deterministic except for LLM calls (answer blocks, secondary concepts)
- Implementation follows density-aware configuration (respects existing graph density settings)
