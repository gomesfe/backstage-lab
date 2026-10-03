import { useStyles } from './styles';
import type { FiltroStatus, Lado } from './types';

type Props = {
  lado: Lado;
  contagens: {
    pendentes: number;
    execucao: number;
    historico: number;
    concluidos: number;
  };
  filtroStatus: FiltroStatus;
  onFiltroStatus: (filtro: FiltroStatus) => void;
};

/** Título e os três números. Clicar num número filtra a tabela por ele. */
export function Header({
  lado,
  contagens,
  filtroStatus,
  onFiltroStatus,
}: Props) {
  const classes = useStyles();
  const numeros: {
    filtro: FiltroStatus;
    titulo: string;
    valor: number;
    sub: string;
  }[] = [
    {
      filtro: 'pendentes',
      titulo: 'Aguardando aprovação',
      valor: contagens.pendentes,
      sub:
        lado === 'aprovacao'
          ? 'esperando a sua decisão'
          : 'esperando aprovadores',
    },
    {
      filtro: 'execucao',
      titulo: 'Em execução',
      valor: contagens.execucao,
      sub: 'aprovadas, sendo provisionadas',
    },
    {
      filtro: 'historico',
      titulo: 'Concluídos',
      valor: contagens.concluidos,
      sub: `${contagens.historico} no histórico, com rejeitados e cancelados`,
    },
  ];

  return (
    <div className={classes.metrics}>
      {numeros.map(numero => (
        <button
          key={numero.filtro}
          type="button"
          className={`${classes.metric} ${classes.metricClicavel} ${
            filtroStatus === numero.filtro ? classes.metricAtivo : ''
          }`}
          aria-pressed={filtroStatus === numero.filtro}
          title={`Mostrar ${numero.titulo.toLowerCase()}`}
          onClick={() => onFiltroStatus(numero.filtro)}
        >
          <div className={classes.metricTitle}>{numero.titulo}</div>
          <div className={classes.metricValue}>{numero.valor}</div>
          <div className={classes.metricSub}>{numero.sub}</div>
        </button>
      ))}
    </div>
  );
}
