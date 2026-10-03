import { useState } from 'react';
import { Content, Page } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';
import { atlasInternalViewPermission } from '../../atlas/permissions';
import { useAtlasStyles } from '../shared/styles';
import { EntityListCard } from './EntityListCard';

/**
 * Catálogo: aplicações, sistemas, recursos e squads registrados. A aba
 * "Interno do Atlas" só aparece para o time do Atlas (RBAC).
 */
export function CatalogPage() {
  const classes = useAtlasStyles();
  const { allowed: verInterno } = usePermission({
    permission: atlasInternalViewPermission,
  });
  const [aba, setAba] = useState<'catalogo' | 'interno'>('catalogo');
  const abaAtual = verInterno ? aba : 'catalogo';

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Descoberta</span>
              <h1 className={classes.title}>Catálogo</h1>
              <p className={classes.subtitle}>
                Aplicações, sistemas, recursos e squads registrados no portal.
              </p>
            </div>
          </div>

          {verInterno && (
            <div className={classes.tabs} role="tablist" aria-label="Catálogo">
              {(
                [
                  ['catalogo', 'Catálogo'],
                  ['interno', 'Interno do Atlas'],
                ] as const
              ).map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={abaAtual === id}
                  className={`${classes.tab} ${
                    abaAtual === id ? classes.tabActive : ''
                  }`}
                  onClick={() => setAba(id)}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          )}

          {abaAtual === 'catalogo' ? (
            <EntityListCard
              titulo="Catálogo"
              kinds={['Component', 'System', 'Resource', 'Group']}
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
              vazio="Nenhuma entidade registrada. Use uma oferta em Ofertas."
            />
          ) : (
            <EntityListCard
              titulo="Interno do Atlas"
              kinds={['Component', 'Resource']}
              colunas={[
                'nome',
                'descricao',
                'tipo',
                'subtipo',
                'dono',
                'ciclo',
              ]}
              filtroTipo
              interno
              vazio="Nenhum item interno do Atlas registrado."
            />
          )}
        </div>
      </Content>
    </Page>
  );
}
