import { useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/Brightness2';
import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import useObservable from 'react-use/lib/useObservable';
import { atlasTokens } from '../theme';

/**
 * Ordem das pílulas, copiada de `NAV_LINKS` em data.ts do redesign.
 *
 * Os ids são os das extensões de página do Backstage. O que não estiver aqui
 * aparece depois, em ordem alfabética — então um plugin novo não some da
 * navegação só por não ter sido previsto nesta lista.
 */
const PILL_ORDER = [
  'page:home',
  'page:catalog',
  'page:api-docs',
  'page:techdocs',
  'page:scaffolder',
  'page:admin',
];

const { brand, radius } = atlasTokens;

const useStyles = makeStyles(theme => {
  const border = theme.palette.divider;
  const surface = theme.palette.background.paper;

  return {
    bar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      backgroundColor: surface,
      border: `1px solid ${border}`,
      borderRadius: radius.lg,
      padding: '12px 16px',
      minHeight: 56,
      margin: '16px auto 0',
      maxWidth: atlasTokens.maxWidth,
      width: 'calc(100% - 32px)',
      // Acima do conteúdo, mas abaixo de modais e do drawer do MUI.
      position: 'relative',
      zIndex: 10,
    },
    left: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 },
    brand: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
    mark: {
      width: 34,
      height: 34,
      borderRadius: 10,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: brand.lime,
      color: brand.limeText,
      fontWeight: 800,
      boxShadow: `0 4px 14px ${brand.limeBorder}`,
    },
    name: {
      fontSize: '1.1rem',
      fontWeight: 800,
      letterSpacing: '0.3px',
      color: theme.palette.text.primary,
    },
    pills: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: 4,
      borderRadius: radius.pill,
      border: `1px solid ${border}`,
      // Muitas pílulas viram rolagem horizontal, não quebra de linha: a barra
      // precisa manter a altura previsível quando um plugin novo entra.
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    pill: {
      padding: '8px 16px',
      borderRadius: radius.pill,
      fontSize: '0.85rem',
      fontWeight: 600,
      color: theme.palette.text.secondary,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      textDecoration: 'none',
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: theme.palette.text.primary,
        background: theme.palette.action.hover,
      },
    },
    pillActive: {
      background: brand.lime,
      color: brand.limeText,
      '&:hover': { background: brand.lime, color: brand.limeText },
    },
    right: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    action: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      background: surface,
      border: `1px solid ${border}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: theme.palette.action.hover,
        color: theme.palette.text.primary,
        transform: 'scale(1.08)',
      },
    },
  };
});

/** Alterna entre os dois temas do Atlas. */
function useThemeToggle() {
  const appThemeApi = useApi(appThemeApiRef);
  const activeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const isDark = activeId !== 'atlas-light';
  const toggle = () =>
    appThemeApi.setActiveThemeId(isDark ? 'atlas-light' : 'atlas-dark');

  return { isDark, toggle };
}

/** Uma pílula da navegação. */
function NavPill({ href, title }: { href: string; title: string }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // A home fica montada em "/", então prefixo casaria com tudo.
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <button
      type="button"
      className={`${classes.pill} ${active ? classes.pillActive : ''}`}
      onClick={() => navigate(href)}
    >
      {title}
    </button>
  );
}

type Props = {
  navItems: NavContentComponentProps['navItems'];
};

export function AtlasTopNav({ navItems }: Props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeToggle();

  const pills = navItems.withComponent(item => (
    <NavPill href={item.href} title={item.title} />
  ));

  return (
    <header className={classes.bar}>
      <div className={classes.left}>
        <div className={classes.brand}>
          <span className={classes.mark}>A</span>
          <span className={classes.name}>Atlas</span>
        </div>

        <nav className={classes.pills} aria-label="Navegação principal">
          {PILL_ORDER.map(id => pills.take(id))}
          {pills.rest({ sortBy: 'title' })}
        </nav>
      </div>

      <div className={classes.right}>
        <Tooltip title="Buscar">
          <button
            type="button"
            className={classes.action}
            aria-label="Buscar"
            onClick={() => navigate('/search')}
          >
            <SearchIcon fontSize="small" />
          </button>
        </Tooltip>

        <Tooltip title="Notificações">
          <button
            type="button"
            className={classes.action}
            aria-label="Notificações"
            onClick={() => navigate('/notifications')}
          >
            <NotificationsIcon fontSize="small" />
          </button>
        </Tooltip>

        <Tooltip title={isDark ? 'Tema claro' : 'Tema escuro'}>
          <button
            type="button"
            className={classes.action}
            aria-label="Alternar tema"
            onClick={toggle}
          >
            {isDark ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </button>
        </Tooltip>

        <Tooltip title="Configurações">
          <button
            type="button"
            className={classes.action}
            aria-label="Configurações"
            onClick={() => navigate('/settings')}
          >
            <SettingsIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
