import { useState } from 'react';
import { Content, Page } from '@backstage/core-components';
import { useAtlasStyles } from './useAtlasStyles';
import { useHomeData } from './useHomeData';
import {
  GeneralUpdatesSection,
  HeroSection,
  OnboardingSection,
  QuickActionsSection,
  ServiceScopeSelector,
  ServicesSection,
  ToolkitSection,
  UsefulLinksSection,
} from './sections';

/**
 * Home do Atlas, portada de AtlasHome.tsx do redesign.
 *
 * Sem `Header`: no design a barra de navegação já é o topo da página, e um
 * cabeçalho do Backstage abaixo dela criaria duas faixas competindo.
 */
export function AtlasHomePage() {
  const classes = useAtlasStyles();
  const [scope, setScope] = useState('Todos');
  const { metrics, services, loading } = useHomeData(scope);

  return (
    <Page themeId="home">
      <Content>
        <div className={classes.container}>
          <ServiceScopeSelector scope={scope} onChange={setScope} />

          <HeroSection metrics={metrics} loading={loading} />

          <QuickActionsSection />

          <div className={classes.threeColumns}>
            <GeneralUpdatesSection />
            <ServicesSection services={services} loading={loading} />
            <UsefulLinksSection />
          </div>

          <div className={classes.twoThirds}>
            <OnboardingSection />
            <ToolkitSection />
          </div>
        </div>
      </Content>
    </Page>
  );
}
