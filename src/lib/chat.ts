import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface AiChatResponse {
  success: boolean;
  data?: {
    content: string;
    suggestion?: string | null;
  };
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'openai/gpt-4o', name: 'ChatGPT 4o' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'grok/grok-4-latest', name: 'Grok 4 Latest' },
  { id: 'workers-ai/@cf/moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct' },
  { id: 'openai/gpt-5', name: 'ChatGPT 5' },
  { id: 'openai/gpt-5-mini', name: 'ChatGPT 5 Mini' },
  { id: 'openai/gpt-oss-120b', name: 'ChatGPT OSS 120B' },
  { id: 'cerebras/gpt-oss-120b', name: 'Cerebras ChatGPT OSS 120B' },
  { id: 'cerebras/qwen-3-coder-480b', name: 'Cerebras Qwen 3 Coder 480B' },
];
const extractJson = (text: string): { content: string; suggestion: string | null } => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match && match[1]) {
    try {
      // Validate if it's a parsable JSON
      JSON.parse(match[1]);
      const content = text.replace(jsonRegex, '').trim();
      return { content, suggestion: match[1] };
    } catch (e) {
      // Not a valid JSON, return as plain text
      return { content: text, suggestion: null };
    }
  }
  return { content: text, suggestion: null };
};
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(
    message: string,
    model?: string,
  ): Promise<AiChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: true }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
        }
        const parsedData = extractJson(fullResponse);
        return { success: true, data: parsedData };
      }
      return { success: false, error: 'Empty response body' };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<{ success: boolean; data?: ChatState; error?: string; }> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async clearMessages(): Promise<{ success: boolean; data?: ChatState; error?: string; }> {
    try {
      const response = await fetch(`${this.baseUrl}/clear`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to clear messages:', error);
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  getSessionId(): string {
    return this.sessionId;
  }
  newSession(): void {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete session' };
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update session title' };
    }
  }
  async clearAllSessions(): Promise<{ success: boolean; data?: { deletedCount: number }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to clear all sessions' };
    }
  }
  async updateModel(model: string): Promise<{ success: boolean; data?: ChatState; error?: string; }> {
    try {
      const response = await fetch(`${this.baseUrl}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update model:', error);
      return { success: false, error: 'Failed to update model' };
    }
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};
export const generateSessionTitle = (firstUserMessage?: string): string => {
  const now = new Date();
  const dateTime = now.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  if (!firstUserMessage || !firstUserMessage.trim()) {
    return `Chat ${dateTime}`;
  }
  const cleanMessage = firstUserMessage.trim().replace(/\s+/g, ' ');
  const truncated = cleanMessage.length > 40
    ? cleanMessage.slice(0, 37) + '...'
    : cleanMessage;
  return `${truncated} • ${dateTime}`;
};
export const renderToolCall = (toolCall: ToolCall): string => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | undefined;
  if (!result) return `⚠️ ${toolCall.name}: No result`;
  if ('error' in result) return `❌ ${toolCall.name}: ${result.error}`;
  if ('content' in result) return `🔧 ${toolCall.name}: Executed`;
  if (toolCall.name === 'get_weather') {
    const weather = result as WeatherResult;
    return `����️ Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`;
  }
  return `🔧 ${toolCall.name}: Done`;
};