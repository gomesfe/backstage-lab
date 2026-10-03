import { useMemo, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import {
  Content,
  Link,
  Page,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { atlasEnvApiRef } from '../../atlas/components';
import { FilterSelect } from '../shared/FilterSelect';
import { useOfertas } from './hooks/useOfertas';
import { agruparOfertas, contarCategorias, linkDaOferta } from './helpers';
import { useStyles } from './styles';

/**
 * Ofertas: a galeria dos templates do scaffolder, agrupada por categoria.
 * O formulário de cada oferta continua sendo o do scaffolder.
 */
export function OffersPage() {
  const classes = useStyles();
  const ambiente = useApi(atlasEnvApiRef);
  const { ofertas, loading, error } = useOfertas();
  // Registrar componente existente: pouca gente usa e só faz sentido fora de
  // produção. Aparece para quem pode criar entidades no catálogo (RBAC).
  const { allowed: podeRegistrar } = usePermission({
    permission: catalogEntityCreatePermission,
  });
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');

  const categorias = useMemo(() => contarCategorias(ofertas), [ofertas]);
  const grupos = useMemo(
    () => agruparOfertas(ofertas, busca, categoria),
    [ofertas, busca, categoria],
  );
  const rotulo = (nome: string, total: number) => `${nome} (${total})`;

  let conteudo;
  if (error) conteudo = <ResponseErrorPanel error={error} />;
  else if (loading) {
    conteudo = (
      <div className={classes.grupo} aria-hidden>
        {[85, 75, 65].map(largura => (
          <div
            key={largura}
            className={classes.esqueleto}
            style={{ width: `${largura}%` }}
          />
        ))}
      </div>
    );
  } else if (grupos.length === 0) {
    conteudo = (
      <div className={classes.empty}>
        {ofertas.length === 0
          ? 'Nenhuma oferta registrada. Rode `yarn templates:sync` se acabou de adicionar um spec.'
          : 'Nenhuma oferta com esse filtro.'}
      </div>
    );
  } else {
    conteudo = (
      <div className={classes.grupos}>
        {grupos.map(([nome, itens]) => (
          <div key={nome} className={classes.grupo}>
            <h2 className={classes.grupoTitulo}>
              {nome}
              <span className={classes.count}>{itens.length}</span>
            </h2>
            <div className={classes.grid}>
              {itens.map(oferta => (
                <article
                  key={`${oferta.namespace}/${oferta.nome}`}
                  className={classes.cartao}
                >
                  <div>
                    <span className={classes.badgeInfo}>{oferta.tipo}</span>
                  </div>
                  <div className={classes.cartaoTitulo}>{oferta.titulo}</div>
                  <div className={classes.cartaoTexto}>{oferta.descricao}</div>
                  <div className={classes.rodape}>
                    {oferta.tags.slice(0, 3).map(tag => (
                      <span key={tag} className={classes.tag}>
                        {tag}
                      </span>
                    ))}
                    <Link
                      to={linkDaOferta(oferta)}
                      className={`${classes.pillPrimary} ${classes.empurra}`}
                    >
                      Escolher
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Provisionamento</span>
              <h1 className={classes.title}>Ofertas</h1>
              <p className={classes.subtitle}>
                Escolha uma oferta para provisionar recursos, criar repositórios
                ou registrar entidades.
              </p>
            </div>
            <div className={classes.acoes}>
              {podeRegistrar && ambiente.envName !== 'prod' && (
                <Link
                  to="/catalog-import"
                  className={classes.button}
                  title={`Cadastra no catálogo um componente que já tem catalog-info.yaml. Só em ambientes não produtivos (${ambiente.envName}).`}
                >
                  Registrar componente existente
                </Link>
              )}
              <Link to="/create/tasks" className={classes.button}>
                Minhas tarefas
              </Link>
            </div>
          </div>

          <div className={classes.barra}>
            <label className={classes.search}>
              <SearchIcon style={{ fontSize: 18 }} />
              <input
                type="search"
                placeholder="Buscar oferta"
                aria-label="Buscar oferta"
                value={busca}
                onChange={evento => setBusca(evento.target.value)}
              />
            </label>
            <FilterSelect
              label="Categoria"
              value={
                categoria
                  ? rotulo(
                      categoria,
                      categorias.find(([nome]) => nome === categoria)?.[1] ?? 0,
                    )
                  : ''
              }
              options={categorias.map(([nome, total]) => rotulo(nome, total))}
              allLabel={rotulo('Todas', ofertas.length)}
              onChange={valor =>
                setCategoria(
                  categorias.find(
                    ([nome, total]) => rotulo(nome, total) === valor,
                  )?.[0] ?? '',
                )
              }
            />
          </div>

          {conteudo}
        </div>
      </Content>
    </Page>
  );
}
