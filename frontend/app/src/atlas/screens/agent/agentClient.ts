import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export type AgentStatus = { configured: boolean; model: string; reason?: string };
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string };
export type Activity = { tool: string; label: string };
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  activity: Activity[];
  createdAt: string;
};

export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'activity'; label: string }
  | { type: 'reset' }
  | { type: 'done'; message: ChatMessage; conversation?: Conversation }
  | { type: 'failed'; message: string };

/** Cliente do backend `atlas-agent`. */
export class AgentClient {
  constructor(private readonly discovery: DiscoveryApi, private readonly fetchApi: FetchApi) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const base = await this.discovery.getBaseUrl('atlas-agent');
    const response = await this.fetchApi.fetch(`${base}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => undefined);
      throw new Error(body?.error?.message ?? `Erro ${response.status}`);
    }
    return (response.status === 204 ? undefined : await response.json()) as T;
  }

  status() {
    return this.request<AgentStatus>('/status');
  }
  async list() {
    return (await this.request<{ conversations: Conversation[] }>('/conversations')).conversations;
  }
  create() {
    return this.request<Conversation>('/conversations', { method: 'POST' });
  }
  get(id: string) {
    return this.request<{ conversation: Conversation; messages: ChatMessage[] }>(`/conversations/${id}`);
  }
  remove(id: string) {
    return this.request<void>(`/conversations/${id}`, { method: 'DELETE' });
  }

  /**
   * Manda a mensagem e lê a resposta por Server-Sent Events, chamando
   * `onEvent` a cada evento. Termina quando o servidor fecha o stream.
   */
  async send(id: string, content: string, onEvent: (event: StreamEvent) => void, signal: AbortSignal) {
    const base = await this.discovery.getBaseUrl('atlas-agent');
    const response = await this.fetchApi.fetch(`${base}/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ content }),
      signal,
    });
    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => undefined);
      throw new Error(body?.error?.message ?? `Erro ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Eventos SSE terminam em linha em branco.
      let boundary = buffer.indexOf('\n\n');
      while (boundary >= 0) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const eventLine = chunk.split('\n').find(l => l.startsWith('event: '));
        const dataLine = chunk.split('\n').find(l => l.startsWith('data: '));
        if (eventLine && dataLine) {
          const type = eventLine.slice(7).trim();
          const data = JSON.parse(dataLine.slice(6));
          onEvent({ ...data, type } as StreamEvent);
        }
        boundary = buffer.indexOf('\n\n');
      }
    }
  }
}
