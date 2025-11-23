export interface KnowledgeNode {
  id: string;
  position: [number, number, number];
  title: string;
  sourceUrl?: string;
  chunkText: string;
  whyUsed: string;
  isActive: boolean;
  tier: number; // 1, 2, 3+ for clustering
  role?: 'principle' | 'fact' | 'example' | 'analogy';
}

export interface Connection {
  from: string;
  to: string;
  strength: number; // 0-1
  isActive: boolean;
}

export interface AnswerCore {
  text: string;
  isGenerating: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  question: string;
  answer: AnswerCore;
  nodes: KnowledgeNode[];
  connections: Connection[];
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export type ViewMode = 'idle' | 'thinking' | 'exploring';
export type ClusteringMode = 'none' | 'tiers' | 'roles';

// ============================================================================
// Backend API Types (mirrored from backend/src/types/shared.ts)
// ============================================================================

/**
 * Source from backend API
 */
export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  full_text?: string;
  score?: number;
  metadata?: Record<string, any>;
}

/**
 * Answer block types
 */
export type AnswerBlockType = "paragraph" | "bullet";

/**
 * Answer block from backend API
 */
export interface AnswerBlock {
  id: string;
  type: AnswerBlockType;
  text: string;
  source_ids: string[];
}

/**
 * Answer payload from backend API
 */
export interface AnswerPayload {
  text: string;
  blocks: AnswerBlock[];
}

/**
 * Node types in the evidence graph
 * - question: User's original query (side connection to answer)
 * - answer_root: Central node representing the complete answer (NEW in Phase 4)
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
 * Evidence graph node from backend API
 */
export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  metadata?: {
    fullText?: string;
    blockType?: AnswerBlockType;
    url?: string;
    score?: number;
    layer?: number;
    citationCount?: number;
    [key: string]: any;
  };
}

/**
 * Evidence graph edge from backend API
 */
export interface EvidenceEdge {
  from: string;
  to: string;
  relation: EvidenceRelation;
  metadata?: {
    strength?: number;
    citationCount?: number;
    [key: string]: any;
  };
}

/**
 * Evidence graph from backend API
 */
export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  metadata?: {
    sourceCount?: number;
    blockCount?: number;
    createdAt?: Date;
    [key: string]: any;
  };
}

/**
 * Complete API response from /api/answer endpoint
 */
export interface AnswerResponse {
  question: string;
  answer: AnswerPayload;
  sources: Source[];
  evidence_graph: EvidenceGraph;
  meta: {
    model?: string;
    retrieval_latency_ms?: number;
    answer_latency_ms?: number;
    total_latency_ms?: number;
    [key: string]: any;
  };
}
