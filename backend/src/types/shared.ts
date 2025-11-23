/**
 * Shared types for Transparens AI
 * These types define the structure of our JSON responses and data flow
 */

export interface Source {
  id: string;              // e.g. "s1"
  title: string;
  url: string;
  snippet: string;
  full_text?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export type AnswerBlockType = "paragraph" | "bullet";

export interface AnswerBlock {
  id: string;              // e.g. "ans-1"
  type: AnswerBlockType;
  text: string;
  source_ids: string[];    // IDs of Source objects like ["s1", "s3"]
}

export interface AnswerPayload {
  text: string;            // full answer text
  blocks: AnswerBlock[];
}

/**
 * Node types in the evidence graph
 * - question: User's original query (side connection to answer) - Layer 0
 * - answer_root: Central node representing the complete answer - Layer 0
 * - answer_block: Individual answer components (conceptual branches) - Layer 1
 * - direct_source: Primary evidence supporting answer blocks - Layer 2
 * - secondary_source: Supporting concepts that underpin direct sources - Layer 3
 *
 * Note: "source" is maintained as backward-compatible alias for "direct_source"
 */
export type EvidenceNodeType = "question" | "answer_root" | "answer_block" | "source" | "direct_source" | "secondary_source";

/**
 * Edge relation types
 * - answers: question→answer_root, answer_root→blocks
 * - supports: blocks→direct_sources (evidence relationship)
 * - underpins: direct_source→secondary_source (supporting concept relationship)
 * - semantic_related: weighted semantic similarity between nodes
 */
export type EvidenceRelation = "answers" | "supports" | "underpins" | "semantic_related";

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

  /** Short label for 3D visualization (1-3 words max) */
  shortLabel?: string;

  /** Optional metadata for future enhancement */
  metadata?: {
    /** Full untruncated text */
    fullText?: string;

    /** Original block type (for answer_block nodes) */
    blockType?: AnswerBlockType;

    /** Source URL (for source nodes) */
    url?: string;

    /** Relevance score (for source nodes) */
    score?: number;

    /** Layer/tier for 3D positioning (0=center, 1=blocks, 2=direct_sources, 3=secondary_sources) */
    layer?: 0 | 1 | 2 | 3;

    /** Citation count (for source nodes) */
    citationCount?: number;

    /** Which conceptual branch this node belongs to (e.g., "ans-1") */
    branchId?: string;

    /** The primary parent node ID in the tree structure */
    primaryParentId?: string;

    /** Importance/significance score (0-1) */
    importance?: number;

    /** Parent source ID (for secondary_source nodes) */
    parentSourceId?: string;

    /** Related block IDs (for secondary_source nodes) */
    relatedBlockIds?: string[];

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

  /** Edge weight/strength (0-1), used for semantic_related edges and visualization */
  weight?: number;

  /** Optional metadata for future enhancement */
  metadata?: {
    /** Alternative edge weight/strength (0-1) */
    strength?: number;

    /** Citation count (how many times this connection appears) */
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

export interface AnswerResponse {
  question: string;
  answer: AnswerPayload;
  sources: Source[];
  evidence_graph: EvidenceGraph;
  meta: {
    model?: string;
    retrieval_latency_ms?: number;
    answer_latency_ms?: number;
    [key: string]: any;
  };
}
