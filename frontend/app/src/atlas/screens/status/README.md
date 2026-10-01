# Status da Plataforma — `/status`

Saúde dos serviços do portal Atlas: o que está no ar, disponibilidade dos
últimos 30 dias e incidentes recentes. Veio da tela `status-plataforma` do
[atlas-design-system](https://github.com/gomesfe/atlas-design-system) (branch `telas`).

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`. O que este README descreve como vindo de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

1. **Cabeçalho:** "Operação" · Status da Plataforma, com o time responsável.
2. **Aviso do incidente em andamento**, se houver (ex.: TechDocs degradado).
3. **Três números:** serviços operacionais (6/7), disponibilidade em 30 dias
   e incidentes no mês.
4. **Serviços** — um por linha (Catálogo, Scaffolder, TechDocs, Busca, Login
   GitHub, API Keys, Banco de dados), com ponto de cor, para que serve,
   disponibilidade em 30 dias e situação (operacional, degradado, fora do ar).
5. **Incidentes recentes** — título, o que aconteceu, início e fim.

## Fontes de dados

Hoje, exemplo no HTML. Com dado real: os health checks do backend
(`/.backstage/health/v1/readiness` e a prontidão de cada plugin) para a
situação, e o histórico de incidentes do time de plataforma.
