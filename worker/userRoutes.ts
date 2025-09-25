import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import type { WorkflowExecution } from './types';
import { bearerAuth } from 'hono/bearer-auth';
// Mock in-memory database for executions, as this is out of scope for this phase
let mockExecutions: WorkflowExecution[] = [
    { id: `exec_${crypto.randomUUID()}`, workflowId: 'wf_1', status: 'success', startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), finishedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
    { id: `exec_${crypto.randomUUID()}`, workflowId: 'wf_1', status: 'success', startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), finishedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString() },
    { id: `exec_${crypto.randomUUID()}`, workflowId: 'wf_2', status: 'failed', startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), finishedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString() },
    { id: `exec_${crypto.randomUUID()}`, workflowId: 'wf_2', status: 'success', startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), finishedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString() },
];
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env, Variables: { userId: string, orgId: string } }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env, Variables: { userId: string, orgId: string } }>) {
    // Auth Routes
    const authRoutes = new Hono<{ Bindings: Env }>();
    authRoutes.post('/register', async (c) => {
        const controller = getAppController(c.env);
        const { name, email, password } = await c.req.json();
        if (!name || !email || !password) {
            return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        const result = await controller.registerUser(name, email, password);
        if ('error' in result) {
            return c.json({ success: false, error: result.error }, 409);
        }
        return c.json({ success: true, data: result });
    });
    authRoutes.post('/login', async (c) => {
        const controller = getAppController(c.env);
        const { email, password } = await c.req.json();
        if (!email || !password) {
            return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        const result = await controller.loginUser(email, password);
        if ('error' in result) {
            return c.json({ success: false, error: result.error }, 401);
        }
        return c.json({ success: true, data: result });
    });
    app.route('/api/v1/auth', authRoutes);
    // Middleware for protected routes
    // TODO: Replace with a secure JWT verification middleware.
    const authMiddleware = async (c: any, next: any) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ success: false, error: 'Unauthorized' }, 401);
        }
        const token = authHeader.substring(7);
        const [userId, orgId] = token.split(':');
        if (!userId || !orgId) {
            return c.json({ success: false, error: 'Invalid token format' }, 401);
        }
        c.set('userId', userId);
        c.set('orgId', orgId);
        await next();
    };
    // Protected Workflow API
    const workflowRoutes = new Hono<{ Bindings: Env, Variables: { userId: string, orgId: string } }>();
    workflowRoutes.use('/*', authMiddleware);
    workflowRoutes.get('/', async (c) => {
        const controller = getAppController(c.env);
        const orgId = c.get('orgId');
        const workflows = await controller.getWorkflowsForOrg(orgId);
        return c.json({ success: true, data: workflows });
    });
    workflowRoutes.post('/', async (c) => {
        const controller = getAppController(c.env);
        const orgId = c.get('orgId');
        const { name } = await c.req.json();
        const newWorkflow = await controller.createWorkflow(name, orgId);
        return c.json({ success: true, data: newWorkflow }, 201);
    });
    workflowRoutes.get('/:id', async (c) => {
        const controller = getAppController(c.env);
        const orgId = c.get('orgId');
        const { id } = c.req.param();
        const workflow = await controller.getWorkflowById(id, orgId);
        if (!workflow) return c.json({ success: false, error: 'Workflow not found' }, 404);
        return c.json({ success: true, data: workflow });
    });
    workflowRoutes.put('/:id', async (c) => {
        const controller = getAppController(c.env);
        const orgId = c.get('orgId');
        const { id } = c.req.param();
        const { graph } = await c.req.json();
        const updatedWorkflow = await controller.updateWorkflow(id, graph, orgId);
        if (!updatedWorkflow) return c.json({ success: false, error: 'Workflow not found' }, 404);
        return c.json({ success: true, data: updatedWorkflow });
    });
    workflowRoutes.delete('/:id', async (c) => {
        const controller = getAppController(c.env);
        const orgId = c.get('orgId');
        const { id } = c.req.param();
        const result = await controller.deleteWorkflow(id, orgId);
        if (!result) return c.json({ success: false, error: 'Workflow not found' }, 404);
        return c.json({ success: true, data: result });
    });
    workflowRoutes.get('/:id/executions', (c) => {
        const { id } = c.req.param();
        // This remains mock as it's not part of the current scope.
        const executions = mockExecutions.filter(e => e.workflowId === id);
        return c.json({ success: true, data: executions });
    });
    app.route('/api/v1/workflows', workflowRoutes);
}