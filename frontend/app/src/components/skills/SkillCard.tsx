import Avatar from '@material-ui/core/Avatar';
import { iniciais, linkDaSkill, matizDoNome, ORDEM_AMBIENTES } from './helpers';
import { useStyles } from './styles';
import type { AmbienteSkill, Skill } from './types';

/** Marcador de ambiente: release em verde, hml em âmbar, dev em azul. */
export function MarcadorAmbiente({ ambiente }: { ambiente: AmbienteSkill }) {
  const classes = useStyles();
  const porAmbiente: Record<AmbienteSkill, string> = { release: classes.envRelease, hml: classes.envHml, dev: classes.envDev };
  return <span className={porAmbiente[ambiente]}>{ambiente}</span>;
}

/** Cartão de uma skill. O cartão inteiro abre o SKILL.md no GitHub. */
export function SkillCard({ skill }: { skill: Skill }) {
  const classes = useStyles();
  const matiz = matizDoNome(skill.nome);
  const ambientes = ORDEM_AMBIENTES.filter(ambiente => skill.ambientes.includes(ambiente));

  return (
    <a className={classes.card} href={linkDaSkill(skill)} target="_blank" rel="noopener noreferrer" title="Abrir o SKILL.md no GitHub">
      <div className={classes.cardHead}>
        <Avatar variant="rounded" className={classes.icon} style={{ background: `hsla(${matiz}, 70%, 55%, 0.18)`, color: `hsl(${matiz}, 70%, 60%)` }}>
          {iniciais(skill.nome)}
        </Avatar>
        <div>
          <div className={classes.cardTitle}>{skill.nome}</div>
          <div className={classes.chipRow}>
            {ambientes.map(ambiente => (
              <MarcadorAmbiente key={ambiente} ambiente={ambiente} />
            ))}
          </div>
        </div>
      </div>
      <div className={classes.desc}>{skill.descricao}</div>
      <div className={classes.chipRow}>
        <span className={classes.tag}>{skill.slug}</span>
        <span className={classes.muted}>
          {ambientes.length} {ambientes.length === 1 ? 'ambiente' : 'ambientes'}
        </span>
      </div>
      <div className={classes.meta}>
        <span>
          Autor: <strong>{skill.autor}</strong>
        </span>
        <span>Última atualização: {skill.atualizadoEm}</span>
      </div>
      <div>
        <span className={classes.pill}>GitHub ↗</span>
      </div>
    </a>
  );
}
