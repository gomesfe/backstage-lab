import { useStyles } from './styles';
import type { Servico, SituacaoServico } from './types';

/** Ponto de cor da situação: verde, âmbar ou vermelho. */
export function PontoSituacao({ situacao }: { situacao: SituacaoServico }) {
  const classes = useStyles();
  const porSituacao: Record<SituacaoServico, string> = {
    operacional: classes.pontoVerde,
    degradado: classes.pontoAmbar,
    'fora do ar': classes.pontoVermelho,
  };
  return <span className={porSituacao[situacao]} aria-hidden />;
}

/** Um serviço por linha: situação, para que serve, disponibilidade em 30 dias. */
export function ServicesList({ servicos }: { servicos: Servico[] }) {
  const classes = useStyles();
  const selo: Record<SituacaoServico, string> = {
    operacional: classes.badgeLime,
    degradado: classes.badgeWarn,
    'fora do ar': classes.badgeDanger,
  };

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <h3 className={classes.toolbarTitle}>Serviços</h3>
        <span className={classes.metricSub}>disponibilidade 30 dias</span>
      </div>
      <div className={classes.lista}>
        {servicos.map(servico => (
          <div key={servico.chave} className={classes.servico}>
            <PontoSituacao situacao={servico.situacao} />
            <span>
              <span className={classes.servicoNome}>{servico.nome}</span>
              <span className={classes.servicoMeta}>
                {servico.chave} · {servico.descricao}
              </span>
            </span>
            <span className={classes.numero}>{servico.disponibilidade}</span>
            <span className={selo[servico.situacao]}>{servico.situacao}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
