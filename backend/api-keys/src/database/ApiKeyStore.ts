import { createHash, randomBytes } from 'node:crypto';
import { v4 as uuid } from 'uuid';
import type { Knex } from 'knex';

export type ApiKey = {
  id: string;
  prefix: string;
  description: string;
  owner: string;
  createdAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
};

export type CreatedApiKey = {
  key: ApiKey;
  /** A chave em claro. Devolvida uma única vez, nunca mais recuperável. */
  secret: string;
};

type Row = {
  id: string;
  prefix: string;
  secret_hash: string;
  description: string;
  owner: string;
  created_at: Date | string;
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
  last_used_at: Date | string | null;
};

const PREFIX = 'atlas';
/** Bytes de entropia do segredo. 32 bytes = 256 bits. */
const SECRET_BYTES = 32;

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex');
}

/** SQLite devolve datas como número/string; normalizamos na saída. */
function toDate(value: Date | string | null): Date | null {
  if (value === null || value === undefined) return null;
  return value instanceof Date ? value : new Date(value);
}

function toApiKey(row: Row): ApiKey {
  return {
    id: row.id,
    prefix: row.prefix,
    description: row.description,
    owner: row.owner,
    createdAt: toDate(row.created_at)!,
    expiresAt: toDate(row.expires_at),
    revokedAt: toDate(row.revoked_at),
    lastUsedAt: toDate(row.last_used_at),
  };
}

export class ApiKeyStore {
  constructor(private readonly db: Knex) {}

  async create(options: {
    description: string;
    owner: string;
    ttlSeconds: number | null;
    now?: Date;
  }): Promise<CreatedApiKey> {
    const now = options.now ?? new Date();
    // `atlas_<id curto>_<segredo>`: o prefixo deixa a chave reconhecível num
    // log ou num .env sem revelar o segredo.
    const body = randomBytes(SECRET_BYTES).toString('base64url');
    const shortId = randomBytes(4).toString('hex');
    const secret = `${PREFIX}_${shortId}_${body}`;
    const prefix = `${PREFIX}_${shortId}`;

    const row: Row = {
      id: uuid(),
      prefix,
      secret_hash: hashSecret(secret),
      description: options.description,
      owner: options.owner,
      created_at: now,
      expires_at:
        options.ttlSeconds === null
          ? null
          : new Date(now.getTime() + options.ttlSeconds * 1000),
      revoked_at: null,
      last_used_at: null,
    };

    await this.db<Row>('api_keys').insert(row);
    return { key: toApiKey(row), secret };
  }

  async listByOwner(owner: string): Promise<ApiKey[]> {
    const rows = await this.db<Row>('api_keys')
      .where({ owner })
      .orderBy('created_at', 'desc');
    return rows.map(toApiKey);
  }

  async listAll(): Promise<ApiKey[]> {
    const rows = await this.db<Row>('api_keys').orderBy('created_at', 'desc');
    return rows.map(toApiKey);
  }

  async getById(id: string): Promise<ApiKey | undefined> {
    const row = await this.db<Row>('api_keys').where({ id }).first();
    return row ? toApiKey(row) : undefined;
  }

  /** Revogação é idempotente: revogar de novo não muda o carimbo original. */
  async revoke(id: string, now: Date = new Date()): Promise<boolean> {
    const affected = await this.db<Row>('api_keys')
      .where({ id })
      .whereNull('revoked_at')
      .update({ revoked_at: now });
    return affected > 0;
  }

  /**
   * Valida um segredo. Devolve a chave quando ela existe, não foi revogada e
   * não expirou — e registra o uso.
   */
  async validate(
    secret: string,
    now: Date = new Date(),
  ): Promise<ApiKey | undefined> {
    const row = await this.db<Row>('api_keys')
      .where({ secret_hash: hashSecret(secret) })
      .first();
    if (!row) return undefined;

    const key = toApiKey(row);
    if (key.revokedAt !== null) return undefined;
    if (key.expiresAt !== null && key.expiresAt.getTime() <= now.getTime()) {
      return undefined;
    }

    await this.db<Row>('api_keys')
      .where({ id: key.id })
      .update({ last_used_at: now });

    return { ...key, lastUsedAt: now };
  }
}
