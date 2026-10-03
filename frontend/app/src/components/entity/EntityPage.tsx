import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  Content,
  Link,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useStarredEntities } from '@backstage/plugin-catalog-react';
import { EntityListCard } from '../catalog';
import { ROTULO_TIPO } from '../catalog/helpers';
import { EntityAbout } from './EntityAbout';
import { EntityDocs } from './EntityDocs';
import { EntityRelations } from './EntityRelations';
import { useEntidade } from './hooks/useEntidade';
import { lerAncora, origem } from './helpers';
import { useStyles } from './styles';

/**
 * Entidade: `/entidade#<tipo>-<nome>` (ex.: `#component-payments-api`).
 * Sem `#`, mostra a lista de todas. Lê a entidade e as relações do catálogo.
 */
export function EntityPage() {
  const classes = useStyles();
  const { hash } = useLocation();
  const { kind, nome, docs } = lerAncora(hash);
  const { value, loading, error } = useEntidade(kind, nome);
  const { isStarredEntity, toggleStarredEntity } = useStarredEntities();
  const docsRef = useRef<HTMLElement>(null);
  const entidade = value?.entidade;

  // `#…-docs` rola até a documentação.
  useEffect(() => {
    if (docs && entidade)
      docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [docs, entidade]);

  let conteudo;
  if (!kind) {
    conteudo = (
      <>
        <div className={classes.header}>
          <div>
            <span className={classes.eyebrow}>Catálogo</span>
            <h1 className={classes.title}>Entidades</h1>
            <p className={classes.subtitle}>
              Tudo o que está registrado no catálogo. Escolha uma para ver os
              detalhes.
            </p>
          </div>
        </div>
        <EntityListCard
          titulo="Entidades"
          kinds={['Component', 'API', 'System', 'Resource', 'Group']}
          colunas={['nome', 'descricao', 'tipo', 'subtipo', 'dono', 'ciclo']}
          filtroTipo
          vazio="Nenhuma entidade registrada."
        />
      </>
    );
  } else if (loading) {
    conteudo = <Progress />;
  } else if (error) {
    conteudo = <ResponseErrorPanel error={error} />;
  } else if (!entidade) {
    conteudo = (
      <div className={classes.empty}>
        <strong className={classes.alertTitle}>Entidade não encontrada</strong>
        Nada no catálogo com esse endereço.{' '}
        <Link to="/catalog">Voltar para o catálogo</Link>
      </div>
    );
  } else {
    const ref = stringifyEntityRef(entidade);
    const favorita = isStarredEntity(ref);
    const de = origem(entidade);
    const temDocs = Boolean(
      entidade.metadata.annotations?.['backstage.io/techdocs-ref'],
    );
    conteudo = (
      <>
        <div className={classes.header}>
          <div>
            <nav className={classes.migalhas} aria-label="Você está em">
              <Link to="/">Home</Link> › <Link to={de.para}>{de.rotulo}</Link> ›{' '}
              <span>{entidade.metadata.name}</span>
            </nav>
            <span className={classes.eyebrow}>
              {ROTULO_TIPO[entidade.kind] ?? entidade.kind}
            </span>
            <h1 className={classes.title}>
              {entidade.metadata.title ?? entidade.metadata.name}
            </h1>
            {entidade.metadata.description && (
              <p className={classes.subtitle}>
                {entidade.metadata.description}
              </p>
            )}
          </div>
          <div className={classes.acoes}>
            <button
              type="button"
              className={`${classes.button} ${
                favorita ? classes.toggleAtivo : ''
              }`}
              aria-pressed={favorita}
              onClick={() => toggleStarredEntity(ref)}
            >
              {favorita ? '★ Favorito' : '☆ Favoritar'}
            </button>
            <Link to={de.para} className={classes.button}>
              Voltar para {de.rotulo === 'APIs' ? 'as APIs' : 'o catálogo'}
            </Link>
          </div>
        </div>
        <div className={classes.colunas}>
          <div className={classes.pilha}>
            <EntityAbout
              entidade={entidade}
              fornecedores={value?.relacionadas.fornecedores ?? []}
            />
            {temDocs && <EntityDocs ref={docsRef} entidade={entidade} />}
          </div>
          <div className={classes.pilha}>
            {value && (
              <EntityRelations
                entidade={entidade}
                relacionadas={value.relacionadas}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>{conteudo}</div>
      </Content>
    </Page>
  );
}
