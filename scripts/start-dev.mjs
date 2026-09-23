#!/usr/bin/env node
/**
 * Sobe o backend e, só depois que ele está atendendo, o frontend.
 *
 * Por que não os dois de uma vez: o `backstage-cli package start` do backend
 * roda o servidor num processo filho e guarda o dev data store no pai. Na
 * inicialização, cada plugin carrega esse store por IPC, com timeout fixo.
 * Quando o webpack do front está compilando em paralelo e ocupa todos os
 * núcleos, o pai do backend não é escalonado a tempo e a chamada estoura.
 *
 * O sintoma engana: metade dos plugins do backend morre com
 * `IPC request 'DevDataStore.load' timed out`, o front continua servindo
 * normalmente, e o portal aparece vazio — parece problema de catálogo.
 *
 * Esperar o backend atender antes de começar a compilar o front tira a
 * disputa da janela em que ela importa.
 */
import { spawn } from 'node:child_process';

const BACKEND_PORT = Number(process.env.BACKEND_PORT ?? 7007);
const READY_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_MS = 500;

const children = [];

function run(name, args) {
  const child = spawn('yarn', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  const prefix = (line) => `[${name}] ${line}`;
  const pipe = (stream, out) => {
    let buffer = '';
    stream.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) out.write(`${prefix(line)}\n`);
    });
  };

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`[dev] ${name} saiu com código ${code}; derrubando o resto.`);
      shutdown(code);
    }
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

/**
 * Prontidão, não porta aberta.
 *
 * O Backstage começa a escutar antes de inicializar os plugins. Esperar só o
 * socket abrir devolve o controle cedo demais: o front começa a compilar no
 * meio da inicialização do backend e recria exatamente a disputa que esta
 * ordem existe para evitar.
 */
async function backendIsReady() {
  try {
    const response = await fetch(
      `http://127.0.0.1:${BACKEND_PORT}/.backstage/health/v1/readiness`,
      { signal: AbortSignal.timeout(2000) },
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForBackend() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await backendIsReady()) return true;
    await new Promise(r => setTimeout(r, POLL_MS));
  }
  return false;
}

console.log('[dev] subindo o backend…');
run('back', ['start:backend']);

if (!(await waitForBackend())) {
  console.error(
    `[dev] backend não ficou pronto em :${BACKEND_PORT} dentro do limite. Veja o log acima.`,
  );
  shutdown(1);
}

console.log(`[dev] backend pronto em :${BACKEND_PORT}; subindo o front…`);
run('front', ['start:app']);
