#!/usr/bin/env node
/**
 * Gera os software templates de recurso AWS a partir de templates/aws/specs/.
 *
 * Os 13 templates de recurso são o mesmo template com inputs diferentes:
 * todos perguntam nome/squad/ambiente, todos geram um módulo Terraform com o
 * mesmo backend, a mesma convenção de nome e as mesmas tags, e todos abrem PR
 * no repositório de infraestrutura.
 *
 * Escrever os 13 YAMLs à mão significaria corrigir a convenção de tags em 13
 * lugares quando ela mudar — e esquecer de um. Aqui a convenção mora neste
 * arquivo e cada spec diz só o que é específico do recurso.
 *
 *   node scripts/generate-aws-templates.mjs
 *   node scripts/generate-aws-templates.mjs --check   (falha se houver diferença)
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as toYaml } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPECS_DIR = join(ROOT, 'templates/aws/specs');
const OUT_DIR = join(ROOT, 'templates/aws/generated');

const CHECK = process.argv.includes('--check');

const AMBIENTES = ['dev', 'hml', 'prd'];

/** Perguntas que todo recurso faz, na mesma ordem e com o mesmo texto. */
function commonParameters() {
  return {
    title: 'O recurso',
    required: ['nome', 'squad', 'ambiente'],
    properties: {
      nome: {
        title: 'Nome do recurso',
        type: 'string',
        description: 'kebab-case. Entra no nome final junto com squad e ambiente.',
        pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
        'ui:autofocus': true,
      },
      squad: {
        title: 'Squad dona',
        type: 'string',
        'ui:field': 'OwnerPicker',
        'ui:options': { catalogFilter: { kind: 'Group' } },
      },
      ambiente: {
        title: 'Ambiente',
        type: 'string',
        default: 'dev',
        enum: AMBIENTES,
      },
    },
  };
}

function destinationParameters() {
  return {
    title: 'Onde publicar',
    required: ['repoUrl'],
    properties: {
      repoUrl: {
        title: 'Repositório de infraestrutura',
        type: 'string',
        'ui:field': 'RepoUrlPicker',
        'ui:options': { allowedHosts: ['github.com'] },
      },
    },
  };
}

/** Converte a lista de parâmetros do spec no JSON Schema do scaffolder. */
function specParameters(spec) {
  if (!spec.parameters?.length) return null;

  const properties = {};
  const required = [];
  for (const param of spec.parameters) {
    const prop = { title: param.title, type: param.type };
    if (param.help) prop.description = param.help;
    if (param.enum) prop.enum = param.enum;
    if (param.default !== undefined) prop.default = param.default;
    properties[param.id] = prop;
    // Sem default e sem valor vazio explícito, o campo é obrigatório.
    if (param.default === undefined) required.push(param.id);
  }

  const page = { title: spec.title, properties };
  if (required.length) page.required = required;
  return page;
}

/**
 * O .tf gerado. O backend, a convenção de nome e as tags são iguais em todos
 * os recursos — é o que faz o `terraform state list` de qualquer squad ser
 * legível por quem não escreveu.
 */
function mainTf(spec) {
  const inputs = Object.entries(spec.inputs ?? {})
    .map(([key, value]) => `  ${key.padEnd(38)} = ${value}`)
    .join('\n');

  return `# Gerado pelo template "${spec.title}" do Atlas.
# Ajuste à vontade: a partir do merge, este arquivo é do time dono.

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "nuclea-terraform-state"
    key    = "\${{ values.squad | replace("group:default/", "") }}/\${{ values.nome }}/\${{ values.ambiente }}.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.regiao
}

locals {
  name = "\${var.squad}-\${var.nome}-\${var.ambiente}"

  tags = {
    squad      = var.squad
    ambiente   = var.ambiente
    recurso    = "${spec.slug}"
    origem     = "atlas"
    repositorio = "\${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "${spec.module.source}"
  version = "${spec.module.version}"

${inputs}

  tags = local.tags
}
${spec.extraHcl ? `\n${spec.extraHcl}` : ''}`;
}

function variablesTf() {
  return `variable "squad" {
  description = "Squad dona do recurso"
  type        = string
  default     = "\${{ values.squad | replace("group:default/", "") }}"
}

variable "nome" {
  description = "Nome do recurso"
  type        = string
  default     = "\${{ values.nome }}"
}

variable "ambiente" {
  description = "dev, hml ou prd"
  type        = string
  default     = "\${{ values.ambiente }}"
}

variable "regiao" {
  description = "Região da AWS"
  type        = string
  default     = "us-east-1"
}
`;
}

function outputsTf() {
  return `output "id" {
  description = "Identificador do recurso na AWS"
  value       = try(module.this.id, null)
}

output "arn" {
  description = "ARN do recurso"
  value       = try(module.this.arn, null)
}
`;
}

function catalogInfo(spec) {
  return `apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: \${{ values.squad | replace("group:default/", "") }}-\${{ values.nome }}-\${{ values.ambiente }}
  description: ${spec.title} provisionado pelo Atlas
  annotations:
    atlas.nuclea.com.br/recurso: ${spec.slug}
    atlas.nuclea.com.br/ambiente: \${{ values.ambiente }}
  tags:
    - aws
    - ${spec.slug}
    - \${{ values.ambiente }}
spec:
  type: ${spec.slug}
  owner: \${{ values.squad }}
  system: infraestrutura
`;
}

function readme(spec) {
  return `# \${{ values.nome }} (\${{ values.ambiente }})

${spec.title} — ${spec.description}

Gerado pelo template \`atlas-template-${spec.slug}\`.

## O que aplicar

\`\`\`bash
terraform init
terraform plan
terraform apply
\`\`\`

O \`apply\` **não** é feito pelo portal. Este PR só traz o código; quem aplica
é o pipeline do repositório de infraestrutura, depois do merge.

## Convenções que vieram do template

- nome do recurso: \`squad-nome-ambiente\`
- state no bucket \`nuclea-terraform-state\`, sob \`squad/nome/ambiente.tfstate\`
- tags \`squad\`, \`ambiente\`, \`recurso\`, \`origem\` e \`repositorio\` em tudo

Mudar isso aqui desalinha este recurso do resto da casa. Se a convenção
precisa mudar, mude no template.
`;
}

function templateYaml(spec) {
  const parameters = [commonParameters()];
  const specific = specParameters(spec);
  if (specific) parameters.push(specific);
  parameters.push(destinationParameters());

  return {
    apiVersion: 'scaffolder.backstage.io/v1beta3',
    kind: 'Template',
    metadata: {
      name: `atlas-template-${spec.slug}`,
      title: spec.title,
      description: spec.description,
      tags: ['aws', 'terraform', spec.slug],
      annotations: {
        'atlas.nuclea.com.br/categoria': spec.category,
      },
    },
    spec: {
      owner: 'group:default/plataforma',
      type: 'resource',
      parameters,
      steps: [
        {
          // O `if:` de um passo não enxerga o app-config, só parâmetros e
          // saídas. Este passo traz o modo para dentro do alcance dele.
          id: 'mode',
          name: 'Ler o modo de provisionamento',
          action: 'atlas:mode',
        },
        {
          id: 'fetch',
          name: 'Gerar o Terraform',
          action: 'fetch:template',
          input: {
            url: './skeleton',
            // `values` só existe dentro do skeleton, durante a renderização
            // dos arquivos. No input de um passo, o contexto é `parameters`.
            targetPath:
              '${{ parameters.squad | replace("group:default/", "") }}/${{ parameters.nome }}/${{ parameters.ambiente }}',
            values: {
              nome: '${{ parameters.nome }}',
              squad: '${{ parameters.squad }}',
              ambiente: '${{ parameters.ambiente }}',
              repoUrl: '${{ parameters.repoUrl }}',
              ...Object.fromEntries(
                (spec.parameters ?? []).map(p => [
                  p.id,
                  `\${{ parameters.${p.id} }}`,
                ]),
              ),
            },
          },
        },
        {
          id: 'local',
          name: 'Escrever os arquivos localmente',
          if: '${{ steps.mode.output.isLocal }}',
          action: 'atlas:publish:local',
          input: {
            name: `\${{ parameters.nome }}-\${{ parameters.ambiente }}`,
          },
        },
        {
          id: 'pr',
          name: 'Abrir PR na infraestrutura',
          if: '${{ steps.mode.output.isGithub }}',
          action: 'publish:github:pull-request',
          input: {
            repoUrl: '${{ parameters.repoUrl }}',
            branchName:
              'atlas/${{ parameters.nome }}-${{ parameters.ambiente }}',
            title: `feat(${spec.slug}): \${{ parameters.nome }} em \${{ parameters.ambiente }}`,
            description: [
              `${spec.title} pedido pelo portal.`,
              '',
              `- módulo: \`${spec.module.source}\` v${spec.module.version}`,
              '- squad: `${{ parameters.squad }}`',
              '- ambiente: `${{ parameters.ambiente }}`',
              '',
              'O portal **não aplica** nada. Depois do merge, o pipeline deste',
              'repositório roda o `terraform apply`.',
            ].join('\n'),
          },
        },
      ],
      output: {
        links: [
          {
            title: 'Ver o Pull Request',
            url: '${{ steps.pr.output.remoteUrl }}',
            // Em modo local o passo `pr` não roda e a URL fica vazia; o
            // Backstage esconde links sem URL, então só sobra o relevante.
          },
          {
            title: 'Arquivos gerados',
            url: '${{ steps.local.output.remoteUrl }}',
          },
        ],
        text: [
          {
            title: 'Modo',
            content: '${{ steps.mode.output.mode }}',
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------- geração ---

const specs = readdirSync(SPECS_DIR)
  .filter(f => f.endsWith('.yaml'))
  .map(f => parseYaml(readFileSync(join(SPECS_DIR, f), 'utf8')))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const files = new Map();
for (const spec of specs) {
  const base = `${spec.slug}`;
  files.set(
    `${base}/template.yaml`,
    `# GERADO POR scripts/generate-aws-templates.mjs — NÃO EDITE À MÃO.\n` +
      `# Fonte: templates/aws/specs/${spec.slug}.yaml\n` +
      toYaml(templateYaml(spec), { lineWidth: 0 }),
  );
  files.set(`${base}/skeleton/main.tf`, mainTf(spec));
  files.set(`${base}/skeleton/variables.tf`, variablesTf());
  files.set(`${base}/skeleton/outputs.tf`, outputsTf());
  files.set(`${base}/skeleton/catalog-info.yaml`, catalogInfo(spec));
  files.set(`${base}/skeleton/README.md`, readme(spec));
}

/**
 * Uma Location única apontando para todos os templates, gerados ou não.
 * Registrar template por template no app-config.yaml daria 15 linhas que
 * ninguém lembra de atualizar ao adicionar o 16º.
 */
function locationsYaml() {
  const targets = [];

  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'skeleton' || entry.name === 'specs') continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), rel);
      } else if (entry.name === 'template.yaml') {
        targets.push(`./${rel}`);
      }
    }
  };
  walk(join(ROOT, 'templates'), '');

  targets.sort();
  return (
    `# GERADO POR scripts/generate-aws-templates.mjs — NÃO EDITE À MÃO.\n` +
    toYaml(
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Location',
        metadata: {
          name: 'atlas-templates',
          description: `Todos os software templates do Atlas (${targets.length})`,
        },
        spec: { type: 'file', targets },
      },
      { lineWidth: 0 },
    )
  );
}

if (CHECK) {
  const diffs = [];
  for (const [path, content] of files) {
    const full = join(OUT_DIR, path);
    if (!existsSync(full) || readFileSync(full, 'utf8') !== content) {
      diffs.push(path);
    }
  }
  const locations = locationsYaml();
  const locationsPath = join(ROOT, 'templates/locations.yaml');
  if (!existsSync(locationsPath) || readFileSync(locationsPath, 'utf8') !== locations) {
    diffs.push('locations.yaml');
  }

  if (diffs.length) {
    console.error(
      `\n  Templates gerados estão desatualizados:\n${diffs
        .map(d => `    ${d}`)
        .join('\n')}\n\n  Rode: yarn templates:sync\n`,
    );
    process.exit(1);
  }
  console.log(`  ✓ ${specs.length} template(s) AWS em dia`);
} else {
  rmSync(OUT_DIR, { recursive: true, force: true });
  for (const [path, content] of files) {
    const full = join(OUT_DIR, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content, 'utf8');
  }
  // A Location é escrita depois dos templates, para enxergar os novos.
  writeFileSync(join(ROOT, 'templates/locations.yaml'), locationsYaml(), 'utf8');

  console.log(
    `  ✓ ${specs.length} template(s) AWS gerado(s): ${specs
      .map(s => s.slug)
      .join(', ')}`,
  );
}
