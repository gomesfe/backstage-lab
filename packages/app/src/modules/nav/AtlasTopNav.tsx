import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/Brightness2';
import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import useObservable from 'react-use/lib/useObservable';
import { EnvBadge } from '@internal/plugin-components';

/**
 * Barra de navegação do Atlas, portada de `HomeTopNav.tsx`.
 *
 * Usa as classes de `atlas-ds.css` (`atlas-topNav`, `atlas-navPill`, …) em vez
 * de reimplementar as formas: o DS já define espaçamento, raio, rolagem e
 * estados de hover exatamente como no design.
 */

/** Ordem das pílulas, de `NAV_LINKS` do redesign. */
const PILL_ORDER = [
  'page:home',
  'page:catalog',
  'page:atlas-pages/catalog-v2',
  'page:atlas-pages/my-groups',
  'page:api-docs',
  'page:techdocs',
  'page:atlas-pages/learning-paths',
  'page:scaffolder',
  'page:atlas-pages/break-glass',
  'page:admin/api-keys',
  'page:admin',
];

function useThemeToggle() {
  const appThemeApi = useApi(appThemeApiRef);
  const activeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const isDark = activeId !== 'light';
  const toggle = () =>
    appThemeApi.setActiveThemeId(isDark ? 'light' : 'dark');

  return { isDark, toggle };
}

function NavPill({ href, title }: { href: string; title: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Casamento por segmento, não por prefixo: `/catalog-v2` começa com
  // `/catalog` e acenderia as duas pílulas. A home fica em "/", onde prefixo
  // casaria com tudo.
  const active =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <button
      type="button"
      className={`atlas-navPill ${active ? 'atlas-navPillActive' : ''}`}
      onClick={() => navigate(href)}
    >
      {title}
    </button>
  );
}

export function AtlasTopNav({
  navItems,
}: {
  navItems: NavContentComponentProps['navItems'];
}) {
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeToggle();

  const pills = navItems.withComponent(item => (
    <NavPill href={item.href} title={item.title} />
  ));

  return (
    <header className="atlas-topNav">
      <div className="atlas-navLeft">
        <div className="atlas-brandLogo">
          <span className="atlas-brandMark">A</span>
          <span className="atlas-brandName">Atlas</span>
          <EnvBadge />
        </div>

        <div className="atlas-navPillsWrapper">
          <nav className="atlas-navPills" aria-label="Navegação principal">
            {PILL_ORDER.map(id => pills.take(id))}
            {/* O que não está na ordem aparece depois: plugin novo não some
                da navegação por não ter sido previsto. */}
            {pills.rest({ sortBy: 'title' })}
          </nav>
        </div>
      </div>

      <div className="atlas-navRight">
        <button
          type="button"
          className="atlas-navActionBtn"
          aria-label="Buscar"
          title="Buscar"
          onClick={() => navigate('/search')}
        >
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
          {isDark ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
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
