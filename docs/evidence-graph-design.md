# Evidence Graph Design for Transparens AI

## Executive Summary

This document defines the evidence graph structure for Transparens AI, designed to create a transparent visualization showing how AI answers are formed from source evidence. The graph is optimized for 3D visualization with the answer as the central node.

## Graph Topology

### Visual Structure (3D Layout)
```
                    [Question]
                         |
                         | (side connection)
                         |
                         v
    [Source 1] ---- [Block 1] ---- [ANSWER ROOT] ---- [Block 2] ---- [Source 2]
                         |          (CENTER)               |
                         |                                  |
                    [Source 3]                         [Source 4]
```

**Key Design Principle**: The answer root is the CENTER of the 3D visualization, with blocks radiating outward (Layer 1) and sources at the periphery (Layer 2).

## TypeScript Interface Design

### 1. Core Interfaces

```typescript
/**
 * Node types in the evidence graph
 * - question: User's original query (side connection to answer)
 * - answer_root: Central node representing the complete answer
 * - answer_block: Individual answer components (Layer 1 from center)
 * - source: Evidence supporting answer blocks (Layer 2 from center)
 */
export type EvidenceNodeType = "question" | "answer_root" | "answer_block" | "source";

/**
 * Edge relation types
 * - answers: question→answer_root, answer_root→blocks
 * - supports: blocks→sources (evidence relationship)
 */
export type EvidenceRelation = "answers" | "supports";

/**
 * Represents a node in the evidence graph
 */
export interface EvidenceNode {
  /** Unique identifier (e.g., "q", "answer", "ans-1", "s1") */
  id: string;

  /** Type of node determining its role in visualization */
  type: EvidenceNodeType;

  /** Display label (truncated for readability) */
  label: string;

  /** Optional metadata for future enhancement */
  metadata?: {
    /** Full untruncated text */
    fullText?: string;

    /** Original block type (for answer_block nodes) */
    blockType?: "paragraph" | "bullet";

    /** Source URL (for source nodes) */
    url?: string;

    /** Relevance score (for source nodes) */
    score?: number;

    /** Layer/tier for 3D positioning (0=center, 1=blocks, 2=sources) */
    layer?: number;

    /** Any additional properties */
    [key: string]: any;
  };
}

/**
 * Represents a directed edge in the evidence graph
 */
export interface EvidenceEdge {
  /** Source node ID */
  from: string;

  /** Target node ID */
  to: string;

  /** Semantic relationship type */
  relation: EvidenceRelation;

  /** Optional metadata for future enhancement */
  metadata?: {
    /** Edge weight/strength (0-1) */
    strength?: number;

    /** Citation count (how many times this source is cited) */
    citationCount?: number;

    /** Any additional properties */
    [key: string]: any;
  };
}

/**
 * Complete evidence graph structure
 */
export interface EvidenceGraph {
  /** All nodes in the graph */
  nodes: EvidenceNode[];

  /** All edges connecting nodes */
  edges: EvidenceEdge[];

  /** Optional graph-level metadata */
  metadata?: {
    /** Total number of sources */
    sourceCount?: number;

    /** Total number of blocks */
    blockCount?: number;

    /** Graph generation timestamp */
    createdAt?: Date;

    /** Any additional properties */
    [key: string]: any;
  };
}
```

### 2. Input Data Structures (Already Defined)

```typescript
export interface Source {
  id: string;              // e.g., "s1"
  title: string;
  url: string;
  snippet: string;
  full_text?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export type AnswerBlockType = "paragraph" | "bullet";

export interface AnswerBlock {
  id: string;              // e.g., "ans-1"
  type: AnswerBlockType;
  text: string;
  source_ids: string[];    // IDs of Source objects like ["s1", "s3"]
}

export interface AnswerPayload {
  text: string;            // full answer text
  blocks: AnswerBlock[];
}
```

## Algorithm Design

### buildEvidenceGraph Function

```typescript
/**
 * Builds an evidence graph with answer at center
 *
 * Graph structure:
 * - Center: Answer root node
 * - Layer 1: Answer blocks radiating from center
 * - Layer 2: Sources at periphery
 * - Side: Question node connected to answer root
 *
 * @param question - The original user question
 * @param answer - The structured answer with blocks
 * @param sources - The sources used in the answer
 * @returns EvidenceGraph with nodes, edges, and metadata
 * @throws Error if validation fails
 */
export function buildEvidenceGraph(
  question: string,
  answer: AnswerPayload,
  sources: Source[]
): EvidenceGraph {
  // Validation
  validateInputs(question, answer, sources);

  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];
  const edgeSet = new Set<string>(); // Track unique edges

  // 1. Create central answer root node
  nodes.push({
    id: 'answer',
    type: 'answer_root',
    label: truncateText(answer.text, 100),
    metadata: {
      fullText: answer.text,
      layer: 0
    }
  });

  // 2. Create question node (side connection)
  nodes.push({
    id: 'q',
    type: 'question',
    label: truncateText(question, 80),
    metadata: {
      fullText: question,
      layer: 0 // Same layer as answer but positioned differently
    }
  });

  // 3. Edge: question → answer_root
  edges.push({
    from: 'q',
    to: 'answer',
    relation: 'answers'
  });

  // 4. Create answer block nodes (Layer 1)
  for (const block of answer.blocks) {
    nodes.push({
      id: block.id,
      type: 'answer_block',
      label: truncateText(block.text, 100),
      metadata: {
        fullText: block.text,
        blockType: block.type,
        layer: 1
      }
    });

    // Edge: answer_root → block
    edges.push({
      from: 'answer',
      to: block.id,
      relation: 'answers'
    });

    // Edges: block → sources (with deduplication)
    for (const sourceId of block.source_ids) {
      const edgeKey = `${block.id}->${sourceId}`;

      // Validate source exists
      if (!sources.find(s => s.id === sourceId)) {
        console.warn(`Source ${sourceId} referenced by block ${block.id} not found in sources array`);
        continue;
      }

      // Only add edge if not already present
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          from: block.id,
          to: sourceId,
          relation: 'supports'
        });
      }
    }
  }

  // 5. Create source nodes (Layer 2)
  // Calculate citation counts for metadata
  const citationCounts = new Map<string, number>();
  for (const block of answer.blocks) {
    for (const sourceId of block.source_ids) {
      citationCounts.set(sourceId, (citationCounts.get(sourceId) || 0) + 1);
    }
  }

  for (const source of sources) {
    nodes.push({
      id: source.id,
      type: 'source',
      label: truncateText(source.title, 60),
      metadata: {
        fullText: source.snippet,
        url: source.url,
        score: source.score,
        layer: 2,
        citationCount: citationCounts.get(source.id) || 0,
        ...source.metadata
      }
    });
  }

  // 6. Add graph-level metadata
  return {
    nodes,
    edges,
    metadata: {
      sourceCount: sources.length,
      blockCount: answer.blocks.length,
      createdAt: new Date()
    }
  };
}

/**
 * Validates graph inputs
 */
function validateInputs(
  question: string,
  answer: AnswerPayload,
  sources: Source[]
): void {
  if (!question || question.trim().length === 0) {
    throw new Error('Question cannot be empty');
  }

  if (!answer.text || answer.text.trim().length === 0) {
    throw new Error('Answer text cannot be empty');
  }

  if (!answer.blocks || answer.blocks.length === 0) {
    throw new Error('Answer must contain at least one block');
  }

  // Check for duplicate block IDs
  const blockIds = new Set<string>();
  for (const block of answer.blocks) {
    if (!block.id) {
      throw new Error('All blocks must have an ID');
    }
    if (blockIds.has(block.id)) {
      throw new Error(`Duplicate block ID: ${block.id}`);
    }
    blockIds.add(block.id);
  }

  // Check for duplicate source IDs
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (!source.id) {
      throw new Error('All sources must have an ID');
    }
    if (sourceIds.has(source.id)) {
      throw new Error(`Duplicate source ID: ${source.id}`);
    }
    sourceIds.add(source.id);
  }
}

/**
 * Truncates text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calculates edge strength based on citation frequency
 * Can be used to enhance edges with metadata
 */
function calculateEdgeStrength(
  sourceId: string,
  allBlocks: AnswerBlock[]
): number {
  const totalCitations = allBlocks.reduce(
    (sum, block) => sum + block.source_ids.filter(id => id === sourceId).length,
    0
  );
  const maxCitations = Math.max(
    ...allBlocks.flatMap(block => {
      const counts = new Map<string, number>();
      for (const id of block.source_ids) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
      return Array.from(counts.values());
    })
  );

  return maxCitations > 0 ? totalCitations / maxCitations : 0;
}
```

## Validation and Error Handling

### Validation Strategy

1. **Input Validation**
   - Question must be non-empty string
   - Answer must have text and at least one block
   - All blocks must have unique IDs
   - All sources must have unique IDs

2. **Reference Validation**
   - Warn (don't fail) if block references non-existent source
   - Continue building graph with valid references only
   - Log warnings for debugging

3. **Edge Deduplication**
   - Use Set to track unique edge keys
   - Format: `{from}->{to}`
   - Prevents duplicate edges in graph

### Error Handling Approach

```typescript
class GraphBuildError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GraphBuildError';
  }
}

// Usage
try {
  const graph = buildEvidenceGraph(question, answer, sources);
} catch (error) {
  if (error instanceof GraphBuildError) {
    // Handle graph-specific errors
    console.error('Graph build failed:', error.message, error.details);
  }
  throw error;
}
```

## Edge Cases and Considerations

### 1. Duplicate Source Citations
**Scenario**: Block 1 and Block 2 both cite Source 1

**Solution**:
- Create separate edges: `block-1 → s1` and `block-2 → s1`
- Source node appears once, receives multiple incoming edges
- Edge metadata can include citation count

### 2. Missing Source References
**Scenario**: Block references `s99` but source doesn't exist

**Solution**:
- Log warning to console
- Skip creating edge for missing source
- Continue graph construction
- Don't fail entire operation

### 3. Empty Blocks Array
**Scenario**: Answer has empty blocks array

**Solution**:
- Throw validation error
- Require at least one block for graph to be meaningful

### 4. Very Long Labels
**Scenario**: Source title is 500 characters

**Solution**:
- Truncate with ellipsis at specified limits:
  - Question: 80 chars
  - Answer root: 100 chars
  - Answer blocks: 100 chars
  - Sources: 60 chars
- Store full text in metadata.fullText

### 5. Orphan Sources
**Scenario**: Source exists but no block references it

**Solution**:
- Still create source node
- Node will have no incoming edges
- Visualization can choose to hide orphans or show dimmed

### 6. Duplicate Node IDs
**Scenario**: Two blocks have same ID

**Solution**:
- Throw validation error
- Require unique IDs for all nodes
- Check during validation phase

### 7. Missing Metadata
**Scenario**: Source has no score or metadata

**Solution**:
- All metadata fields are optional
- Use optional chaining and defaults
- Graph builds successfully

## Label Truncation Strategy

| Node Type | Max Length | Rationale |
|-----------|-----------|-----------|
| Question | 80 chars | Questions tend to be concise |
| Answer Root | 100 chars | First sentence usually sufficient |
| Answer Block | 100 chars | Detail visible on hover/click |
| Source | 60 chars | Titles are typically short |

**Implementation**: Smart truncation at word boundaries
```typescript
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  // Try to truncate at last space before maxLength
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    // Space found in reasonable position
    return truncated.substring(0, lastSpace) + '...';
  }

  // No good space, hard truncate
  return truncated + '...';
}
```

## Node ID Guarantees

**Strategy**: Trust input data, validate uniqueness

1. **Question**: Always use fixed ID `"q"`
2. **Answer Root**: Always use fixed ID `"answer"`
3. **Answer Blocks**: Use IDs from AnswerBlock.id
4. **Sources**: Use IDs from Source.id

**Validation**: Check for duplicates in blocks and sources, throw error if found.

## Frontend Integration

### Mapping to 3D Visualization

The frontend can use the graph structure with this mapping:

```typescript
interface NodePosition {
  layer: number;     // 0 = center, 1 = blocks, 2 = sources
  index: number;     // Position within layer
  total: number;     // Total nodes in layer
}

function calculateNodePosition(node: EvidenceNode, graph: EvidenceGraph): [number, number, number] {
  const layer = node.metadata?.layer ?? 2;

  if (node.id === 'answer') {
    // Answer at center
    return [0, 0, 0];
  }

  if (node.id === 'q') {
    // Question positioned to side of answer
    return [-3, 1, 0];
  }

  if (layer === 1) {
    // Answer blocks in circle around center
    const blocks = graph.nodes.filter(n => n.type === 'answer_block');
    const index = blocks.findIndex(n => n.id === node.id);
    const angle = (index / blocks.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.5,
      Math.sin(angle) * radius
    ];
  }

  if (layer === 2) {
    // Sources at periphery
    const sources = graph.nodes.filter(n => n.type === 'source');
    const index = sources.findIndex(n => n.id === node.id);
    const angle = (index / sources.length) * Math.PI * 2;
    const radius = 7;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.5,
      Math.sin(angle) * radius
    ];
  }

  return [0, 0, 0];
}
```

## Performance Considerations

### Time Complexity
- **Node creation**: O(n + m) where n = blocks, m = sources
- **Edge creation**: O(n * k) where k = avg citations per block
- **Deduplication**: O(e) where e = total edges

**Overall**: O(n * k) which is acceptable for typical use cases:
- 5-10 blocks
- 5-15 sources
- 2-5 citations per block
- Result: ~50-200 edges

### Space Complexity
- Nodes: O(n + m)
- Edges: O(n * k)
- Edge set: O(e)

## Future Enhancements

### 1. Edge Weights
Add strength metadata to edges based on citation frequency:
```typescript
edges.push({
  from: block.id,
  to: sourceId,
  relation: 'supports',
  metadata: {
    strength: calculateEdgeStrength(sourceId, answer.blocks)
  }
});
```

### 2. Node Clustering
Add clustering metadata for visualization:
```typescript
metadata: {
  cluster: 'financial',  // Topic cluster
  importance: 0.8        // Node importance score
}
```

### 3. Temporal Metadata
Track when nodes were added:
```typescript
metadata: {
  addedAt: new Date(),
  modifiedAt: new Date()
}
```

### 4. Interactive Metadata
Support for progressive disclosure:
```typescript
metadata: {
  expanded: false,       // Expansion state
  children: string[]     // Child node IDs for hierarchical expansion
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('buildEvidenceGraph', () => {
  test('creates answer root at center', () => {
    const graph = buildEvidenceGraph(question, answer, sources);
    const answerNode = graph.nodes.find(n => n.id === 'answer');
    expect(answerNode?.type).toBe('answer_root');
    expect(answerNode?.metadata?.layer).toBe(0);
  });

  test('creates edges from answer to blocks', () => {
    const graph = buildEvidenceGraph(question, answer, sources);
    const answerEdges = graph.edges.filter(e => e.from === 'answer');
    expect(answerEdges.length).toBe(answer.blocks.length);
  });

  test('handles missing source references gracefully', () => {
    const badAnswer = {
      ...answer,
      blocks: [{
        id: 'b1',
        type: 'paragraph',
        text: 'Test',
        source_ids: ['missing-source']
      }]
    };

    // Should not throw, just warn
    expect(() => buildEvidenceGraph(question, badAnswer, sources)).not.toThrow();
  });

  test('deduplicates edges correctly', () => {
    const graph = buildEvidenceGraph(question, answer, sources);
    const edgeKeys = graph.edges.map(e => `${e.from}->${e.to}`);
    const uniqueKeys = new Set(edgeKeys);
    expect(edgeKeys.length).toBe(uniqueKeys.size);
  });
});
```

## Recommendations

### 1. Validation Approach
- **VALIDATE**: Input data structure and uniqueness
- **WARN**: Missing source references (don't fail)
- **SANITIZE**: Labels through truncation

### 2. Error Handling
- Throw errors for structural issues (empty blocks, duplicate IDs)
- Log warnings for data inconsistencies (missing sources)
- Return partial graphs when possible

### 3. Metadata Strategy
- Include metadata fields from the start for future extensibility
- Make all metadata optional
- Use consistent naming (camelCase)

### 4. Edge Management
- Always deduplicate edges
- Consider adding edge metadata (strength, citation count) early
- Use Set for efficient deduplication

### 5. Node IDs
- Trust input data for IDs
- Use fixed IDs for question and answer root
- Validate uniqueness but don't generate IDs

## Summary

The evidence graph design provides:

1. **Clear topology** with answer at center, suitable for 3D visualization
2. **Robust validation** that fails fast on structural issues
3. **Graceful degradation** for data inconsistencies
4. **Extensible metadata** for future enhancements
5. **Efficient deduplication** to prevent duplicate edges
6. **Type safety** through comprehensive TypeScript interfaces

This design balances immediate needs (3D visualization) with future extensibility (clustering, temporal tracking, edge weights).
