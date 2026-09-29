/**
 * Leitura do rbac-policy.csv.
 *
 * Formato (o mesmo do plugin RBAC do Backstage, estilo casbin):
 *
 *   p, <role>, <permissão ou resourceType>, <ação>, <allow|deny>
 *   g, <userRef ou groupRef>, <role>
 *
 * Exemplos:
 *
 *   p, role:default/admin, *, *, allow
 *   p, role:default/atlas, catalog-entity, read, allow
 *   p, role:default/atlas, scaffolder.task.create, create, allow
 *   p, role:default/guest, catalog-entity, delete, deny
 *   g, group:default/plataforma, role:default/admin
 *   g, user:default/felipe, role:default/atlas
 *
 * Regras de casamento, na ordem:
 *   1. `*` casa com qualquer coisa.
 *   2. o segundo campo casa com o NOME da permissão (ex: `catalog.entity.read`)
 *      ou com o resourceType dela (ex: `catalog-entity`).
 *   3. o terceiro campo casa com a ação (`read`, `create`, `update`, `delete`).
 */

export type PolicyRule = {
  role: string;
  /** Nome da permissão ou resourceType. `*` casa com tudo. */
  target: string;
  /** Ação. `*` casa com tudo. */
  action: string;
  effect: 'allow' | 'deny';
};

export type RoleBinding = {
  /** entityRef do usuário ou do grupo, em minúsculas. */
  subject: string;
  role: string;
};

export type RbacPolicy = {
  rules: PolicyRule[];
  bindings: RoleBinding[];
};

export class PolicyParseError extends Error {}

const EFFECTS = new Set(['allow', 'deny']);

export function parsePolicy(csv: string): RbacPolicy {
  const rules: PolicyRule[] = [];
  const bindings: RoleBinding[] = [];

  csv.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.split('#')[0].trim();
    if (!line) return;

    const lineNo = index + 1;
    const cells = line.split(',').map(c => c.trim());
    const [kind, ...rest] = cells;

    if (kind === 'p') {
      if (rest.length !== 4) {
        throw new PolicyParseError(
          `linha ${lineNo}: regra "p" precisa de 4 campos (role, alvo, ação, efeito), veio ${rest.length}`,
        );
      }
      const [role, target, action, effect] = rest;
      if (!EFFECTS.has(effect)) {
        throw new PolicyParseError(
          `linha ${lineNo}: efeito "${effect}" inválido, use allow ou deny`,
        );
      }
      rules.push({
        role: role.toLowerCase(),
        target,
        action,
        effect: effect as 'allow' | 'deny',
      });
      return;
    }

    if (kind === 'g') {
      if (rest.length !== 2) {
        throw new PolicyParseError(
          `linha ${lineNo}: vínculo "g" precisa de 2 campos (sujeito, role), veio ${rest.length}`,
        );
      }
      const [subject, role] = rest;
      bindings.push({
        subject: subject.toLowerCase(),
        role: role.toLowerCase(),
      });
      return;
    }

    throw new PolicyParseError(
      `linha ${lineNo}: tipo "${kind}" desconhecido, use "p" ou "g"`,
    );
  });

  return { rules, bindings };
}

/** Roles de um usuário, considerando ele mesmo e os grupos a que pertence. */
export function rolesFor(
  policy: RbacPolicy,
  subjects: readonly string[],
): Set<string> {
  const wanted = new Set(subjects.map(s => s.toLowerCase()));
  const roles = new Set<string>();
  for (const binding of policy.bindings) {
    if (wanted.has(binding.subject)) {
      roles.add(binding.role);
    }
  }
  return roles;
}
