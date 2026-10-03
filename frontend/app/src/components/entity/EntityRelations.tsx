import type { ReactNode } from 'react';
import type { Entity } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import type { Relacionadas } from './hooks/useEntidade';
import { linkPara, rotuloDoTipo } from './helpers';
import { useStyles } from './styles';

function ListaDeEntidades({
  titulo,
  entidades,
  vazio,
  acao,
}: {
  titulo: string;
  entidades: Entity[];
  vazio: string;
  acao?: ReactNode;
}) {
  const classes = useStyles();
  return (
    <section className={classes.card}>
      <div className={classes.toolbar}>
        <h3 className={classes.toolbarTitle}>{titulo}</h3>
        {acao}
      </div>
      {entidades.length === 0 ? (
        <span className={classes.metricSub}>{vazio}</span>
      ) : (
        <div className={classes.lista}>
          {entidades.map(entidade => (
            <Link
              key={`${entidade.kind}-${entidade.metadata.name}`}
              to={linkPara(entidade)}
              className={classes.item}
            >
              <span>
                <span className={classes.itemNome}>
                  {entidade.metadata.title ?? entidade.metadata.name}
                </span>
                <span className={classes.itemMeta}>
                  {rotuloDoTipo(entidade)}
                </span>
              </span>
              <span aria-hidden>↗</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Coluna da direita: as relações que fazem sentido para cada tipo. */
export function EntityRelations({
  entidade,
  relacionadas,
}: {
  entidade: Entity;
  relacionadas: Relacionadas;
}) {
  const classes = useStyles();

  switch (entidade.kind) {
    case 'Component':
      return (
        <>
          <ListaDeEntidades
            titulo="APIs fornecidas"
            entidades={relacionadas.apis}
            vazio="Não fornece APIs registradas."
          />
          <ListaDeEntidades
            titulo="No mesmo sistema"
            entidades={relacionadas.doSistema}
            vazio="Sem outras entidades no sistema."
          />
        </>
      );
    case 'System':
      return (
        <ListaDeEntidades
          titulo={`Partes do sistema (${relacionadas.doSistema.length})`}
          entidades={relacionadas.doSistema}
          vazio="Nada registrado no sistema."
        />
      );
    case 'Group':
      return (
        <>
          <ListaDeEntidades
            titulo="Membros"
            entidades={relacionadas.membros}
            vazio="Nenhum membro cadastrado no catálogo."
          />
          <ListaDeEntidades
            titulo={`Itens mantidos (${relacionadas.mantidos.length})`}
            entidades={relacionadas.mantidos}
            vazio="O squad ainda não mantém itens no catálogo."
            acao={
              <Link
                to={`/catalog?owner=${encodeURIComponent(
                  entidade.metadata.name,
                )}`}
                className={classes.button}
              >
                Abrir no catálogo
              </Link>
            }
          />
        </>
      );
    case 'API': {
      const definicao = (entidade.spec as { definition?: string })?.definition;
      return (
        <section className={classes.card}>
          <h3 className={classes.toolbarTitle}>Definição</h3>
          {definicao ? (
            <pre className={classes.definicao}>{definicao}</pre>
          ) : (
            <span className={classes.metricSub}>Sem definição registrada.</span>
          )}
        </section>
      );
    }
    case 'Resource':
      return (
        <section className={classes.card}>
          <h3 className={classes.toolbarTitle}>Provisionamento</h3>
          <p className={classes.texto}>
            Criado por uma oferta do Atlas. Ambientes, promoção e exclusão ficam
            no{' '}
            <Link
              to={`/provisioning-map?q=${encodeURIComponent(
                entidade.metadata.name,
              )}`}
            >
              Mapa de provisionamento
            </Link>
            ; os pedidos dele estão em{' '}
            <Link
              to={`/approvals?q=${encodeURIComponent(
                entidade.metadata.name,
              )}&status=all`}
            >
              Aprovações
            </Link>
            .
          </p>
        </section>
      );
    default:
      return null;
  }
}
