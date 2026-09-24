import { useState } from 'react';
import { Content, Page } from '@backstage/core-components';
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
 * Usa `atlas-appContainer` (a mesma classe que o shell do design usa para o
 * miolo da página) em vez de um grid próprio — layout e espaçamento vertical
 * vêm do design system, não de uma aproximação em makeStyles.
 *
 * Sem `Header`: no design a barra de navegação já é o topo da página, e um
 * cabeçalho do Backstage abaixo dela criaria duas faixas competindo.
 */
export function AtlasHomePage() {
  const [scope, setScope] = useState('Todos');
  const { metrics, services, loading } = useHomeData(scope);

  return (
    <Page themeId="home">
      <Content>
        <div className="atlas-appContainer">
          <ServiceScopeSelector scope={scope} onChange={setScope} />

          <HeroSection metrics={metrics} loading={loading} />

          <QuickActionsSection />

          <div className="atlas-homeThreeCardsGrid">
            <GeneralUpdatesSection />
            <ServicesSection services={services} loading={loading} />
            <UsefulLinksSection />
          </div>

          <div className="atlas-provisioningToolkitRow">
            <OnboardingSection />
            <div className="atlas-toolkitColumn">
              <ToolkitSection />
            </div>
          </div>
        </div>
      </Content>
    </Page>
  );
}
