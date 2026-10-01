import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Content, Page } from '@backstage/core-components';
import { appThemeApiRef, identityApiRef, useApi } from '@backstage/core-plugin-api';
import { ATLAS_HTML } from '../../screens/html.generated';
import { enhance, openHash } from './enhance';

/**
 * Mostra no portal uma tela feita em HTML estático.
 *
 * O HTML vem de `screens/<tela>/index.html`, pelo `yarn screens:sync`, já sem
 * a barra e sem script. Ele entra direto na página (sem Shadow DOM) para usar
 * o `atlas.css` global e o tema do portal, exatamente como na versão avulsa.
 *
 * Aqui só se faz o que o HTML não pode fazer sozinho:
 * - liga busca, filtros, abas, diálogos e estrelas (`assets/atlas-behaviors.js`,
 *   o mesmo arquivo da versão avulsa), com o tema e o "Sair" do portal;
 * - troca o clique em link interno por navegação do React Router, para não
 *   recarregar o portal a cada tela;
 * - reaplica `?filtros` e `#aba` quando o endereço muda sem trocar de tela.
 */
export function AtlasHtmlScreen({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { search, hash } = useLocation();
  const appThemeApi = useApi(appThemeApiRef);
  const identityApi = useApi(identityApiRef);
  const screen = ATLAS_HTML[slug];

  // Liga os comportamentos (de novo quando os filtros do endereço mudam).
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    return enhance(root, {
      setTheme: theme => appThemeApi.setActiveThemeId(theme),
      currentTheme: () =>
        root.closest('.atlas-root')?.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      signOut: () => identityApi.signOut(),
    });
  }, [slug, search, appThemeApi, identityApi]);

  // Primeiro nome do perfil de login, para a saudação (o guest fica sem nome).
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let active = true;
    identityApi
      .getProfileInfo()
      .then(profile => {
        const first = (profile.displayName ?? '').trim().split(/\s+/)[0];
        if (!active || !first || first.toLowerCase() === 'guest') return;
        root.setAttribute('data-atlas-user', first);
        root.dispatchEvent(new Event('atlas:user'));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug, identityApi]);

  // #aba dentro da mesma tela: o React Router não dispara `hashchange`.
  useEffect(() => {
    if (ref.current && hash) openHash(ref.current, hash);
  }, [hash]);

  // Link interno → navegação do portal.
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
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
    return () => root.removeEventListener('click', onClick);
  }, [navigate]);

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
