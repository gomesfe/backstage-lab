import { Content, Page } from '@backstage/core-components';
import { EntityListCard } from '../catalog';
import { useAtlasStyles } from '../shared/styles';

/** APIs publicadas no catálogo. */
export function ApisPage() {
  const classes = useAtlasStyles();

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Explorer</span>
              <h1 className={classes.title}>APIs</h1>
              <p className={classes.subtitle}>
                Explore, versione e consuma as APIs publicadas no portal.
              </p>
            </div>
          </div>
          <EntityListCard
            titulo="APIs"
            kinds={['API']}
            colunas={['nome', 'descricao', 'subtipo', 'dono', 'ciclo', 'tags']}
            vazio="Nenhuma API registrada. Declare uma entidade kind: API no catalog-info.yaml do serviço."
          />
        </div>
      </Content>
    </Page>
  );
}
