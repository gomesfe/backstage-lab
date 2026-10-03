import { Link } from '@backstage/core-components';
import { acaoDaTrilha, TOM_DIFICULDADE } from './helpers';
import { useStyles } from './styles';
import type { Dificuldade, Trilha } from './types';

/** Selo da dificuldade: Iniciante verde, Intermediário azul, Avançado roxo. */
export function SeloDificuldade({ dificuldade }: { dificuldade: Dificuldade }) {
  const classes = useStyles();
  const porTom = {
    lime: classes.badgeLime,
    info: classes.badgeInfo,
    purple: classes.badgePurple,
  };
  return (
    <span className={porTom[TOM_DIFICULDADE[dificuldade]]}>{dificuldade}</span>
  );
}

/** Barra "2 de 4" do progresso de uma trilha. */
export function BarraProgresso({
  feitas,
  total,
}: {
  feitas: number;
  total: number;
}) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.progressoRotulo}>
        <span>{feitas >= total ? 'Concluída' : 'Progresso'}</span>
        <span>
          {feitas} de {total}
        </span>
      </div>
      <div
        className={classes.progresso}
        role="progressbar"
        aria-label="Progresso"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={feitas}
      >
        <div
          className={classes.progressoBarra}
          style={{ width: `${total ? (feitas / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

/** Cartão de uma trilha na lista: dificuldade, texto, progresso e o botão. */
export function PathCard({
  trilha,
  feitas,
}: {
  trilha: Trilha;
  feitas: number;
}) {
  const classes = useStyles();
  const total = trilha.etapas.length;
  const acao = acaoDaTrilha(feitas, total);

  return (
    <article className={classes.cartao}>
      <div>
        <SeloDificuldade dificuldade={trilha.dificuldade} />
      </div>
      <div className={classes.cartaoTitulo}>{trilha.titulo}</div>
      <div className={classes.cartaoTexto}>{trilha.descricao}</div>
      <BarraProgresso feitas={feitas} total={total} />
      <div className={classes.rodape}>
        <span className={classes.tema}>{total} etapas</span>
        {trilha.temas.map(tema => (
          <span key={tema} className={classes.tema}>
            {tema}
          </span>
        ))}
        <Link
          to={`/learning-paths/${trilha.id}`}
          className={`${
            acao === 'Começar' ? classes.pillPrimary : classes.pill
          } ${classes.empurra}`}
        >
          {acao}
        </Link>
      </div>
    </article>
  );
}
