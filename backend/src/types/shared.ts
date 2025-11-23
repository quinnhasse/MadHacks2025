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
    blockType?: AnswerBlockType;

    /** Source URL (for source nodes) */
    url?: string;

    /** Relevance score (for source nodes) */
    score?: number;

    /** Layer/tier for 3D positioning (0=center, 1=blocks, 2=sources) */
    layer?: number;

    /** Citation count (for source nodes) */
    citationCount?: number;

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
