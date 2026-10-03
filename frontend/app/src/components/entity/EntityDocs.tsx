import { forwardRef } from 'react';
import type { Entity } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import { nomeCurto } from './helpers';
import { useStyles } from './styles';

/**
 * Documentação de quem publica TechDocs: visão geral, como rodar e runbook,
 * com "Ver em Docs". É para onde os itens de Docs apontam (`#…-docs`).
 */
export const EntityDocs = forwardRef<HTMLElement, { entidade: Entity }>(
  function DocumentacaoDaEntidade({ entidade }, ref) {
    const classes = useStyles();
    const dono = nomeCurto((entidade.spec as { owner?: string })?.owner);

    return (
      <section className={classes.card} ref={ref}>
        <div className={classes.toolbar}>
          <h3 className={classes.toolbarTitle}>Documentação</h3>
          <Link
            to={`/docs?q=${encodeURIComponent(entidade.metadata.name)}`}
            className={classes.button}
          >
            Ver em Docs
          </Link>
        </div>
        <div className={classes.prosa}>
          <h4>Visão geral</h4>
          <p>
            {entidade.metadata.description}{' '}
            {dono && `Mantido pelo squad ${dono}.`}
          </p>
          <h4>Como rodar localmente</h4>
          <ul>
            <li>
              Clone o repositório e rode <code>make dev</code>.
            </li>
            <li>
              As variáveis ficam no <code>.env.example</code>.
            </li>
          </ul>
          <h4>Runbook</h4>
          <p>
            Alertas vão para o canal do squad. Em incidente, peça acesso em{' '}
            <Link to="/break-glass">Break Glass</Link>.
          </p>
        </div>
      </section>
    );
  },
);
