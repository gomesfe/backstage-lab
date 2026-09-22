#!/usr/bin/env node
/**
 * Liga/desliga o fallback SQLite.
 *
 * O Backstage carrega app-config.local.yaml automaticamente por cima do
 * app-config.yaml, e esse arquivo é gitignored. Então "usar SQLite" é
 * simplesmente colocar o override lá.
 *
 *   node scripts/use-sqlite.mjs        liga  (yarn start:sqlite faz isso)
 *   node scripts/use-sqlite.mjs --off  desliga, volta para o Postgres
 */
import { copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'app-config.sqlite.yaml');
const DST = join(ROOT, 'app-config.local.yaml');

if (process.argv.includes('--off')) {
  rmSync(DST, { force: true });
  console.log('  ✓ voltando para o Postgres (lembre do `yarn db:up`)');
} else {
  if (existsSync(DST)) {
    console.error(
      `\n  app-config.local.yaml já existe e seria sobrescrito.\n` +
        `  Apague ou mescle à mão antes de rodar isso.\n`,
    );
    process.exit(1);
  }
  copyFileSync(SRC, DST);
  console.log('  ✓ usando SQLite em memória (sem Docker)');
}
