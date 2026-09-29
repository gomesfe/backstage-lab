# Buscar — `/search`

Busca global em catálogo e documentação, pelo índice de busca do Backstage.
O botão de lupa da barra de navegação leva para cá.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

1. **Cabeçalho:** "Busca global" · Buscar.
2. **Campo de busca** com foco automático; busca 300 ms depois de parar de
   digitar.
3. **Abas de tipo:** Tudo, Catálogo, Docs.
4. **Resultados:** contagem ("3 resultados para 'pagamentos'") e, para cada
   um, título, badge do tipo (catálogo/docs) e trecho de até 2 linhas; o
   item inteiro é um link.

## Estados

- Sem termo → convite a digitar.
- Carregando → esqueleto.
- Sem resultado → "Nenhum resultado para '…'".
- Erro → painel de erro.

## Entradas pela URL

`?q=` e `?type=software-catalog|techdocs`. O link da busca pode ser
compartilhado, e "voltar" do navegador volta para os resultados.
