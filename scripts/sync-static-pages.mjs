#!/usr/bin/env node
/**
 * Valida as telas em static-pages/ e gera o bundle que o front consome.
 *
 * Entrada:  static-pages/<slug>/{meta.json,index.html,styles.css,assets/*}
 * Saída:    packages/app/src/modules/static-pages/generated.ts
 *
 * As regras estão documentadas em static-pages/README.md. Este arquivo é a
 * implementação delas — se mudar uma, mude os dois.
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  rmSync,
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'static-pages');
const OUT_FILE = join(
  ROOT,
  'packages/app/src/modules/static-pages/generated.ts',
);
// Assets são copiados para cá e servidos pelo dev server / build do app.
const PUBLIC_DIR = join(ROOT, 'packages/app/public/static-pages');

const ALLOWED_ICONS = ['dashboard', 'docs', 'extension', 'group', 'library'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const fail = (slug, file, line, msg) =>
  errors.push({ slug, where: line ? `${file}:${line}` : file, msg });

/** Nº da linha (1-based) onde o regex casa, ou null. */
function lineOf(text, re) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i + 1;
  }
  return null;
}

function listPageDirs() {
  if (!existsDir(PAGES_DIR)) return [];
  return readdirSync(PAGES_DIR)
    .filter(name => !name.startsWith('_') && !name.startsWith('.'))
    .filter(name => existsDir(join(PAGES_DIR, name)));
}

function existsDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function existsFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function validateMeta(slug, metaPath) {
  if (!existsFile(metaPath)) {
    fail(slug, 'meta.json', null, 'arquivo obrigatório não encontrado');
    return null;
  }

  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch (e) {
    fail(slug, 'meta.json', null, `JSON inválido: ${e.message}`);
    return null;
  }

  if (meta.slug !== slug) {
    fail(
      slug,
      'meta.json',
      null,
      `slug "${meta.slug}" não bate com a pasta "${slug}"`,
    );
  }
  if (!SLUG_RE.test(slug)) {
    fail(
      slug,
      'meta.json',
      null,
      `slug "${slug}" precisa ser kebab-case (a-z, 0-9, hífen)`,
    );
  }
  if (!meta.title || typeof meta.title !== 'string') {
    fail(slug, 'meta.json', null, 'campo "title" é obrigatório');
  }
  if (!meta.path || typeof meta.path !== 'string') {
    fail(slug, 'meta.json', null, 'campo "path" é obrigatório');
  } else if (!meta.path.startsWith('/p/')) {
    fail(
      slug,
      'meta.json',
      null,
      `path "${meta.path}" precisa começar com "/p/"`,
    );
  }
  if (meta.icon && !ALLOWED_ICONS.includes(meta.icon)) {
    fail(
      slug,
      'meta.json',
      null,
      `icon "${meta.icon}" inválido. Use: ${ALLOWED_ICONS.join(', ')}`,
    );
  }

  return meta;
}

function validateHtml(slug, htmlPath) {
  if (!existsFile(htmlPath)) {
    fail(slug, 'index.html', null, 'arquivo obrigatório não encontrado');
    return null;
  }
  const html = readFileSync(htmlPath, 'utf8');

  const banned = [
    [
      /<!DOCTYPE/i,
      'não use <!DOCTYPE> — o fragmento entra dentro de uma página já existente',
    ],
    [/<html[\s>]/i, 'não use <html> — o Backstage já fornece o documento'],
    [/<head[\s>]/i, 'não use <head> — CSS vai em styles.css'],
    [/<body[\s>]/i, 'não use <body> — o fragmento é o conteúdo da página'],
    [
      /<script[\s>]/i,
      'não use <script> — tela estática não roda JS. Se precisa, vire um plugin',
    ],
    [
      /<link[^>]+rel=["']?stylesheet/i,
      'não use <link rel="stylesheet"> — CSS vai em styles.css',
    ],
    [/\son[a-z]+\s*=/i, 'não use handlers inline (onclick, onload, ...)'],
  ];

  for (const [re, msg] of banned) {
    const line = lineOf(html, re);
    if (line) fail(slug, 'index.html', line, msg);
  }

  return html;
}

function collectAssets(slug, dir) {
  const assetsDir = join(dir, 'assets');
  if (!existsDir(assetsDir)) return [];
  const out = [];
  const walk = d => {
    for (const entry of readdirSync(d)) {
      if (entry.startsWith('.')) continue;
      const full = join(d, entry);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(assetsDir, full).split('\\').join('/'));
    }
  };
  walk(assetsDir);
  return out;
}

const pages = [];
for (const slug of listPageDirs()) {
  const dir = join(PAGES_DIR, slug);
  const meta = validateMeta(slug, join(dir, 'meta.json'));
  const html = validateHtml(slug, join(dir, 'index.html'));
  const cssPath = join(dir, 'styles.css');
  const css = existsFile(cssPath) ? readFileSync(cssPath, 'utf8') : '';

  if (!meta || html === null) continue;

  const assets = collectAssets(slug, dir);
  // `assets/x.png` no fonte vira uma URL servida pelo app, para funcionar em
  // qualquer rota sem depender de caminho relativo.
  const publicBase = `/static-pages/${slug}/`;
  const rewrite = text =>
    text
      .replace(/(src|href)=(["'])assets\//gi, `$1=$2${publicBase}`)
      .replace(/url\((["']?)assets\//gi, `url($1${publicBase}`);

  pages.push({
    slug,
    title: meta.title,
    path: meta.path,
    icon: meta.icon ?? 'dashboard',
    nav: meta.nav !== false,
    owner: meta.owner ?? null,
    description: meta.description ?? null,
    html: rewrite(html),
    css: rewrite(css),
    assets,
  });
}

// paths duplicados
const seen = new Map();
for (const p of pages) {
  if (seen.has(p.path)) {
    fail(
      p.slug,
      'meta.json',
      null,
      `path "${p.path}" já usado por "${seen.get(p.path)}"`,
    );
  } else {
    seen.set(p.path, p.slug);
  }
}

if (errors.length > 0) {
  console.error('\n  Telas estáticas reprovadas nas regras:\n');
  for (const e of errors) {
    console.error(`  ✗ ${e.slug}/${e.where}`);
    console.error(`      ${e.msg}`);
  }
  console.error('\n  Regras completas: static-pages/README.md\n');
  process.exit(1);
}

pages.sort((a, b) => a.title.localeCompare(b.title));

const banner = `// GERADO POR scripts/sync-static-pages.mjs — NÃO EDITE À MÃO.
// Fonte: static-pages/<slug>/. Rode \`yarn pages:sync\` para regenerar.
/* eslint-disable */

export type StaticPage = {
  slug: string;
  title: string;
  path: string;
  icon: string;
  nav: boolean;
  owner: string | null;
  description: string | null;
  html: string;
  css: string;
  assets: string[];
};

export const staticPages: StaticPage[] = ${JSON.stringify(pages, null, 2)};
`;

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, banner, 'utf8');

// Republica os assets do zero, para que apagar um arquivo na origem o remova aqui.
rmSync(PUBLIC_DIR, { recursive: true, force: true });
for (const p of pages) {
  if (p.assets.length === 0) continue;
  const from = join(PAGES_DIR, p.slug, 'assets');
  const to = join(PUBLIC_DIR, p.slug);
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

console.log(
  `  ✓ ${pages.length} tela(s) estática(s) sincronizada(s)` +
    (pages.length
      ? `: ${pages.map(p => p.slug).join(', ')}`
      : ' (nenhuma ainda)'),
);
