#!/usr/bin/env node
/**
 * Publica o portal na sua rede Tailscale.
 *
 * Diferente de `yarn start`, aqui não há dev server: o frontend é um bundle
 * já construído, servido pelo próprio backend. Uma origem, uma porta, e o
 * `tailscale serve` põe HTTPS na frente.
 *
 *   yarn build:hosted     (uma vez, e a cada mudança no código)
 *   yarn serve:tailscale
 *
 * O backend escuta só em 127.0.0.1. Quem fala com a rede é o Tailscale.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 7007;

const TAILSCALE =
  process.env.TAILSCALE_EXE ??
  join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Tailscale', 'tailscale.exe');

function tailscale(args, { quiet = false } = {}) {
  const result = spawnSync(TAILSCALE, args, { encoding: 'utf8' });
  if (result.error) {
    fail(
      `não consegui executar o tailscale em ${TAILSCALE}.\n` +
        `  Instale o cliente ou aponte TAILSCALE_EXE para o executável.`,
    );
  }
  if (result.status !== 0 && !quiet) {
    fail(`tailscale ${args.join(' ')} falhou:\n${result.stderr || result.stdout}`);
  }
  return result;
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

// ------------------------------------------------------------- checagens ---

const status = tailscale(['status', '--json'], { quiet: true });

let parsed;
try {
  parsed = JSON.parse(status.stdout);
} catch {
  fail(
    'não consegui ler o status do Tailscale.\n' +
      '  Rode:  & "$env:ProgramFiles\\Tailscale\\tailscale.exe" up',
  );
}

if (parsed.BackendState !== 'Running') {
  fail(
    `Tailscale está em "${parsed.BackendState}", não conectado.\n` +
      '  Faça login primeiro:\n' +
      '    & "$env:ProgramFiles\\Tailscale\\tailscale.exe" up',
  );
}

const dnsName = parsed.Self?.DNSName?.replace(/\.$/, '');
if (!dnsName) {
  fail(
    'o Tailscale está conectado mas esta máquina não tem nome DNS.\n' +
      '  Ative o MagicDNS no painel: https://login.tailscale.com/admin/dns',
  );
}

const publicUrl = `https://${dnsName}`;

const bundle = join(ROOT, 'packages/backend/dist');
if (!existsSync(bundle)) {
  fail('o backend não foi construído ainda.\n  Rode:  yarn build:hosted');
}

// --------------------------------------------------------------- publicar ---

console.log(`\n  portal: ${publicUrl}\n`);

// `serve` só sobrevive enquanto configurado; limpamos ao sair para não deixar
// a porta publicada depois que o processo morrer.
const cleanup = () => {
  spawnSync(TAILSCALE, ['serve', '--https=443', 'off'], { stdio: 'ignore' });
};
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

const serve = tailscale(
  ['serve', '--bg', '--https=443', `http://127.0.0.1:${PORT}`],
  { quiet: true },
);

if (serve.status !== 0) {
  const message = serve.stderr || serve.stdout;
  if (/HTTPS|cert/i.test(message)) {
    fail(
      'o Tailscale recusou publicar em HTTPS.\n' +
        '  Ative "HTTPS Certificates" no painel do tailnet:\n' +
        '    https://login.tailscale.com/admin/dns\n\n' +
        `  Mensagem original:\n  ${message.trim()}`,
    );
  }
  fail(`tailscale serve falhou:\n${message}`);
}

const backend = spawn(
  'yarn',
  [
    'workspace',
    'backend',
    'start',
    '--config',
    '../../app-config.yaml',
    '--config',
    '../../app-config.tailscale.yaml',
  ],
  {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ATLAS_PUBLIC_URL: publicUrl },
  },
);

backend.on('exit', code => {
  cleanup();
  process.exit(code ?? 0);
});
