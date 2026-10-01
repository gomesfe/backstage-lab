import { useNavigate, useLocation } from 'react-router-dom';
import type { NavContentComponentProps, NavContentNavItem } from '@backstage/plugin-app-react';
import { AtlasLogo, EnvBadge } from '../../components';
import type { ReactNode } from 'react';
import { ATLAS_SECTION_ORDER, NavActions, NavSearch, PILL_ORDER, isActive, useAtlasTeam, useNavIcons } from './AtlasTopNav';

/**
 * Menu lateral: a mesma navegação do topo, em coluna. Logo grande e busca em
 * cima, telas no meio (rolam sozinhas) e as ações no rodapé (o Toolkit e os
 * grupos abrem para cima). Estilos: `atlas-sideNav*` no design system.
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

/** Componente fixo para `withComponent` (ver NavPillItem em AtlasTopNav). */
function SideItemFor(item: NavContentNavItem) {
  return <SideItem href={item.href} title={item.title} icon={item.icon} />;
}

export function AtlasSideNav({ navItems }: { navItems: NavContentComponentProps['navItems'] }) {
  const navigate = useNavigate();
  const items = navItems.withComponent(SideItemFor);
  const atlasTeam = useAtlasTeam();

  return (
    <aside className="atlas-sideNav atlas-sideNav--fixed">
      <div className="atlas-sideNavHead">
        <button type="button" className="atlas-sideNavBrand" aria-label="Atlas — ir para a Home" onClick={() => navigate('/')}>
          <AtlasLogo variant="horizontal" className="atlas-sideNavLogo" title="" />
        </button>
        <EnvBadge />
      </div>
      <NavSearch />
      <span className="atlas-sideNavLabel">Navegação</span>
      <nav className="atlas-sideNavItems" aria-label="Navegação principal">
        {PILL_ORDER.map(id => items.take(id))}
        {atlasTeam && <span className="atlas-sideNavLabel atlas-sideNavLabelSection">Atlas</span>}
        {atlasTeam && ATLAS_SECTION_ORDER.map(id => items.take(id))}
      </nav>
      <div className="atlas-sideNavFoot">
        <NavActions withSearch={false} />
      </div>
    </aside>
  );
}
