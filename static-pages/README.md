# Telas estáticas — o contrato

Este diretório é o ponto de entrada para telas feitas **fora** do repo de front.

A ideia: você gera um site estático (pelo template estático do portal, ou à mão),
solta a pasta aqui dentro, roda `yarn pages:sync` e a tela vira uma rota do
Backstage — com sidebar, header e tema do portal em volta.

Você nunca precisa mexer em React para adicionar ou editar uma tela.

## Estrutura de uma tela

```
static-pages/
  minha-tela/
    meta.json      (obrigatório)
    index.html     (obrigatório)
    styles.css     (opcional)
    assets/        (opcional — imagens, fontes)
```

O nome da pasta é o `slug` e precisa bater com o `slug` do `meta.json`.

## meta.json

```json
{
  "slug": "minha-tela",
  "title": "Minha Tela",
  "path": "/p/minha-tela",
  "icon": "dashboard",
  "nav": true,
  "owner": "team-plataforma",
  "description": "O que essa tela mostra"
}
```

| campo         | obrigatório | regra                                                      |
| ------------- | ----------- | ---------------------------------------------------------- |
| `slug`        | sim         | kebab-case, igual ao nome da pasta                          |
| `title`       | sim         | aparece no header e na sidebar                              |
| `path`        | sim         | precisa começar com `/p/`                                   |
| `icon`        | não         | um de: `dashboard`, `docs`, `extension`, `group`, `library` |
| `nav`         | não         | `true` põe na sidebar (padrão `true`)                       |
| `owner`       | não         | time dono, só documental                                    |
| `description` | não         | subtítulo do header                                         |

## As regras do index.html

O `index.html` é um **fragmento**, não um documento completo. O Backstage já
entrega o `<html>`, o `<head>` e o `<body>`.

1. **Sem** `<html>`, `<head>`, `<body>` ou `<!DOCTYPE>`.
2. **Sem** `<script>`. Tela estática é estática — se precisa de lógica, vira
   plugin de verdade.
3. **Sem** `<link rel="stylesheet">` para fora. CSS vai no `styles.css`.
4. Nada de `on*=` inline (`onclick`, `onload`, ...).
5. Referências a assets usam caminho relativo: `assets/foto.png`.

O `sync` reprova o build se qualquer uma dessas for quebrada, com a linha exata.

## O CSS é isolado

Cada tela é montada dentro de um **Shadow DOM**. Isso quer dir que:

- Seu CSS não vaza para o Backstage — pode usar `h1 { ... }`, `* { ... }`,
  `body`-like resets, à vontade.
- O CSS do Backstage não vaza para dentro da sua tela — o que você vê no
  preview estático é o que aparece no portal.

Use as variáveis abaixo se quiser acompanhar o tema (claro/escuro) do portal:

```css
.card {
  background: var(--bs-surface);
  color: var(--bs-text);
  border: 1px solid var(--bs-border);
}
```

Disponíveis: `--bs-surface`, `--bs-bg`, `--bs-text`, `--bs-text-secondary`,
`--bs-border`, `--bs-primary`.

## Fluxo do dia a dia

```bash
yarn pages:new minha-tela "Minha Tela"   # cria a pasta a partir do esqueleto
yarn pages:preview minha-tela            # abre só a tela no navegador, sem subir o Backstage
yarn pages:sync                          # valida as regras e regenera o bundle
yarn start                               # sobe o portal com a tela dentro
```

`yarn pages:sync` roda sozinho antes de `yarn start` e de `yarn build`.
