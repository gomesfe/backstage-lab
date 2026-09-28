#!/usr/bin/env node
/**
 * Traz o CSS do Atlas Design System para o portal.
 *
 * A fonte de verdade do visual é o repositório `atlas-design-system`: o CSS
 * vive embutido no `index.html` dele, no bloco <style id="atlas-css">. Este
 * script extrai esse bloco e grava em `packages/app/src/modules/theme/atlas.css`.
 *
 * O arquivo gerado é versionado aqui de propósito: o build do portal não pode
 * depender de o outro repositório estar clonado ao lado.
 *
 *   yarn ds:sync                         # procura ../../atlas-design-system
 *   ATLAS_DS_PATH=/caminho/index.html yarn ds:sync
 *   yarn ds:sync --check                 # falha se o portal estiver desatualizado
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  root,
  process.env.ATLAS_DS_PATH ?? '../../atlas-design-system/index.html',
);
const target = resolve(root, 'packages/app/src/modules/theme/atlas.css');
const check = process.argv.includes('--check');

if (!existsSync(source)) {
  console.error(
    `Design system não encontrado em ${source}.\n` +
      'Clone gomesfe/atlas-design-system ao lado do portal, ou aponte ATLAS_DS_PATH para o index.html dele.',
  );
  process.exit(1);
}

const html = readFileSync(source, 'utf8');
const match = html.match(/<style id="atlas-css">\s*([\s\S]*?)\s*<\/style>/);
if (!match) {
  console.error(`Bloco <style id="atlas-css"> não encontrado em ${source}.`);
  process.exit(1);
}

const header = `/*
 * GERADO por scripts/sync-design-system.mjs — não edite à mão.
 * Fonte: atlas-design-system/index.html, bloco <style id="atlas-css">.
 * Para mudar o visual: edite o design system e rode \`yarn ds:sync\`.
 */

`;
const css = `${header}${match[1].replace(/\r\n/g, '\n')}\n`;

const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
if (check) {
  if (current !== css) {
    console.error('atlas.css está desatualizado em relação ao design system. Rode `yarn ds:sync`.');
    process.exit(1);
  }
  console.log('atlas.css em dia com o design system.');
  process.exit(0);
}

writeFileSync(target, css);
console.log(
  `${current === css ? 'Sem mudanças' : 'Atualizado'}: ${relative(root, target)} ← ${source}`,
);
