import {
  createApiRef,
  type DiscoveryApi,
  type FetchApi,
} from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export type ApiKey = {
  id: string;
  prefix: string;
  description: string;
  owner: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  status: ApiKeyStatus;
};

/** Só a criação devolve `secret`. */
export type CreatedApiKey = ApiKey & { secret: string };

export interface ApiKeysApi {
  list(): Promise<ApiKey[]>;
  create(input: {
    description: string;
    ttlSeconds: number | null;
  }): Promise<CreatedApiKey>;
  revoke(id: string): Promise<void>;
}

export const apiKeysApiRef = createApiRef<ApiKeysApi>({
  id: 'plugin.admin.api-keys',
});

export class ApiKeysClient implements ApiKeysApi {
  constructor(
    private readonly options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi },
  ) {}

  private async baseUrl(): Promise<string> {
    return this.options.discoveryApi.getBaseUrl('api-keys');
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.options.fetchApi.fetch(
      `${await this.baseUrl()}${path}`,
      init,
    );
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.status === 204
      ? (undefined as T)
      : ((await response.json()) as T);
  }

  async list(): Promise<ApiKey[]> {
    const { items } = await this.request<{ items: ApiKey[] }>('/keys');
    return items;
  }

  async create(input: {
    description: string;
    ttlSeconds: number | null;
  }): Promise<CreatedApiKey> {
    return this.request<CreatedApiKey>('/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  }

  async revoke(id: string): Promise<void> {
    await this.request<void>(`/keys/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
