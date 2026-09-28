import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/Brightness2';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import useObservable from 'react-use/lib/useObservable';
import { EnvBadge } from '@internal/plugin-components';

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
const PILL_ORDER = [
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
  'page:atlas-pages/atlas-jira',
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

function isActive(href: string, pathname: string) {
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * Math.max(160, ref.current.clientWidth * 0.6), behavior: 'smooth' });

  return { ref, edges, scrollBy };
}

const MAX_INDEX_KEY = 'atlas-nav-max-index';

/**
 * A tela "mãe" de uma rota, para o Voltar quando não há histórico (a pessoa
 * abriu um link direto): `/learning-paths/x` → `/learning-paths`,
 * `/catalog/default/component/y` → `/catalog`, `/create/tasks` → `/create`.
 */
function parentOf(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 1 ? `/${segments[0]}` : '/';
}

/**
 * Voltar e Avançar do portal, com estado de habilitado de verdade.
 *
 * O react-router guarda a posição no histórico em `history.state.idx`. A
 * maior posição alcançada diz se existe "frente": navegar para uma tela nova
 * (PUSH) descarta a frente, como no navegador. Fica em sessionStorage para
 * sobreviver a um F5.
 */
function useHistoryButtons() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const index: number = window.history.state?.idx ?? 0;

  const [maxIndex, setMaxIndex] = useState(() => {
    try {
      return Math.max(Number(sessionStorage.getItem(MAX_INDEX_KEY) ?? 0), index);
    } catch {
      return index;
    }
  });

  useEffect(() => {
    setMaxIndex(previous => {
      const next =
        navigationType === 'PUSH' ? index : Math.max(previous, index);
      try {
        sessionStorage.setItem(MAX_INDEX_KEY, String(next));
      } catch {
        // Sem sessionStorage (janela privada): só perde o "Avançar" após F5.
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const hasHistory = index > 0;
  return {
    canBack: hasHistory || location.pathname !== '/',
    canForward: index < maxIndex,
    backLabel: hasHistory ? 'Voltar' : `Voltar para ${parentOf(location.pathname) === '/' ? 'Home' : 'a tela anterior'}`,
    back: () => (hasHistory ? navigate(-1) : navigate(parentOf(location.pathname))),
    forward: () => navigate(1),
  };
}

export function AtlasTopNav({ navItems }: { navItems: NavContentComponentProps['navItems'] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggle } = useThemeToggle();
  const { ref, edges, scrollBy } = useScrollArrows();
  const history = useHistoryButtons();

  const pills = navItems.withComponent(item => <NavPill href={item.href} title={item.title} />);

  // Ao trocar de tela, centraliza a pílula ativa — na borda ela ficaria sob
  // o esmaecimento e parecia cortada.
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>('.atlas-navPillActive')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [pathname, ref]);

  return (
    <header className="atlas-topNav atlas-topNav--fixed">
      <div className="atlas-navLeft">
        <div className="atlas-navHistory">
          <button
            type="button"
            className="atlas-navActionBtn atlas-navActionBtnSm"
            aria-label={history.backLabel}
            title={`${history.backLabel} (Alt + ←)`}
            disabled={!history.canBack}
            onClick={history.back}
          >
            <ArrowBackIcon />
          </button>
          <button
            type="button"
            className="atlas-navActionBtn atlas-navActionBtnSm"
            aria-label="Avançar"
            title="Avançar (Alt + →)"
            disabled={!history.canForward}
            onClick={history.forward}
          >
            <ArrowForwardIcon />
          </button>
        </div>
        <div className="atlas-brandLogo">
          <span className="atlas-brandMark">A</span>
          <span className="atlas-brandName">Atlas</span>
          <EnvBadge />
        </div>

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

      <div className="atlas-navRight">
        <button type="button" className="atlas-navActionBtn" aria-label="Buscar" title="Buscar" onClick={() => navigate('/search')}>
          <SearchIcon fontSize="small" />
        </button>
        <button
          type="button"
          className="atlas-navActionBtn"
          aria-label="Notificações"
          title="Notificações"
          onClick={() => navigate('/notifications')}
        >
          <NotificationsIcon fontSize="small" />
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
    </header>
  );
}
