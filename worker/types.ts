import type { Node, Edge } from '@xyflow/react';
export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface Tool {
  name:string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}
// Phase 8: Real Authentication & Persistence Types
export interface Organization {
  id: string;
  name: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  passwordHash: string; // In a real app, this would be a hash.
}
export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}
export interface WorkflowGraph {
  nodes: Node[];
  edges: Edge[];
}
export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  graph: WorkflowGraph;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt: string | null;
}