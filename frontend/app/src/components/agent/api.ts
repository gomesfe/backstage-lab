import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

// Formatos do backend `atlas-agent` (os nomes dos campos são os da API).

export type StatusAgente = {
  configured: boolean;
  model: string;
  reason?: string;
};

export type Conversa = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

/** Uma consulta que o agente fez antes de responder ("Buscou no catálogo · website"). */
export type Atividade = { tool: string; label: string };

export type Mensagem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  activity: Atividade[];
  createdAt: string;
};

export type EventoResposta =
  | { type: 'delta'; text: string }
  | { type: 'activity'; label: string }
  | { type: 'reset' }
  | { type: 'done'; message: Mensagem; conversation?: Conversa }
  | { type: 'failed'; message: string };

/** Cliente do backend `atlas-agent`. */
export class AgenteClient {
  constructor(
    private readonly discovery: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async pedir<T>(caminho: string, init?: RequestInit): Promise<T> {
    const base = await this.discovery.getBaseUrl('atlas-agent');
    const resposta = await this.fetchApi.fetch(`${base}${caminho}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => undefined);
      throw new Error(corpo?.error?.message ?? `Erro ${resposta.status}`);
    }
    return (resposta.status === 204 ? undefined : await resposta.json()) as T;
  }

  status() {
    return this.pedir<StatusAgente>('/status');
  }

  async listar() {
    return (await this.pedir<{ conversations: Conversa[] }>('/conversations'))
      .conversations;
  }

  criar() {
    return this.pedir<Conversa>('/conversations', { method: 'POST' });
  }

  abrir(id: string) {
    return this.pedir<{ conversation: Conversa; messages: Mensagem[] }>(
      `/conversations/${id}`,
    );
  }

  apagar(id: string) {
    return this.pedir<void>(`/conversations/${id}`, { method: 'DELETE' });
  }

  /**
   * Manda a mensagem e lê a resposta por Server-Sent Events, chamando
   * `aoReceber` a cada evento. Termina quando o servidor fecha o stream.
   */
  async enviar(
    id: string,
    conteudo: string,
    aoReceber: (evento: EventoResposta) => void,
    signal: AbortSignal,
  ) {
    const base = await this.discovery.getBaseUrl('atlas-agent');
    const resposta = await this.fetchApi.fetch(
      `${base}/conversations/${id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ content: conteudo }),
        signal,
      },
    );
    if (!resposta.ok || !resposta.body) {
      const corpo = await resposta.json().catch(() => undefined);
      throw new Error(corpo?.error?.message ?? `Erro ${resposta.status}`);
    }

    const leitor = resposta.body.getReader();
    const decodificador = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await leitor.read();
      if (done) break;
      buffer += decodificador.decode(value, { stream: true });
      // Eventos SSE terminam em linha em branco.
      let fim = buffer.indexOf('\n\n');
      while (fim >= 0) {
        const bloco = buffer.slice(0, fim);
        buffer = buffer.slice(fim + 2);
        const linhaEvento = bloco
          .split('\n')
          .find(linha => linha.startsWith('event: '));
        const linhaDados = bloco
          .split('\n')
          .find(linha => linha.startsWith('data: '));
        if (linhaEvento && linhaDados) {
          const tipo = linhaEvento.slice(7).trim();
          const dados = JSON.parse(linhaDados.slice(6));
          aoReceber({ ...dados, type: tipo } as EventoResposta);
        }
        fim = buffer.indexOf('\n\n');
      }
    }
  }
}
