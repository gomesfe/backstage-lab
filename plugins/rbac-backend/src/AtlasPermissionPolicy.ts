import {
  AuthorizeResult,
  isResourcePermission,
  type Permission,
  type PolicyDecision,
} from '@backstage/plugin-permission-common';
import type {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { rolesFor, type RbacPolicy } from './policyFile';

/**
 * Decide cada pedido de autorização a partir do rbac-policy.csv.
 *
 * Ordem de decisão:
 *   1. requisição sem usuário (não autenticado) → DENY
 *   2. qualquer regra `deny` que case → DENY  (deny sempre ganha)
 *   3. qualquer regra `allow` que case → ALLOW
 *   4. nada casou → DENY  (o padrão é fechado)
 *
 * "Deny ganha" e "o padrão é fechado" são as duas propriedades que tornam o
 * arquivo auditável: dá para responder "quem pode fazer X?" lendo só as linhas
 * que mencionam X, sem precisar simular a ordem de avaliação.
 */
export class AtlasPermissionPolicy implements PermissionPolicy {
  constructor(private readonly getPolicy: () => RbacPolicy) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    if (!user) {
      return { result: AuthorizeResult.DENY };
    }

    const policy = this.getPolicy();
    const subjects = [
      user.info.userEntityRef,
      ...user.info.ownershipEntityRefs,
    ];
    const roles = rolesFor(policy, subjects);
    if (roles.size === 0) {
      return { result: AuthorizeResult.DENY };
    }

    const targets = targetsOf(request.permission);
    const action = actionOf(request.permission);

    let allowed = false;
    for (const rule of policy.rules) {
      if (!roles.has(rule.role)) continue;
      if (!matches(rule.target, targets)) continue;
      if (!actionMatches(rule.action, action)) continue;

      if (rule.effect === 'deny') {
        return { result: AuthorizeResult.DENY };
      }
      allowed = true;
    }

    return { result: allowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
  }
}

/** Uma permissão casa pelo próprio nome ou pelo resourceType dela. */
function targetsOf(permission: Permission): string[] {
  const targets = [permission.name];
  if (isResourcePermission(permission)) {
    targets.push(permission.resourceType);
  }
  return targets;
}

/**
 * Nem toda permissão declara uma ação. `scaffolder.action.execute` e
 * `scaffolder.task.cancel`, por exemplo, têm `attributes: {}`.
 */
function actionOf(permission: Permission): string | undefined {
  return permission.attributes.action;
}

/**
 * Uma permissão sem ação só casa com o curinga.
 *
 * A alternativa — assumir uma ação padrão — cria um erro silencioso: a regra
 * parece certa no CSV, nunca casa, e o default fechado devolve um deny que
 * não aponta para a linha errada. Exigir `*` obriga quem escreve a regra a
 * perceber que aquela permissão não tem ação.
 */
function actionMatches(
  ruleAction: string,
  permissionAction: string | undefined,
): boolean {
  if (ruleAction === '*') return true;
  if (permissionAction === undefined) return false;
  return ruleAction === permissionAction;
}

function matches(ruleTarget: string, targets: readonly string[]): boolean {
  return ruleTarget === '*' || targets.includes(ruleTarget);
}
