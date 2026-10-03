import type { Skill } from './types';

/**
 * Skills de exemplo — as mesmas da tela HTML que esta substitui. Com dado
 * real, vêm das pastas `skills/<nome>/SKILL.md` das branches dev, hml e
 * release de NucleaSA/nuclea-ia-skills (ver `useSkills`).
 */
export const SKILLS: Skill[] = [
  {
    slug: 'skill-presenter',
    nome: 'Skill Presenter',
    descricao:
      'Preencher o conteúdo de sua skill aqui. Também é possível adicionar outros arquivos nessa pasta e os referenciar aqui, como imagens, arquivos de exemplo e scripts.',
    ambientes: ['dev'],
    autor: 'atlas-nucleasatest[bot]',
    atualizadoEm: '27/08/2026, 15:49',
  },
  {
    slug: 'anti-ui-slop',
    nome: 'Anti Ui Slop',
    descricao:
      'Build product-specific UI with 800,000+ real web and iOS screens via UIZZE. Stop Making UI Slop with UIZZE. Overview: use the product brief, existing UI and references to design screens that fit the product.',
    ambientes: ['dev'],
    autor: 'Peterson V',
    atualizadoEm: '24/08/2026, 12:40',
  },
  {
    slug: 'git-commit',
    nome: 'Git Commit',
    descricao:
      'Create standardized, semantic git commits using the Conventional Commits specification. Analyze the actual diff to determine appropriate type, scope and message.',
    ambientes: ['dev'],
    autor: 'Peterson V',
    atualizadoEm: '24/08/2026, 12:40',
  },
  {
    slug: 'typescript-mcp-server-generator',
    nome: 'Typescript Mcp Server Generator',
    descricao:
      'Create a complete Model Context Protocol (MCP) server in TypeScript using the MCP TypeScript SDK v2 with the following specifications: requirements, tools, resources and tests.',
    ambientes: ['hml', 'dev'],
    autor: 'Peterson V',
    atualizadoEm: '24/08/2026, 12:32',
  },
  {
    slug: 'aws-cost-optimize',
    nome: 'Aws Cost Optimize',
    descricao:
      'This workflow analyzes Infrastructure-as-Code (IaC) files and AWS resources to generate cost optimization recommendations. It creates individual GitHub issues for each recommendation.',
    ambientes: ['release', 'hml', 'dev'],
    autor: 'Peterson V',
    atualizadoEm: '24/08/2026, 12:28',
  },
  {
    slug: 'aws-well-architected-review',
    nome: 'Aws Well Architected Review',
    descricao:
      "This workflow performs a structured AWS Well-Architected Framework (WAF) review against your workload's IaC files and deployed infrastructure. It reports findings by pillar.",
    ambientes: ['release', 'hml', 'dev'],
    autor: 'Peterson V',
    atualizadoEm: '24/08/2026, 12:28',
  },
];
