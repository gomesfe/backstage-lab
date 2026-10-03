import { Link } from '@backstage/core-components';
import { useApprovals } from '../approvals/hooks/useApprovals';
import { StatusBadge } from '../approvals/StatusBadge';
import { ATUALIZACOES, EM_BREVE, LINKS_UTEIS } from './data';
import { ultimasTransacoes } from './helpers';
import { useStyles } from './styles';

/** Últimas transações: as solicitações mais recentes, com o status. */
export function LatestTransactions() {
  const classes = useStyles();
  const { solicitacoes } = useApprovals();
  const ultimas = ultimasTransacoes(solicitacoes);

  return (
    <section className={`${classes.card} ${classes.painel}`}>
      <div className={classes.toolbar}>
        <h3 className={classes.toolbarTitle}>Últimas transações</h3>
        <Link to="/approvals" className={classes.button}>
          Ver todas
        </Link>
      </div>
      <div>
        {ultimas.map(solicitacao => (
          <Link
            key={solicitacao.id}
            to={`/approvals?q=${encodeURIComponent(
              solicitacao.recurso,
            )}&status=all${
              solicitacao.lado === 'solicitacao' ? '#requester' : ''
            }`}
            className={classes.transacao}
          >
            <span>
              <span className={classes.transacaoNome}>
                Deleção · {solicitacao.recurso}
              </span>
              <span className={classes.transacaoMeta}>
                {solicitacao.ambiente} · {solicitacao.data}
              </span>
            </span>
            <StatusBadge status={solicitacao.status} />
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Últimas atualizações do portal e das ofertas. */
export function LatestUpdates() {
  const classes = useStyles();
  return (
    <section className={`${classes.card} ${classes.painel}`}>
      <h3 className={classes.toolbarTitle}>Últimas atualizações</h3>
      <div className={classes.lista}>
        {ATUALIZACOES.map(atualizacao => (
          <div key={atualizacao.texto} className={classes.novidade}>
            <span className={classes.novidadeTexto}>{atualizacao.texto}</span>
            {atualizacao.link && (
              <Link to={atualizacao.link.para} className={classes.link}>
                {atualizacao.link.rotulo}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** O que vem por aí. */
export function ComingSoon() {
  const classes = useStyles();
  return (
    <section className={`${classes.card} ${classes.emBreve}`}>
      <h3 className={classes.toolbarTitle}>Em breve</h3>
      <div>
        {EM_BREVE.map(item => (
          <div key={item.nome} className={classes.emBreveItem}>
            <div>
              <div className={classes.emBreveNome}>{item.nome}</div>
              <div className={classes.emBreveTexto}>{item.descricao}</div>
            </div>
            <span className={classes.badgeInfo}>em breve</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Links úteis, numa linha. */
export function UsefulLinks() {
  const classes = useStyles();
  return (
    <nav className={classes.links} aria-label="Links úteis">
      <span className={classes.rotulo} style={{ marginRight: 6 }}>
        Links úteis
      </span>
      {LINKS_UTEIS.map(link => (
        <Link key={link.rotulo} to={link.para} className={classes.button}>
          {link.rotulo}
        </Link>
      ))}
    </nav>
  );
}
