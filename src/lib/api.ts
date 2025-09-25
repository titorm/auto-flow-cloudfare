import type { Workflow, WorkflowExecution, WorkflowGraph, AuthResponse } from '../../worker/types';
import { useAuth } from './auth';
const getAuthHeader = () => {
  const token = useAuth.getState().authToken;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
const handleResponse = async <T>(response: Response): Promise<T> => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }
  return result.data;
};
// Auth API
export const register = (data: { name: string, email: string, password: string }): Promise<AuthResponse> => {
  return fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => handleResponse<AuthResponse>(res));
};
export const login = (credentials: { email: string, password: string }): Promise<AuthResponse> => {
  return fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(res => handleResponse<AuthResponse>(res));
};
// Workflow API
export const getWorkflows = (): Promise<Workflow[]> => {
  return fetch('/api/v1/workflows', { headers: getAuthHeader() }).then(res => handleResponse<Workflow[]>(res));
};
export const getWorkflow = (id: string): Promise<Workflow> => {
  return fetch(`/api/v1/workflows/${id}`, { headers: getAuthHeader() }).then(res => handleResponse<Workflow>(res));
};
export const createWorkflow = (name: string): Promise<Workflow> => {
  return fetch('/api/v1/workflows', {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(res => handleResponse<Workflow>(res));
};
export const updateWorkflow = (id: string, graph: WorkflowGraph): Promise<Workflow> => {
  return fetch(`/api/v1/workflows/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ graph }),
  }).then(res => handleResponse<Workflow>(res));
};
export const deleteWorkflow = (id: string): Promise<{ id: string }> => {
  return fetch(`/api/v1/workflows/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  }).then(res => handleResponse<{ id: string }>(res));
};
// Execution History API
export const getWorkflowExecutions = (workflowId: string): Promise<WorkflowExecution[]> => {
  return fetch(`/api/v1/workflows/${workflowId}/executions`, { headers: getAuthHeader() }).then(res => handleResponse<WorkflowExecution[]>(res));
};