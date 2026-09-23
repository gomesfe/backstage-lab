import { resolve as resolvePath } from 'node:path';
import { TestDatabases } from '@backstage/backend-test-utils';
import type { Knex } from 'knex';
import { ApiKeyStore, hashSecret } from './ApiKeyStore';

const MIGRATIONS_DIR = resolvePath(__dirname, '../../migrations');

describe('ApiKeyStore', () => {
  const databases = TestDatabases.create({ ids: ['SQLITE_3'] });

  let knex: Knex;
  let store: ApiKeyStore;

  beforeEach(async () => {
    knex = await databases.init('SQLITE_3');
    await knex.migrate.latest({ directory: MIGRATIONS_DIR });
    store = new ApiKeyStore(knex);
  });

  afterEach(async () => {
    await knex.destroy();
  });

  const createOne = (overrides: Partial<Parameters<ApiKeyStore['create']>[0]> = {}) =>
    store.create({
      description: 'pipeline de deploy',
      owner: 'user:default/gomesfe',
      ttlSeconds: null,
      ...overrides,
    });

  it('devolve o segredo apenas na criação e guarda só o hash', async () => {
    const { key, secret } = await createOne();

    expect(secret).toMatch(/^atlas_[0-9a-f]{8}_/);
    expect(secret.startsWith(key.prefix)).toBe(true);

    const row = await knex('api_keys').where({ id: key.id }).first();
    expect(row.secret_hash).toBe(hashSecret(secret));
    // o segredo em claro não pode estar em nenhuma coluna
    expect(JSON.stringify(row)).not.toContain(secret);
  });

  it('gera segredos distintos a cada chamada', async () => {
    const a = await createOne();
    const b = await createOne();
    expect(a.secret).not.toEqual(b.secret);
    expect(a.key.prefix).not.toEqual(b.key.prefix);
  });

  it('valida um segredo bom e registra o uso', async () => {
    const { key, secret } = await createOne();
    expect(key.lastUsedAt).toBeNull();

    const validated = await store.validate(secret);

    expect(validated?.id).toBe(key.id);
    expect(validated?.lastUsedAt).toBeInstanceOf(Date);

    const persisted = await store.getById(key.id);
    expect(persisted?.lastUsedAt).not.toBeNull();
  });

  it('recusa um segredo inexistente', async () => {
    await createOne();
    await expect(store.validate('atlas_deadbeef_nope')).resolves.toBeUndefined();
  });

  it('recusa uma chave revogada', async () => {
    const { key, secret } = await createOne();
    await store.revoke(key.id);

    await expect(store.validate(secret)).resolves.toBeUndefined();
  });

  it('recusa uma chave expirada, mas aceita um instante antes', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const { secret } = await createOne({ ttlSeconds: 60, now });

    const antes = new Date(now.getTime() + 59_000);
    const depois = new Date(now.getTime() + 60_000);

    await expect(store.validate(secret, antes)).resolves.toBeDefined();
    await expect(store.validate(secret, depois)).resolves.toBeUndefined();
  });

  it('revoga de forma idempotente, preservando o carimbo original', async () => {
    const { key } = await createOne();
    const primeira = new Date('2026-01-01T00:00:00Z');

    await expect(store.revoke(key.id, primeira)).resolves.toBe(true);
    await expect(
      store.revoke(key.id, new Date('2026-06-01T00:00:00Z')),
    ).resolves.toBe(false);

    const persisted = await store.getById(key.id);
    expect(persisted?.revokedAt?.toISOString()).toBe(primeira.toISOString());
  });

  it('mantém a linha após a revogação, para auditoria', async () => {
    const { key } = await createOne();
    await store.revoke(key.id);

    await expect(store.getById(key.id)).resolves.toBeDefined();
    await expect(knex('api_keys').count({ n: '*' }).first()).resolves.toEqual({
      n: 1,
    });
  });

  it('separa as chaves por dono', async () => {
    await createOne({ owner: 'user:default/alice' });
    await createOne({ owner: 'user:default/alice' });
    await createOne({ owner: 'user:default/bob' });

    await expect(store.listByOwner('user:default/alice')).resolves.toHaveLength(
      2,
    );
    await expect(store.listByOwner('user:default/bob')).resolves.toHaveLength(1);
    await expect(store.listAll()).resolves.toHaveLength(3);
  });
});
