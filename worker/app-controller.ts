import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, User, Organization, Workflow, WorkflowGraph } from './types';
import type { Env } from './core-utils';
interface StorageState {
  sessions: Record<string, SessionInfo>;
  users: Record<string, User>;
  organizations: Record<string, Organization>;
  workflows: Record<string, Workflow>;
  emailToUserId: Record<string, string>;
}
export class AppController extends DurableObject<Env> {
  private state: StorageState = {
    sessions: {},
    users: {},
    organizations: {},
    workflows: {},
    emailToUserId: {},
  };
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<StorageState>('state');
      if (stored) {
        this.state = stored;
      }
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('state', this.state);
  }
  // User and Auth Management
  async registerUser(name: string, email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; token: string } | { error: string }> {
    await this.ensureLoaded();
    if (this.state.emailToUserId[email]) {
      return { error: 'Este e-mail já está em uso.' };
    }
    const orgId = crypto.randomUUID();
    const newOrg: Organization = { id: orgId, name: `${name}'s Organization` };
    this.state.organizations[orgId] = newOrg;
    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      name,
      email,
      // TODO: Implement proper password hashing with a library like bcrypt. Storing plaintext for now due to dependency constraints.
      passwordHash: password,
      organizationId: orgId,
    };
    this.state.users[userId] = newUser;
    this.state.emailToUserId[email] = userId;
    await this.persist();
    // TODO: Use a secure JWT library for token generation.
    const token = `${userId}:${orgId}`;
    const { passwordHash, ...userToReturn } = newUser;
    return { user: userToReturn, token };
  }
  async loginUser(email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; token: string } | { error: string }> {
    await this.ensureLoaded();
    const userId = this.state.emailToUserId[email];
    if (!userId) {
      return { error: 'Credenciais inválidas.' };
    }
    const user = this.state.users[userId];
    // TODO: Replace with a secure password comparison function (e.g., bcrypt.compare).
    if (user.passwordHash !== password) {
      return { error: 'Credenciais inválidas.' };
    }
    // TODO: Use a secure JWT library for token generation.
    const token = `${user.id}:${user.organizationId}`;
    const { passwordHash, ...userToReturn } = user;
    return { user: userToReturn, token };
  }
  // Workflow Management
  async createWorkflow(name: string, organizationId: string): Promise<Workflow> {
    await this.ensureLoaded();
    const now = new Date().toISOString();
    const newWorkflow: Workflow = {
      id: `wf_${crypto.randomUUID()}`,
      name,
      organizationId,
      status: 'inactive',
      graph: { nodes: [], edges: [] },
      createdAt: now,
      updatedAt: now,
    };
    this.state.workflows[newWorkflow.id] = newWorkflow;
    await this.persist();
    return newWorkflow;
  }
  async getWorkflowsForOrg(organizationId: string): Promise<Workflow[]> {
    await this.ensureLoaded();
    return Object.values(this.state.workflows).filter(wf => wf.organizationId === organizationId);
  }
  async getWorkflowById(workflowId: string, organizationId: string): Promise<Workflow | null> {
    await this.ensureLoaded();
    const workflow = this.state.workflows[workflowId];
    if (workflow && workflow.organizationId === organizationId) {
      return workflow;
    }
    return null;
  }
  async updateWorkflow(workflowId: string, graph: WorkflowGraph, organizationId: string): Promise<Workflow | null> {
    await this.ensureLoaded();
    const workflow = this.state.workflows[workflowId];
    if (workflow && workflow.organizationId === organizationId) {
      workflow.graph = graph;
      workflow.updatedAt = new Date().toISOString();
      await this.persist();
      return workflow;
    }
    return null;
  }
  async deleteWorkflow(workflowId: string, organizationId: string): Promise<{ id: string } | null> {
    await this.ensureLoaded();
    const workflow = this.state.workflows[workflowId];
    if (workflow && workflow.organizationId === organizationId) {
      delete this.state.workflows[workflowId];
      await this.persist();
      return { id: workflowId };
    }
    return null;
  }
  // Session Management (from previous implementation)
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.state.sessions[sessionId] = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now,
    };
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = delete this.state.sessions[sessionId];
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.state.sessions[sessionId];
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Object.values(this.state.sessions).sort((a, b) => b.lastActive - a.lastActive);
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = Object.keys(this.state.sessions).length;
    this.state.sessions = {};
    await this.persist();
    return count;
  }
}