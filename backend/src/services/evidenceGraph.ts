/**
 * Evidence Graph Builder
 * Constructs a graph showing the relationship between question, answer blocks, and sources
 * Designed for 3D visualization with answer at center
 */

import {
  AnswerPayload,
  EvidenceGraph,
  EvidenceNode,
  EvidenceEdge,
  Source,
  AnswerBlock
} from '../types/shared';

/**
 * Custom error for graph building failures
 */
export class GraphBuildError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GraphBuildError';
  }
}

/**
 * Builds an evidence graph with answer at center
 *
 * Graph structure:
 * - Center: Answer root node
 * - Layer 1: Answer blocks radiating from center
 * - Layer 2: Sources at periphery
 * - Side: Question node connected to answer root
 *
 * Edges:
 * - "q" -> "answer" with relation "answers"
 * - "answer" -> "ans-X" with relation "answers"
 * - "ans-X" -> "sY" with relation "supports"
 *
 * @param question - The original user question
 * @param answer - The structured answer with blocks
 * @param sources - The sources used in the answer
 * @returns EvidenceGraph with nodes, edges, and metadata
 * @throws GraphBuildError if validation fails
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
      layer: 0
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
        console.warn(
          `Source ${sourceId} referenced by block ${block.id} not found in sources array`
        );
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
 * @throws GraphBuildError if validation fails
 */
function validateInputs(
  question: string,
  answer: AnswerPayload,
  sources: Source[]
): void {
  if (!question || question.trim().length === 0) {
    throw new GraphBuildError('Question cannot be empty');
  }

  if (!answer.text || answer.text.trim().length === 0) {
    throw new GraphBuildError('Answer text cannot be empty');
  }

  if (!answer.blocks || answer.blocks.length === 0) {
    throw new GraphBuildError('Answer must contain at least one block');
  }

  // Check for duplicate block IDs
  const blockIds = new Set<string>();
  for (const block of answer.blocks) {
    if (!block.id) {
      throw new GraphBuildError('All blocks must have an ID');
    }
    if (blockIds.has(block.id)) {
      throw new GraphBuildError(`Duplicate block ID: ${block.id}`, { id: block.id });
    }
    blockIds.add(block.id);
  }

  // Check for duplicate source IDs
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (!source.id) {
      throw new GraphBuildError('All sources must have an ID');
    }
    if (sourceIds.has(source.id)) {
      throw new GraphBuildError(`Duplicate source ID: ${source.id}`, { id: source.id });
    }
    sourceIds.add(source.id);
  }
}

/**
 * Truncates text with ellipsis at word boundary when possible
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';

  // Try to truncate at last space before maxLength
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    // Space found in reasonable position (last 30%)
    return truncated.substring(0, lastSpace) + '...';
  }

  // No good space, hard truncate
  return truncated + '...';
}

/**
 * Calculates edge strength based on citation frequency
 * Can be used to enhance edges with metadata
 *
 * @param sourceId - Source to calculate strength for
 * @param allBlocks - All answer blocks
 * @returns Normalized strength value (0-1)
 */
export function calculateEdgeStrength(
  sourceId: string,
  allBlocks: AnswerBlock[]
): number {
  const totalCitations = allBlocks.reduce(
    (sum, block) => sum + block.source_ids.filter(id => id === sourceId).length,
    0
  );

  // Find max citations for any source
  const citationCounts = new Map<string, number>();
  for (const block of allBlocks) {
    for (const id of block.source_ids) {
      citationCounts.set(id, (citationCounts.get(id) || 0) + 1);
    }
  }

  const maxCitations = Math.max(...Array.from(citationCounts.values()), 1);

  return totalCitations / maxCitations;
}
