import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content, Page } from '@backstage/core-components';
import { ATLAS_HTML } from '../../screens/html.generated';
import { enhance } from './enhance';

/**
 * Mostra no portal uma tela feita em HTML estático.
 *
 * O HTML vem de `screens/<tela>/index.html`, pelo `yarn screens:sync`, já sem
 * a barra e sem script. Ele entra direto na página (sem Shadow DOM) para usar
 * o `atlas.css` global e o tema do portal, exatamente como na versão avulsa.
 *
 * Aqui só se faz o que o HTML não pode fazer sozinho:
 * - liga busca, filtro, abas e diálogos (`enhance`, mesmos atributos do
 *   `assets/atlas.js`);
 * - troca o clique em link interno por navegação do React Router, para não
 *   recarregar o portal a cada tela.
 */
export function AtlasHtmlScreen({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const screen = ATLAS_HTML[slug];

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const cleanup = enhance(root);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest('a');
      const href = anchor?.getAttribute('href');
      if (!anchor || !href || anchor.target === '_blank' || !href.startsWith('/')) return;
      event.preventDefault();
      navigate(href);
    };
    root.addEventListener('click', onClick);

    // Link com âncora (/learning-paths#provisioning): rola até ela.
    const hash = window.location.hash.slice(1);
    if (hash) root.querySelector(`#${CSS.escape(hash)}`)?.scrollIntoView();

    return () => {
      cleanup();
      root.removeEventListener('click', onClick);
    };
  }, [navigate, slug]);

  if (!screen) {
    return (
      <Page themeId="tool">
        <Content>
          <div className="atlas-emptyState">
            Tela “{slug}” não encontrada. Rode <code>yarn screens:sync</code>.
          </div>
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Content>
        {screen.css && <style>{screen.css}</style>}
        <div
          ref={ref}
          data-atlas-screen={slug}
          // Conteúdo do próprio repositório, validado pelo sync (sem script,
          // sem handler inline).
          dangerouslySetInnerHTML={{ __html: screen.html }}
        />
      </Content>
    </Page>
  );
}
