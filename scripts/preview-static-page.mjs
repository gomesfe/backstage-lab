#!/usr/bin/env node
/**
 * Serve uma tela estática sozinha, com live reload, sem subir o Backstage.
 *
 *   yarn pages:preview minha-tela
 *
 * O preview embrulha o fragmento num documento mínimo com as mesmas variáveis
 * de tema (--bs-*) que o portal injeta, e com o mesmo isolamento de Shadow DOM.
 * O que você vê aqui é o que aparece dentro do Backstage.
 */
import { createServer } from 'node:http';
import { readFileSync, statSync, watch } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
const PORT = Number(process.env.PREVIEW_PORT ?? 4100);

if (!slug) {
  console.error('\n  uso: yarn pages:preview <slug>\n');
  process.exit(1);
}

const DIR = join(ROOT, 'static-pages', slug);
try {
  statSync(DIR).isDirectory();
} catch {
  console.error(
    `\n  static-pages/${slug} não existe. Crie com: yarn pages:new ${slug}\n`,
  );
  process.exit(1);
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const read = name => {
  try {
    return readFileSync(join(DIR, name), 'utf8');
  } catch {
    return '';
  }
};

// Mesmos tokens que o StaticPageFrame injeta no portal.
const THEME = `
  :root, :host {
    --bs-bg: #f8f8f8;
    --bs-surface: #ffffff;
    --bs-text: #151515;
    --bs-text-secondary: #616161;
    --bs-border: #e0e0e0;
    --bs-primary: #1f5493;
  }
  @media (prefers-color-scheme: dark) {
    :root, :host {
      --bs-bg: #121212;
      --bs-surface: #1c1c1c;
      --bs-text: #ffffff;
      --bs-text-secondary: #b5b5b5;
      --bs-border: #3d3d3d;
      --bs-primary: #9cc9ff;
    }
  }
`;

function documentFor() {
  const meta = (() => {
    try {
      return JSON.parse(read('meta.json'));
    } catch {
      return { title: slug };
    }
  })();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title ?? slug} — preview</title>
<style>
${THEME}
html, body { margin: 0; background: var(--bs-bg); }
.preview-bar {
  font: 12px system-ui, sans-serif; color: var(--bs-text-secondary);
  background: var(--bs-surface); border-bottom: 1px solid var(--bs-border);
  padding: 8px 24px; display: flex; gap: 12px; align-items: center;
}
.preview-bar b { color: var(--bs-text); font-weight: 600; }
.preview-body { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
</style>
</head>
<body>
<div class="preview-bar">
  <b>${meta.title ?? slug}</b>
  <span>static-pages/${slug}</span>
  <span>preview isolado — salve um arquivo para recarregar</span>
</div>
<div class="preview-body"><div id="host"></div></div>
<script>
  const shadow = document.getElementById('host').attachShadow({ mode: 'open' });
  shadow.innerHTML =
    '<style>' + ${JSON.stringify(THEME)} + ${JSON.stringify(
    read('styles.css'),
  )} + '</style>' +
    ${JSON.stringify(read('index.html'))};
  new EventSource('/__reload').onmessage = () => location.reload();
</script>
</body>
</html>`;
}

const clients = new Set();

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    try {
      const file = join(DIR, url.pathname.slice(1));
      const body = readFileSync(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      });
      return res.end(body);
    } catch {
      res.writeHead(404);
      return res.end('asset não encontrado');
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(documentFor());
}).listen(PORT, () => {
  console.log(
    `\n  preview de "${slug}" em http://localhost:${PORT}\n  ctrl+c para parar\n`,
  );
});

let timer = null;
watch(DIR, { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    for (const c of clients) c.write('data: reload\n\n');
  }, 80);
});
