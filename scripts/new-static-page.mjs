#!/usr/bin/env node
/**
 * Cria uma tela estática a partir do esqueleto em static-pages/_template.
 *
 *   yarn pages:new minha-tela "Minha Tela"
 *
 * É o equivalente local do "template estático" do portal de dev: gera os
 * arquivos já no formato que o sync aceita.
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'static-pages');
const TEMPLATE_DIR = join(PAGES_DIR, '_template');

const [slug, ...titleParts] = process.argv.slice(2);

if (!slug) {
  console.error('\n  uso: yarn pages:new <slug> ["Título da tela"]\n');
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    `\n  slug "${slug}" inválido — use kebab-case (a-z, 0-9, hífen)\n`,
  );
  process.exit(1);
}

const target = join(PAGES_DIR, slug);
try {
  if (statSync(target).isDirectory()) {
    console.error(`\n  static-pages/${slug} já existe\n`);
    process.exit(1);
  }
} catch {
  // não existe: seguimos
}

const title =
  titleParts.join(' ') ||
  slug
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');

const TEXT_FILES = new Set(['meta.json', 'index.html', 'styles.css']);

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = join(from, entry);
    const dst = join(to, entry);
    if (statSync(src).isDirectory()) {
      copyDir(src, dst);
    } else if (TEXT_FILES.has(entry)) {
      const text = readFileSync(src, 'utf8')
        .split('__SLUG__')
        .join(slug)
        .split('__TITLE__')
        .join(title);
      writeFileSync(dst, text, 'utf8');
    } else {
      writeFileSync(dst, readFileSync(src));
    }
  }
}

copyDir(TEMPLATE_DIR, target);

console.log(`
  ✓ tela criada em static-pages/${slug}

    edite   static-pages/${slug}/index.html
            static-pages/${slug}/styles.css

    veja    yarn pages:preview ${slug}     (só a tela, sem subir o portal)
            yarn start                     (a tela dentro do Backstage)
`);
