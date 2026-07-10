export type KnowledgeMapMode = 'mind' | 'flow';

export type KnowledgeMapNodeType =
  | 'ticket'
  | 'problem'
  | 'symptom'
  | 'cause'
  | 'solution'
  | 'validation'
  | 'knowledge'
  | 'commit'
  | 'state'
  | 'assignment';

export type KnowledgeMapNodeStatus = 'complete' | 'pending' | 'risk' | 'info';

export interface KnowledgeMapNode {
  id: string;
  label: string;
  detail?: string;
  type: KnowledgeMapNodeType;
  status: KnowledgeMapNodeStatus;
  x: number;
  y: number;
}

export interface KnowledgeMapEdge {
  source: string;
  target: string;
  label?: string;
}

export interface TicketKnowledgeMap {
  mode: KnowledgeMapMode;
  nodes: KnowledgeMapNode[];
  edges: KnowledgeMapEdge[];
}
