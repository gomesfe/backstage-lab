import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permissões do plugin, para o rbac-policy.csv poder falar sobre elas.
 *
 * `read` e `create` são de quem usa o portal; `readAll` e `revokeAny` são de
 * administração — ver e revogar chave dos outros.
 */
export const apiKeyReadPermission = createPermission({
  name: 'api-keys.key.read',
  attributes: { action: 'read' },
});

export const apiKeyCreatePermission = createPermission({
  name: 'api-keys.key.create',
  attributes: { action: 'create' },
});

export const apiKeyReadAllPermission = createPermission({
  name: 'api-keys.key.read-all',
  attributes: { action: 'read' },
});

export const apiKeyRevokeAnyPermission = createPermission({
  name: 'api-keys.key.revoke-any',
  attributes: { action: 'delete' },
});

export const apiKeysPermissions = [
  apiKeyReadPermission,
  apiKeyCreatePermission,
  apiKeyReadAllPermission,
  apiKeyRevokeAnyPermission,
];
