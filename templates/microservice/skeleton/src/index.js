const http = require('node:http');

const PORT = process.env.PORT ?? ${{ values.porta }};

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    // Responder 200 aqui é uma promessa: o serviço consegue atender.
    // Ao adicionar banco ou fila, cheque-os antes de responder.
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`${{ values.nome }} ouvindo em :${PORT}`);
});

module.exports = server;
