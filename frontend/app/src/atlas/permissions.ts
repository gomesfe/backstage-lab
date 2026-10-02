import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Ver a área interna do Atlas: a seção "Atlas" do menu (Catálogo, APIs,
 * Atlas × Jira, API Keys e Administração) e as abas "Interno do Atlas" do
 * Catálogo e do Mapa de provisionamento. Não é escolha do usuário: vem do
 * RBAC — role `atlas-team`, ligada ao grupo do time do Atlas em
 * `backend/rbac-policy.csv`.
 */
export const atlasInternalViewPermission = createPermission({
  name: 'atlas.internal.view',
  attributes: { action: 'read' },
});

/**
 * "Refresh admin" do Mapa de provisionamento (relê o inventário). Sem linha
 * própria no RBAC: fica com a role admin, pelo curinga dela.
 */
export const atlasProvisioningRefreshPermission = createPermission({
  name: 'atlas.provisioning.refresh',
  attributes: { action: 'update' },
});
