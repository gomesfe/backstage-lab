import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/Brightness2';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';
import type { NavContentComponentProps, NavContentNavItem } from '@backstage/plugin-app-react';
import type { ReactNode } from 'react';
import { usePref } from '../prefs';
import { usePermission } from '@backstage/plugin-permission-react';
import { atlasInternalViewPermission } from '../../permissions';
import useObservable from 'react-use/lib/useObservable';
import { AtlasLogo, EnvBadge } from '../../components';
import { useUnreadCount } from '../../../components/notifications/hooks/useUnreadCount';
import { ToolkitMenu } from './ToolkitMenu';
import { GroupsMenu } from './GroupsMenu';

/**
 * Barra de navegação do Atlas. Usa as classes do design system (`atlas.css`:
 * `atlas-topNav`, `atlas-navPill`, `atlas-navArrow`…).
 */

/**
 * As telas da navegação, nesta ordem — e só elas.
 *
 * Página registrada que não está aqui continua acessível pela URL (busca,
 * configurações, páginas estáticas), mas não ganha pílula: a barra mostra o
 * produto, não tudo o que está instalado.
 */
export const PILL_ORDER = [
  'page:home',
  'page:scaffolder',
  'page:atlas-pages/skills',
  'page:atlas-pages/approvals',
  'page:atlas-pages/provisioning-map',
  'page:atlas-pages/learning-paths',
  'page:techdocs',
  'page:atlas-pages/agent',
  'page:atlas-pages/break-glass',
  'page:atlas-pages/status',
];

/**
 * Seção "Atlas": só para quem tem `atlas.internal.view` (o time do Atlas).
 * O rótulo da seção não é clicável. As páginas continuam existindo pela URL.
 */
export const ATLAS_SECTION_ORDER = [
  'page:catalog',
  'page:api-docs',
  'page:atlas-pages/atlas-jira',
  'page:admin/api-keys',
  'page:admin',
];

/** É do time do Atlas? (permissão `atlas.internal.view`, vinda do RBAC). */
export function useAtlasTeam() {
  const { allowed } = usePermission({ permission: atlasInternalViewPermission });
  return allowed;
}

function useThemeToggle() {
  const appThemeApi = useApi(appThemeApiRef);
  const activeId = useObservable(appThemeApi.activeThemeId$(), appThemeApi.getActiveThemeId());

  const isDark = activeId !== 'light';
  const toggle = () => appThemeApi.setActiveThemeId(isDark ? 'light' : 'dark');

  return { isDark, toggle };
}

export function isActive(href: string, pathname: string) {
  // Casamento por segmento, não por prefixo: `/api-keys` não pode acender
  // uma pílula `/api`. A home fica em "/", onde prefixo casaria com tudo.
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/** Ícones no menu: preferência `navIcons` (Configurações › Aparência), ligada por padrão. */
export function useNavIcons() {
  return usePref('navIcons', '1') === '1';
}

function NavPill({ href, title, icon }: { href: string; title: string; icon?: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = isActive(href, pathname);
  const showIcon = useNavIcons();

  return (
    <button
      type="button"
      className={`atlas-navPill ${active ? 'atlas-navPillActive' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => navigate(href)}
      title={showIcon ? undefined : title}
    >
      {showIcon && icon && <span className="atlas-navPillIcon" aria-hidden="true">{icon}</span>}
      {title}
    </button>
  );
}

/**
 * Setas para rolar a faixa de pílulas quando ela não cabe na tela. Cada seta
 * só aparece quando há o que ver daquele lado.
 */
// A barra é remontada a cada troca de tela; sem guardar a posição, ela voltaria
// para o início e a pílula clicada sairia de vista. Quem rola é o usuário.
let savedScrollLeft = 0;

/**
 * Componente fixo para `withComponent`: uma função criada a cada render faria o
 * React desmontar e remontar todas as pílulas a cada troca de tela — e, com a
 * faixa vazia por um instante, o navegador zera a rolagem.
 */
function NavPillItem(item: NavContentNavItem) {
  return <NavPill href={item.href} title={item.title} icon={item.icon} />;
}

/** Quantas pílulas cabem antes da seta; em tela menor, cabem menos (a faixa encolhe). */
const VISIBLE_PILLS = 7;

/**
 * Limita a largura da faixa às primeiras {@link VISIBLE_PILLS} pílulas. A
 * faixa ainda pode encolher (tela estreita); o resto aparece pela seta.
 */
function useVisiblePills(ref: { current: HTMLElement | null }, deps: unknown[]) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const pills = Array.from(el.children) as HTMLElement[];
      if (pills.length <= VISIBLE_PILLS) {
        el.style.maxWidth = '';
        return;
      }
      const style = getComputedStyle(el);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const span = pills[VISIBLE_PILLS - 1].getBoundingClientRect().right - pills[0].getBoundingClientRect().left;
      const next = `${Math.ceil(span + padding + 2)}px`;
      if (el.style.maxWidth !== next) el.style.maxWidth = next;
      // Só agora a faixa tem o tamanho certo para voltar à posição em que a
      // pessoa a deixou (a barra é remontada a cada troca de tela).
      if (el.scrollLeft !== savedScrollLeft) el.scrollLeft = savedScrollLeft;
    };
    fit();
    // Recalcula no próximo quadro: mexer na largura dentro do callback do
    // ResizeObserver gera o aviso "ResizeObserver loop".
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    Array.from(el.children).forEach(child => observer.observe(child));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function useScrollArrows() {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    // A posição salva é aplicada em useVisiblePills, depois do limite de
    // largura: aplicada aqui, o navegador a cortaria (ainda não há o que
    // rolar) e o evento de rolagem gravaria o valor cortado.
    update();
    const onScroll = () => {
      savedScrollLeft = el.scrollLeft;
      update();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * Math.max(160, ref.current.clientWidth * 0.6), behavior: 'smooth' });

  return { ref, edges, scrollBy };
}

/** Campo de busca da barra: Enter abre a tela de busca com o termo (`/search?q=`). */
export function NavSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <form
      className="atlas-navSearch"
      role="search"
      onSubmit={event => {
        event.preventDefault();
        const term = query.trim();
        navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
      }}
    >
      <SearchIcon fontSize="small" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Buscar no Atlas"
        aria-label="Buscar no Atlas"
      />
    </form>
  );
}

/** Toolkit, grupos, notificações, tema e configurações (e a busca): iguais nos dois menus. */
export function NavActions({ withSearch = true }: { withSearch?: boolean }) {
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeToggle();
  const unread = useUnreadCount();

  return (
      <div className="atlas-navRight">
        {withSearch && <NavSearch />}
        {withSearch && (
          <button type="button" className="atlas-navActionBtn atlas-navSearchBtn" aria-label="Buscar" title="Buscar" onClick={() => navigate('/search')}>
            <SearchIcon fontSize="small" />
          </button>
        )}
        <ToolkitMenu />
        <GroupsMenu />
        <button
          type="button"
          className="atlas-navActionBtn"
          aria-label={unread ? `Notificações: ${unread} não lidas` : 'Notificações'}
          title={unread ? `${unread} não lidas` : 'Notificações'}
          onClick={() => navigate('/notifications')}
        >
          <NotificationsIcon fontSize="small" />
          {unread > 0 && <span className="atlas-navCount" aria-hidden>{unread > 99 ? '99+' : unread}</span>}
        </button>
        <button
          type="button"
          className="atlas-navActionBtn"
          aria-label="Alternar tema"
          title={isDark ? 'Tema claro' : 'Tema escuro'}
          onClick={toggle}
        >
          {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </button>
        <button
          type="button"
          className="atlas-navActionBtn"
          aria-label="Configurações"
          title="Configurações"
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon fontSize="small" />
        </button>
      </div>
  );
}

export function AtlasTopNav({ navItems }: { navItems: NavContentComponentProps['navItems'] }) {
  const navigate = useNavigate();
  const { ref, edges, scrollBy } = useScrollArrows();
  const showIcons = useNavIcons();
  const atlasTeam = useAtlasTeam();
  useVisiblePills(ref, [showIcons, navItems, atlasTeam]);

  const pills = navItems.withComponent(NavPillItem);

  return (
    <header className="atlas-topNav atlas-topNav--fixed">
      <div className="atlas-navLeft">
        <button
          type="button"
          className="atlas-brandLogo"
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          aria-label="Atlas — ir para a Home"
          onClick={() => navigate('/')}
        >
          {/* Horizontal na barra; em tela bem estreita, só o símbolo. */}
          <AtlasLogo variant="horizontal" className="atlas-logoWide" title="" />
          <AtlasLogo variant="symbol" className="atlas-logoCompact" title="" />
          <EnvBadge />
        </button>

        <div className="atlas-navPillsWrapper">
          <button
            type="button"
            className={`atlas-navArrow ${edges.left ? 'atlas-navArrowVisible' : ''}`}
            aria-label="Rolar navegação para a esquerda"
            tabIndex={edges.left ? 0 : -1}
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeftIcon />
          </button>
          <nav
            ref={ref}
            className="atlas-navPills"
            aria-label="Navegação principal"
            // A máscara de esmaecer só faz sentido do lado em que há mais itens.
            style={edges.right ? undefined : { maskImage: 'none', WebkitMaskImage: 'none' }}
          >
            {PILL_ORDER.map(id => pills.take(id))}
            {atlasTeam && (
              <span className="atlas-navSection" aria-hidden="true">
                Atlas
              </span>
            )}
            {atlasTeam && ATLAS_SECTION_ORDER.map(id => pills.take(id))}
          </nav>
          <button
            type="button"
            className={`atlas-navArrow ${edges.right ? 'atlas-navArrowVisible' : ''}`}
            aria-label="Rolar navegação para a direita"
            tabIndex={edges.right ? 0 : -1}
            onClick={() => scrollBy(1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <NavActions />
    </header>
  );
}
