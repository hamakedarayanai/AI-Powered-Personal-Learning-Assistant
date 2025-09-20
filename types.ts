
export interface GraphNode {
  id: string;
  group: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface LearningContent {
  explanation: string;
  example: string;
  diagramUrl: string;
}
