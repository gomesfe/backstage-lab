import { json } from 'express';
import type { Request, Router } from 'express';
// Router do express-promise-router, e não o do express: handlers async que
// lançam precisam virar `next(err)` para o middleware de erro do Backstage
// responder. Com o Router puro do express 4, a requisição fica pendurada.
import PromiseRouter from 'express-promise-router';
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import type {
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  type BasicPermission,
} from '@backstage/plugin-permission-common';
import type { ApiKey, ApiKeyStore } from '../database/ApiKeyStore';
import {
  apiKeyCreatePermission,
  apiKeyReadAllPermission,
  apiKeyReadPermission,
  apiKeyRevokeAnyPermission,
} from '../permissions';

/** Teto de 1 ano. Chave eterna existe, mas tem que ser pedida explicitamente. */
const MAX_TTL_SECONDS = 365 * 24 * 60 * 60;

type Options = {
  store: ApiKeyStore;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  logger: LoggerService;
};

function serialize(key: ApiKey) {
  return {
    id: key.id,
    prefix: key.prefix,
    description: key.description,
    owner: key.owner,
    createdAt: key.createdAt.toISOString(),
    expiresAt: key.expiresAt?.toISOString() ?? null,
    revokedAt: key.revokedAt?.toISOString() ?? null,
    lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
    status: statusOf(key),
  };
}

function statusOf(key: ApiKey): 'active' | 'revoked' | 'expired' {
  if (key.revokedAt !== null) return 'revoked';
  if (key.expiresAt !== null && key.expiresAt.getTime() <= Date.now()) {
    return 'expired';
  }
  return 'active';
}

export async function createRouter(options: Options): Promise<Router> {
  const { store, httpAuth, permissions, logger } = options;
  const router: Router = PromiseRouter();
  router.use(json());

  /** Roda a checagem de permissão e devolve o entityRef de quem pediu. */
  const authorize = async (
    req: Request,
    permission: BasicPermission,
  ): Promise<string> => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const [decision] = await permissions.authorize([{ permission }], {
      credentials,
    });
    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError(
        `Sem permissão para ${permission.name}`,
      );
    }
    return credentials.principal.userEntityRef;
  };

  router.get('/keys', async (req, res) => {
    const owner = await authorize(req, apiKeyReadPermission);

    // Ver as chaves dos outros é uma permissão à parte: quem não tem, vê só
    // as suas, sem receber 403 — a lista simplesmente é menor.
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const [all] = await permissions.authorize(
      [{ permission: apiKeyReadAllPermission }],
      { credentials },
    );

    const keys =
      all.result === AuthorizeResult.ALLOW
        ? await store.listAll()
        : await store.listByOwner(owner);

    res.json({ items: keys.map(serialize) });
  });

  router.post('/keys', async (req, res) => {
    const owner = await authorize(req, apiKeyCreatePermission);

    const { description, ttlSeconds } = req.body ?? {};
    if (typeof description !== 'string' || description.trim() === '') {
      throw new InputError('"description" é obrigatório');
    }

    let ttl: number | null;
    if (ttlSeconds === null || ttlSeconds === undefined) {
      ttl = null;
    } else if (
      typeof ttlSeconds !== 'number' ||
      !Number.isFinite(ttlSeconds) ||
      ttlSeconds <= 0
    ) {
      throw new InputError('"ttlSeconds" precisa ser um número positivo ou null');
    } else if (ttlSeconds > MAX_TTL_SECONDS) {
      throw new InputError(
        `"ttlSeconds" acima do teto de ${MAX_TTL_SECONDS} (1 ano)`,
      );
    } else {
      ttl = ttlSeconds;
    }

    const created = await store.create({
      description: description.trim(),
      owner,
      ttlSeconds: ttl,
    });

    logger.info(
      `API key ${created.key.prefix} emitida para ${owner}` +
        (ttl === null ? ' sem expiração' : ` com TTL de ${ttl}s`),
    );

    // Única resposta que contém o segredo.
    res.status(201).json({ ...serialize(created.key), secret: created.secret });
  });

  router.delete('/keys/:id', async (req, res) => {
    const requester = await authorize(req, apiKeyReadPermission);
    const { id } = req.params;

    const key = await store.getById(id);
    if (!key) {
      throw new NotFoundError(`API key ${id} não encontrada`);
    }

    if (key.owner !== requester) {
      await authorize(req, apiKeyRevokeAnyPermission);
    }

    const revoked = await store.revoke(id);
    logger.info(
      revoked
        ? `API key ${key.prefix} revogada por ${requester}`
        : `API key ${key.prefix} já estava revogada`,
    );

    res.status(204).end();
  });

  return router;
}
