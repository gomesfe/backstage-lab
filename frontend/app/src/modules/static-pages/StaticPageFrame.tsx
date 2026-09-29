import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Content, Header, Page } from '@backstage/core-components';
import type { StaticPage } from './generated';

/**
 * Injeta o HTML/CSS da tela dentro de um Shadow DOM.
 *
 * O Shadow DOM é o que torna o contrato viável: o CSS da tela não vaza para o
 * Backstage e o CSS do Backstage não entra na tela. Quem escreve a tela pode
 * usar `* { }`, `h1 { }` e resets sem quebrar o portal.
 */
function ShadowHost({
  page,
  themeCss,
}: {
  page: StaticPage;
  themeCss: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!shadowRef.current) {
      shadowRef.current = host.attachShadow({ mode: 'open' });
    }

    const style = document.createElement('style');
    style.textContent = `${themeCss}\n${page.css}`;

    const content = document.createElement('div');
    content.innerHTML = page.html;

    shadowRef.current.replaceChildren(style, content);
  }, [page.html, page.css, themeCss]);

  return <div ref={hostRef} data-static-page={page.slug} />;
}

export function StaticPageFrame({ page }: { page: StaticPage }) {
  const theme = useTheme();

  // Tokens que a tela estática pode consumir para acompanhar claro/escuro.
  // Mantenha em sincronia com o THEME de scripts/preview-static-page.mjs.
  const themeCss = useMemo(
    () => `
      :host {
        display: block;
        --bs-bg: ${theme.palette.background.default};
        --bs-surface: ${theme.palette.background.paper};
        --bs-text: ${theme.palette.text.primary};
        --bs-text-secondary: ${theme.palette.text.secondary};
        --bs-border: ${theme.palette.divider};
        --bs-primary: ${theme.palette.primary.main};
      }
    `,
    [theme],
  );

  return (
    <Page themeId="tool">
      <Header title={page.title} subtitle={page.description ?? undefined}>
        {page.owner ? <span>{page.owner}</span> : null}
      </Header>
      <Content>
        <ShadowHost page={page} themeCss={themeCss} />
      </Content>
    </Page>
  );
}
