import { Content, Page } from '@backstage/core-components';
import { EntityListCard } from '../catalog';
import { useAtlasStyles } from '../shared/styles';

/**
 * Docs: o índice do que publica documentação técnica (TechDocs) — as
 * entidades com a anotação `backstage.io/techdocs-ref`. O nome abre direto a
 * documentação: quem está em Docs quer ler.
 */
export function DocsPage() {
  const classes = useAtlasStyles();

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>TechDocs</span>
              <h1 className={classes.title}>Docs</h1>
              <p className={classes.subtitle}>
                Documentação técnica versionada junto ao código dos componentes.
              </p>
            </div>
          </div>
          <EntityListCard
            titulo="Documentação"
            kinds={['Component', 'System', 'API']}
            colunas={[
              'nome',
              'descricao',
              'tipo',
              'subtipo',
              'dono',
              'ciclo',
              'tags',
            ]}
            filtroTipo
            docs
            vazio="Nada publica documentação ainda. Adicione a anotação backstage.io/techdocs-ref ao catalog-info.yaml do componente."
          />
        </div>
      </Content>
    </Page>
  );
}
