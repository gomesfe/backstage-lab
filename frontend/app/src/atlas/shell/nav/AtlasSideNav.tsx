import { useNavigate, useLocation } from 'react-router-dom';
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import { AtlasLogo, EnvBadge } from '../../components';
import type { ReactNode } from 'react';
import { NavActions, PILL_ORDER, isActive, useNavIcons } from './AtlasTopNav';

/**
 * Menu lateral: a mesma navegação do topo, em coluna. Logo e ações ficam em
 * cima (o Toolkit abre para baixo) e a lista de telas rola por conta própria.
 * Estilos: `atlas-sideNav*` no design system.
 */
function SideItem({ href, title, icon }: { href: string; title: string; icon?: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = isActive(href, pathname);
  const showIcon = useNavIcons();

  return (
    <button
      type="button"
      className={`atlas-sideNavItem ${active ? 'atlas-sideNavItemActive' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => navigate(href)}
    >
      {showIcon && icon && <span className="atlas-navPillIcon" aria-hidden="true">{icon}</span>}
      {title}
    </button>
  );
}

export function AtlasSideNav({ navItems }: { navItems: NavContentComponentProps['navItems'] }) {
  const navigate = useNavigate();
  const items = navItems.withComponent(item => <SideItem href={item.href} title={item.title} icon={item.icon} />);

  return (
    <aside className="atlas-sideNav atlas-sideNav--fixed">
      <button
        type="button"
        className="atlas-brandLogo"
        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', alignSelf: 'flex-start' }}
        aria-label="Atlas — ir para a Home"
        onClick={() => navigate('/')}
      >
        <AtlasLogo variant="horizontal" title="" />
        <EnvBadge />
      </button>
      <div className="atlas-sideNavActions">
        <NavActions />
      </div>
      <nav className="atlas-sideNavItems" aria-label="Navegação principal">
        {PILL_ORDER.map(id => items.take(id))}
      </nav>
    </aside>
  );
}
