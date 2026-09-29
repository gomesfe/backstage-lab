#!/usr/bin/env node
/**
 * Gera a versão "portal" das telas HTML do Atlas.
 *
 * Fonte:  frontend/app/src/atlas/screens/<tela>/index.html  (documento
 *         completo, abre sozinho no navegador com ../../assets/atlas.js)
 * Saída:  frontend/app/src/atlas/screens/html.generated.ts
 *
 * De cada tela sai só o conteúdo do <main data-atlas-screen>, com os links
 * entre telas (`../catalog/index.html`) trocados pelas rotas do portal
 * (`/catalog`, lidas do page.tsx de cada pasta). O fragmento segue o mesmo
 * contrato das telas estáticas (frontend/static-pages/README.md): sem
 * <script>, sem handlers inline, sem <link>. A interação (busca, filtro,
 * abas, diálogos) vem de atributos data-atlas-*, que o portal liga sozinho.
 * Link que só existe no portal leva `data-portal-href` (vira o href lá).
 *
 *   node scripts/sync-atlas-html.mjs           gera
 *   node scripts/sync-atlas-html.mjs --check   falha se o gerado estiver velho
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCREENS = join(ROOT, 'frontend/app/src/atlas/screens');
const OUT = join(SCREENS, 'html.generated.ts');
const check = process.argv.includes('--check');

const errors = [];
const fail = (slug, msg) => errors.push(`  ✗ ${slug}: ${msg}`);

const slugs = readdirSync(SCREENS, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('_'))
  .map(d => d.name)
  .filter(slug => existsSync(join(SCREENS, slug, 'index.html')))
  .sort();

// Rota de cada tela, do `path:` do page.tsx dela.
const routes = {};
for (const slug of slugs) {
  const page = join(SCREENS, slug, 'page.tsx');
  const match = existsSync(page) && readFileSync(page, 'utf8').match(/path:\s*'([^']+)'/);
  if (!match) fail(slug, 'page.tsx sem `path:` — não sei a rota da tela');
  else routes[slug] = match[1];
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const screens = {};
for (const slug of slugs) {
  const source = readFileSync(join(SCREENS, slug, 'index.html'), 'utf8');

  const title = (source.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/\s*·\s*Atlas\s*$/, '') ?? slug;
  const open = source.match(/<main\b[^>]*\bdata-atlas-screen\b[^>]*>/);
  const close = source.lastIndexOf('</main>');
  if (!open || close < 0) {
    fail(slug, 'index.html precisa de um <main data-atlas-screen>…</main>');
    continue;
  }
  const start = open.index + open[0].length;
  let html = source.slice(start, close).trim();

  const banned = [
    [/<script[\s>]/i, 'sem <script> dentro do <main> — use atributos data-atlas-*'],
    [/\son[a-z]+\s*=/i, 'sem handlers inline (onclick, onload, …)'],
    [/<link[\s>]/i, 'sem <link> dentro do <main>'],
    [/(src|href)=["']\.\.\/\.\.\/assets\//i, 'o portal não serve ../../assets — use SVG inline'],
  ];
  for (const [re, msg] of banned) {
    const m = re.exec(html);
    if (m) fail(slug, `index.html:${lineOf(source, start) + lineOf(html, m.index) - 1} ${msg}`);
  }

  // ../<tela>/index.html[?filtros][#aba] → rota do portal, com o mesmo resto
  html = html.replace(/href="\.\.\/([a-z0-9-]+)\/index\.html([?#][^"]*)?"/g, (all, target, hash = '') => {
    if (!(target in routes)) {
      fail(slug, `link para tela inexistente: ${target}`);
      return all;
    }
    return `href="${routes[target]}${hash}"`;
  });

  // Link que só existe no portal (ex.: o formulário de uma oferta):
  // <a href="../create/index.html" data-portal-href="/create/templates/…">.
  // Na versão avulsa vale o href; no portal, o data-portal-href.
  html = html.replace(/<a\b[^>]*\bdata-portal-href="([^"]+)"[^>]*>/g, (tag, portalHref) =>
    tag.replace(/\shref="[^"]*"/, ` href="${portalHref}"`).replace(/\sdata-portal-href="[^"]+"/, ''),
  );

  const cssPath = join(SCREENS, slug, 'styles.css');
  const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
  screens[slug] = { title, html, css };
}

if (errors.length) {
  console.error(`\n  Telas HTML reprovadas:\n\n${errors.join('\n')}\n`);
  process.exit(1);
}

const output = `// GERADO por scripts/sync-atlas-html.mjs — não edite à mão.
// Fonte: screens/<tela>/index.html. Rode \`yarn screens:sync\` para regenerar.
/* eslint-disable */

export type AtlasHtmlScreen = { title: string; html: string; css: string };

export const ATLAS_HTML: Record<string, AtlasHtmlScreen> = ${JSON.stringify(screens, null, 2)};
`;

if (check) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== output) {
    console.error('\n  html.generated.ts desatualizado. Rode `yarn screens:sync`.\n');
    process.exit(1);
  }
  console.log(`  ✓ ${slugs.length} tela(s) HTML em dia`);
} else {
  writeFileSync(OUT, output, 'utf8');
  console.log(`  ✓ ${slugs.length} tela(s) HTML geradas: ${slugs.join(', ')}`);
}
