import { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Content, Page } from '@backstage/core-components';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
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
 * Home do Atlas. O que ela deve conter está em `README.md`, nesta pasta.
 *
 * Sem `Header` do Backstage: a barra de navegação já é o topo da página, e um
 * cabeçalho abaixo dela criaria duas faixas competindo.
 */
export function HomePage() {
  const [scope, setScope] = useState('Todos');
  const { metrics, services, totalServices, loading } = useHomeData(scope);

  const identityApi = useApi(identityApiRef);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo(), [identityApi]);
  // "Felipe Lima" → "Felipe". O guest não tem nome de exibição: cai no
  // "Bem-vindo ao Atlas" em vez de cumprimentar "Guest".
  const firstName =
    profile?.displayName && !/^guest$/i.test(profile.displayName)
      ? profile.displayName.split(' ')[0]
      : undefined;

  return (
    <Page themeId="home">
      <Content>
        <div className="atlas-appContainer">
          <ServiceScopeSelector scope={scope} onChange={setScope} />

          <HeroSection firstName={firstName} metrics={metrics} loading={loading} />

          <QuickActionsSection />

          <div className="atlas-homeThreeCardsGrid">
            <ServicesSection services={services} total={totalServices} loading={loading} />
            <GeneralUpdatesSection />
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
