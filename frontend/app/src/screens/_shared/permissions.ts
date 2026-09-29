import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permissões do Atlas que só existem nas telas deste portal.
 *
 * Quem decide é o RBAC (`rbac-policy.csv`), pelo nome e pela ação — a mesma
 * política que já governa catálogo, scaffolder e API keys. A tela só pergunta
 * com `usePermission` e esconde o que o usuário não pode usar.
 */

/** Ver e agir em "Minhas aprovações" (aprovar/rejeitar solicitações). */
export const approvalsReviewPermission = createPermission({
  name: 'atlas.approvals.review',
  attributes: { action: 'update' },
});

/** Botão "Refresh admin" do mapa de provisionamento. */
export const provisioningRefreshPermission = createPermission({
  name: 'atlas.provisioning.refresh',
  attributes: { action: 'update' },
});
