import type Anthropic from '@anthropic-ai/sdk';
import type { BackstageCredentials } from '@backstage/backend-plugin-api';
import type { CatalogService } from '@backstage/plugin-catalog-node';
import { parseEntityRef, stringifyEntityRef, type Entity } from '@backstage/catalog-model';

/**
 * Ferramentas do agente: só leitura, e sempre com as credenciais de quem está
 * conversando. O agente enxerga do catálogo exatamente o que a pessoa
 * enxergaria no portal — o RBAC vale para ele também.
 */

const KINDS = ['Component', 'API', 'System', 'Resource', 'Group', 'Template'] as const;
type Kind = (typeof KINDS)[number];

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: 'buscar_catalogo',
    description:
      'Busca entidades no catálogo do Atlas: aplicações (Component), APIs, sistemas, recursos de nuvem (Resource), ' +
      'squads (Group) e ofertas de provisionamento (tipo Template). Use para responder o que existe, de quem é, ' +
      'e qual oferta usar para provisionar algo. Devolve até 15 resultados com o link de cada um no portal.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        texto: {
          type: 'string',
          description: 'Termo livre procurado no nome, título, descrição e tags. Omita para listar tudo do tipo.',
        },
        tipo: { type: 'string', enum: [...KINDS], description: 'Tipo de entidade.' },
        dono: { type: 'string', description: 'Nome do grupo dono, ex.: pagamentos.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'detalhar_entidade',
    description:
      'Detalhes de uma entidade do catálogo a partir da referência (ex.: component:default/pagamentos-api ou ' +
      'template:default/aws-s3): descrição, dono, ciclo de vida, sistema, tags, relações e link no portal.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Referência da entidade, no formato kind:namespace/nome.' },
      },
      required: ['ref'],
      additionalProperties: false,
    },
  },
];

type SearchInput = { texto?: string; tipo?: Kind; dono?: string };
type DetailInput = { ref: string };

/**
 * Valida a entrada contra o schema antes de rodar. Com eager input streaming
 * o servidor não valida mais — e o parser tolerante do SDK pode devolver um
 * objeto truncado sem erro. Entrada inválida vira `tool_result` de erro.
 */
function validateSearch(input: unknown): SearchInput | string {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return 'entrada não é um objeto';
  const { texto, tipo, dono, ...rest } = input as Record<string, unknown>;
  if (Object.keys(rest).length) return `campos desconhecidos: ${Object.keys(rest).join(', ')}`;
  if (texto !== undefined && typeof texto !== 'string') return 'texto deve ser string';
  if (dono !== undefined && typeof dono !== 'string') return 'dono deve ser string';
  if (tipo !== undefined && !KINDS.includes(tipo as Kind)) return `tipo deve ser um de ${KINDS.join(', ')}`;
  return { texto: texto?.trim() || undefined, tipo: tipo as Kind | undefined, dono: dono?.trim() || undefined };
}

function validateDetail(input: unknown): DetailInput | string {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return 'entrada não é um objeto';
  const { ref, ...rest } = input as Record<string, unknown>;
  if (Object.keys(rest).length) return `campos desconhecidos: ${Object.keys(rest).join(', ')}`;
  if (typeof ref !== 'string' || !ref.trim()) return 'ref é obrigatório';
  return { ref: ref.trim() };
}

/** Link da entidade no portal: ofertas (templates) abrem o formulário da oferta. */
function portalLink(entity: Entity): string {
  const namespace = entity.metadata.namespace ?? 'default';
  if (entity.kind === 'Template') return `/create/templates/${namespace}/${entity.metadata.name}`;
  return `/catalog/${namespace}/${entity.kind.toLowerCase()}/${entity.metadata.name}`;
}

function summarize(entity: Entity) {
  const spec = (entity.spec ?? {}) as Record<string, unknown>;
  return {
    ref: stringifyEntityRef(entity),
    tipo: entity.kind,
    titulo: entity.metadata.title ?? entity.metadata.name,
    descricao: entity.metadata.description?.slice(0, 280),
    subtipo: spec.type,
    dono: spec.owner,
    ciclo_de_vida: spec.lifecycle,
    categoria: entity.metadata.annotations?.['atlas.nuclea.com.br/categoria'],
    tags: entity.metadata.tags,
    link: portalLink(entity),
  };
}

export type ToolRun = {
  /** O que mostrar na conversa ("Buscou no catálogo: redis"). */
  label: string;
  /** Conteúdo do tool_result, em JSON. */
  content: string;
  isError: boolean;
};

export async function runTool(
  name: string,
  input: unknown,
  deps: { catalog: CatalogService; credentials: BackstageCredentials },
): Promise<ToolRun> {
  const { catalog, credentials } = deps;

  if (name === 'buscar_catalogo') {
    const parsed = validateSearch(input);
    if (typeof parsed === 'string') {
      return { label: 'Busca no catálogo inválida', content: JSON.stringify({ erro: parsed }), isError: true };
    }
    const filter: Record<string, string | string[]> = {};
    if (parsed.tipo) filter.kind = parsed.tipo;
    else filter.kind = [...KINDS];
    if (parsed.dono) {
      // O dono pode estar gravado de três formas; aceita todas.
      filter['spec.owner'] = [parsed.dono, `group:${parsed.dono}`, `group:default/${parsed.dono}`];
    }
    const response = await catalog.queryEntities(
      {
        filter,
        limit: 15,
        ...(parsed.texto
          ? { fullTextFilter: { term: parsed.texto, fields: ['metadata.name', 'metadata.title', 'metadata.description', 'metadata.tags'] } }
          : {}),
      },
      { credentials },
    );
    const label = ['Buscou no catálogo', parsed.texto && `“${parsed.texto}”`, parsed.tipo, parsed.dono && `dono ${parsed.dono}`]
      .filter(Boolean)
      .join(' · ');
    return {
      label,
      content: JSON.stringify({ total: response.totalItems, resultados: response.items.map(summarize) }),
      isError: false,
    };
  }

  if (name === 'detalhar_entidade') {
    const parsed = validateDetail(input);
    if (typeof parsed === 'string') {
      return { label: 'Consulta de entidade inválida', content: JSON.stringify({ erro: parsed }), isError: true };
    }
    let ref: string;
    try {
      ref = stringifyEntityRef(parseEntityRef(parsed.ref, { defaultNamespace: 'default' }));
    } catch {
      return { label: `Referência inválida: ${parsed.ref}`, content: JSON.stringify({ erro: 'referência inválida' }), isError: true };
    }
    const entity = await catalog.getEntityByRef(ref, { credentials });
    if (!entity) {
      return { label: `Consultou ${ref}`, content: JSON.stringify({ erro: 'entidade não encontrada ou sem permissão' }), isError: false };
    }
    const spec = (entity.spec ?? {}) as Record<string, unknown>;
    return {
      label: `Consultou ${ref}`,
      content: JSON.stringify({
        ...summarize(entity),
        descricao: entity.metadata.description,
        sistema: spec.system,
        relacoes: (entity.relations ?? []).slice(0, 30).map(r => `${r.type} ${r.targetRef}`),
        links: entity.metadata.links?.map(l => ({ titulo: l.title, url: l.url })),
        tem_techdocs: Boolean(entity.metadata.annotations?.['backstage.io/techdocs-ref']),
      }),
      isError: false,
    };
  }

  return { label: `Ferramenta desconhecida: ${name}`, content: JSON.stringify({ erro: 'ferramenta desconhecida' }), isError: true };
}
