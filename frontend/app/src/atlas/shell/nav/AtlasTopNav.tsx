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
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import useObservable from 'react-use/lib/useObservable';
import { AtlasLogo, EnvBadge } from '../../components';
import { useUnreadCount } from '../../screens/notifications/useUnreadCount';
import { ToolkitMenu } from '../../screens/home/toolkit';

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
  'page:catalog',
  'page:atlas-pages/my-groups',
  'page:atlas-pages/approvals',
  'page:api-docs',
  'page:techdocs',
  'page:atlas-pages/learning-paths',
  'page:scaffolder',
  'page:atlas-pages/provisioning-map',
  'page:atlas-pages/break-glass',
  'page:atlas-pages/status',
  'page:atlas-pages/atlas-jira',
  'page:atlas-pages/agent',
  'page:admin/api-keys',
  'page:admin',
];

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

function NavPill({ href, title }: { href: string; title: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = isActive(href, pathname);

  return (
    <button
      type="button"
      className={`atlas-navPill ${active ? 'atlas-navPillActive' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => navigate(href)}
    >
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
    el.scrollLeft = savedScrollLeft;
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

/** Buscar, Toolkit, notificações, tema e configurações: iguais nos dois menus. */
export function NavActions() {
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeToggle();
  const unread = useUnreadCount();

  return (
      <div className="atlas-navRight">
        <button type="button" className="atlas-navActionBtn" aria-label="Buscar" title="Buscar" onClick={() => navigate('/search')}>
          <SearchIcon fontSize="small" />
        </button>
        <ToolkitMenu />
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

  const pills = navItems.withComponent(item => <NavPill href={item.href} title={item.title} />);

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
