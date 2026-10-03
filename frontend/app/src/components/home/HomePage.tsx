import { Content, Page, ResponseErrorPanel } from '@backstage/core-components';
import { useProvisioningMap } from '../provisioningMap/hooks/useProvisioningMap';
import { MetricBlocks } from './MetricBlocks';
import { ProvisionedPanel } from './ProvisionedPanel';
import {
  ComingSoon,
  LatestTransactions,
  LatestUpdates,
  UsefulLinks,
} from './SideCards';
import { TeamApps } from './TeamApps';
import { WelcomeCard } from './WelcomeCard';
import { useHomeCatalogo } from './hooks/useHomeCatalogo';
import { useStyles } from './styles';

/**
 * Home: boas-vindas e números; o que está provisionado; aplicações do time e
 * últimas transações; novidades e o que vem por aí; links úteis.
 */
export function HomePage() {
  const classes = useStyles();
  const catalogo = useHomeCatalogo();
  const mapa = useProvisioningMap();

  return (
    <Page themeId="home">
      <Content>
        <div className={`${classes.page} ${classes.home}`}>
          <section className={classes.hero}>
            <WelcomeCard />
            <MetricBlocks
              carregando={catalogo.loading}
              numeros={{
                ...catalogo.numeros,
                recursos: mapa.recursos.length,
                repositorios: mapa.repositorios.length,
              }}
            />
          </section>
          {catalogo.error && <ResponseErrorPanel error={catalogo.error} />}

          <ProvisionedPanel />

          <div className={classes.divisao}>
            <TeamApps aplicacoes={catalogo.aplicacoes} />
            <LatestTransactions />
          </div>

          <div className={`${classes.divisao} ${classes.divisaoIgual}`}>
            <LatestUpdates />
            <ComingSoon />
          </div>

          <UsefulLinks />
        </div>
      </Content>
    </Page>
  );
}
