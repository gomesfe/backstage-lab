import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import type { PolicyQuery, PolicyQueryUser } from '@backstage/plugin-permission-node';
import { AtlasPermissionPolicy } from './AtlasPermissionPolicy';
import { parsePolicy, PolicyParseError } from './policyFile';

const catalogRead = createPermission({
  name: 'catalog.entity.read',
  attributes: { action: 'read' },
  resourceType: 'catalog-entity',
});

const catalogDelete = createPermission({
  name: 'catalog.entity.delete',
  attributes: { action: 'delete' },
  resourceType: 'catalog-entity',
});

const taskCreate = createPermission({
  name: 'scaffolder.task.create',
  attributes: { action: 'create' },
});

function userFor(
  userEntityRef: string,
  ownershipEntityRefs: string[] = [],
): PolicyQueryUser {
  return {
    identity: {
      type: 'user',
      userEntityRef,
      ownershipEntityRefs,
    },
    credentials: {} as PolicyQueryUser['credentials'],
    info: { userEntityRef, ownershipEntityRefs },
  } as PolicyQueryUser;
}

const query = (permission: PolicyQuery['permission']): PolicyQuery => ({
  permission,
});

describe('AtlasPermissionPolicy', () => {
  const policyFor = (csv: string) => {
    const parsed = parsePolicy(csv);
    return new AtlasPermissionPolicy(() => parsed);
  };

  it('nega quem não está autenticado', async () => {
    const policy = policyFor('p, role:default/admin, *, *, allow');

    await expect(policy.handle(query(catalogRead))).resolves.toEqual({
      result: AuthorizeResult.DENY,
    });
  });

  it('nega quem não tem nenhuma role', async () => {
    const policy = policyFor(`
      p, role:default/admin, *, *, allow
      g, user:default/alice, role:default/admin
    `);

    await expect(
      policy.handle(query(catalogRead), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.DENY });
  });

  it('libera tudo para o curinga do admin', async () => {
    const policy = policyFor(`
      p, role:default/admin, *, *, allow
      g, user:default/alice, role:default/admin
    `);

    await expect(
      policy.handle(query(catalogDelete), userFor('user:default/alice')),
    ).resolves.toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('casa a regra pelo resourceType', async () => {
    const policy = policyFor(`
      p, role:default/atlas, catalog-entity, read, allow
      g, user:default/bob, role:default/atlas
    `);

    await expect(
      policy.handle(query(catalogRead), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('casa a regra pelo nome da permissão', async () => {
    const policy = policyFor(`
      p, role:default/atlas, scaffolder.task.create, create, allow
      g, user:default/bob, role:default/atlas
    `);

    await expect(
      policy.handle(query(taskCreate), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('não confunde ações diferentes do mesmo resourceType', async () => {
    const policy = policyFor(`
      p, role:default/atlas, catalog-entity, read, allow
      g, user:default/bob, role:default/atlas
    `);

    await expect(
      policy.handle(query(catalogDelete), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.DENY });
  });

  it('deixa o deny ganhar do allow, mesmo vindo depois', async () => {
    const policy = policyFor(`
      p, role:default/atlas, catalog-entity, delete, allow
      p, role:default/atlas, catalog.entity.delete, delete, deny
      g, user:default/bob, role:default/atlas
    `);

    await expect(
      policy.handle(query(catalogDelete), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.DENY });
  });

  it('deixa o deny ganhar mesmo quando vem de outra role do usuário', async () => {
    const policy = policyFor(`
      p, role:default/admin, *, *, allow
      p, role:default/travado, catalog.entity.delete, delete, deny
      g, user:default/bob, role:default/admin
      g, group:default/travados, role:default/travado
    `);

    await expect(
      policy.handle(
        query(catalogDelete),
        userFor('user:default/bob', ['group:default/travados']),
      ),
    ).resolves.toEqual({ result: AuthorizeResult.DENY });
  });

  it('herda role pelo grupo do usuário', async () => {
    const policy = policyFor(`
      p, role:default/atlas, catalog-entity, read, allow
      g, group:default/plataforma, role:default/atlas
    `);

    await expect(
      policy.handle(
        query(catalogRead),
        userFor('user:default/bob', ['group:default/plataforma']),
      ),
    ).resolves.toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('ignora diferença de caixa nos refs', async () => {
    const policy = policyFor(`
      p, role:default/atlas, catalog-entity, read, allow
      g, user:default/Bob, role:default/atlas
    `);

    await expect(
      policy.handle(query(catalogRead), userFor('user:default/bob')),
    ).resolves.toEqual({ result: AuthorizeResult.ALLOW });
  });
});

describe('parsePolicy', () => {
  it('ignora comentários, linhas vazias e espaços', () => {
    const parsed = parsePolicy(`
      # comentário

      p, role:default/admin, *, *, allow   # solta geral
      g, user:default/alice, role:default/admin
    `);

    expect(parsed.rules).toEqual([
      {
        role: 'role:default/admin',
        target: '*',
        action: '*',
        effect: 'allow',
      },
    ]);
    expect(parsed.bindings).toEqual([
      { subject: 'user:default/alice', role: 'role:default/admin' },
    ]);
  });

  it('reclama do número de campos apontando a linha', () => {
    expect(() => parsePolicy('\np, role:default/admin, *, allow')).toThrow(
      /linha 2/,
    );
  });

  it('reclama de efeito inválido', () => {
    expect(() =>
      parsePolicy('p, role:default/admin, *, *, talvez'),
    ).toThrow(PolicyParseError);
  });

  it('reclama de tipo de linha desconhecido', () => {
    expect(() => parsePolicy('x, role:default/admin')).toThrow(/tipo "x"/);
  });
});
