import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

// Formatos do backend `api-keys` (os nomes dos campos são os da API).

export type StatusChave = 'active' | 'revoked' | 'expired';

export type Chave = {
  id: string;
  /** Começo da chave, para reconhecer sem expor o segredo. */
  prefix: string;
  description: string;
  owner: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  status: StatusChave;
};

/** Só a criação devolve `secret`: o backend guarda apenas o hash. */
export type ChaveCriada = Chave & { secret: string };

/** Cliente do backend `api-keys`. */
export class ApiKeysClient {
  constructor(
    private readonly discovery: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async pedir<T>(caminho: string, init?: RequestInit): Promise<T> {
    const base = await this.discovery.getBaseUrl('api-keys');
    const resposta = await this.fetchApi.fetch(`${base}${caminho}`, init);
    if (!resposta.ok) throw await ResponseError.fromResponse(resposta);
    return resposta.status === 204
      ? (undefined as T)
      : ((await resposta.json()) as T);
  }

  async listar(): Promise<Chave[]> {
    return (await this.pedir<{ items: Chave[] }>('/keys')).items;
  }

  criar(dados: {
    description: string;
    ttlSeconds: number | null;
  }): Promise<ChaveCriada> {
    return this.pedir<ChaveCriada>('/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  }

  async revogar(id: string): Promise<void> {
    await this.pedir<void>(`/keys/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
