import { useEffect, useState, type ReactNode } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Link } from '@backstage/core-components';
import { SeloAmbiente } from '../shared/SeloAmbiente';
import { haQuanto, MOTIVO_MINIMO, podeAprovar, podeCancelar, ROTULO_STATUS, situacao, textoAprovacoes, type Tom } from './helpers';
import { StatusBadge } from './StatusBadge';
import { linkDoMapa } from './Table';
import { useStyles } from './styles';
import type { Dialogo, EstadoEtapa, Solicitacao, SituacaoAprovador } from './types';

type Props = {
  dialogo: Dialogo | null;
  onClose: () => void;
  /** Troca o diálogo atual por outro (ex.: Detalhes → Aprovar). */
  onOpen: (dialogo: Dialogo) => void;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string, motivo: string) => void;
  onCancelar: (id: string, motivo: string) => void;
};

function Cabecalho({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children?: ReactNode }) {
  const classes = useStyles();
  return (
    <div className={classes.dialogHead}>
      <span className={classes.dialogEyebrow}>{eyebrow}</span>
      <h3 className={classes.dialogTitle}>{titulo}</h3>
      {children && <div className={classes.chips}>{children}</div>}
    </div>
  );
}

/** Os campos do pedido, só leitura: o resumo antes de aprovar, rejeitar ou cancelar. */
function Resumo({ solicitacao }: { solicitacao: Solicitacao }) {
  const classes = useStyles();
  const aprovacoes = solicitacao.aprovacoes.por.length
    ? `${textoAprovacoes(solicitacao)} (${solicitacao.aprovacoes.por.join(', ')})`
    : textoAprovacoes(solicitacao);
  const campos: [string, string][] = [
    ['Recurso', solicitacao.recurso],
    ['Oferta', solicitacao.oferta],
    ['Ambiente', solicitacao.ambiente],
    ['Grupo', solicitacao.grupo],
    ['Dono', solicitacao.dono],
    ['Solicitante', solicitacao.solicitante],
    ['Solicitado em', solicitacao.data],
    ['Aprovações', aprovacoes],
  ];
  return (
    <>
      <div className={classes.readonly}>
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <span className={classes.fieldLabel}>{rotulo}</span>
            <span className={classes.readonlyValue}>{valor}</span>
          </div>
        ))}
      </div>
      <div className={classes.field}>
        <span className={classes.fieldLabel}>Justificativa</span>
        <span className={classes.readonlyValue}>{solicitacao.justificativa}</span>
      </div>
    </>
  );
}

function SeloAprovador({ situacao: valor }: { situacao: SituacaoAprovador }) {
  const classes = useStyles();
  const porSituacao: Record<SituacaoAprovador, string> = {
    aprovou: classes.badgeLime,
    pendente: classes.badgeWarn,
    rejeitou: classes.badgeDanger,
    'sem resposta': classes.badge,
  };
  return <span className={porSituacao[valor]}>{valor}</span>;
}

function Andamento({ solicitacao }: { solicitacao: Solicitacao }) {
  const classes = useStyles();
  const ponto: Record<EstadoEtapa, { classe: string; marca: string }> = {
    feito: { classe: classes.dotFeito, marca: '✓' },
    agora: { classe: classes.dotAgora, marca: '' },
    falhou: { classe: classes.dotFalhou, marca: '!' },
    cancelado: { classe: classes.dotCancelado, marca: '×' },
    pendente: { classe: classes.dot, marca: '' },
  };
  return (
    <ol className={classes.timeline}>
      {solicitacao.andamento.map(etapa => (
        <li key={etapa.titulo} className={classes.step}>
          <span className={ponto[etapa.estado].classe} aria-hidden>
            {ponto[etapa.estado].marca}
          </span>
          <div className={`${classes.stepTitle} ${etapa.estado === 'pendente' ? classes.stepTitlePendente : ''}`}>{etapa.titulo}</div>
          {etapa.nota && <div className={classes.stepNote}>{etapa.nota}</div>}
        </li>
      ))}
    </ol>
  );
}

function Detalhes({ solicitacao }: { solicitacao: Solicitacao }) {
  const classes = useStyles();
  const { tom, titulo, texto } = situacao(solicitacao);
  const faixa: Record<Tom, string> = {
    warning: classes.heroWarn,
    info: classes.heroInfo,
    lime: '',
    danger: classes.heroDanger,
    purple: classes.heroNeutral,
    neutral: classes.heroNeutral,
  };
  const { feitas, total } = solicitacao.aprovacoes;
  const aberta = solicitacao.status === 'aguardando' || solicitacao.status === 'execucao';

  return (
    <div className={classes.stack}>
      <div className={`${classes.hero} ${faixa[tom]}`} style={{ marginBottom: 0 }}>
        <strong className={classes.heroTitle}>{titulo}</strong>
        <span className={classes.heroSub}>{texto}</span>
        {solicitacao.status === 'aguardando' && (
          <>
            <div className={classes.progressLabel}>
              <span>Aprovações</span>
              <span>{textoAprovacoes(solicitacao)}</span>
            </div>
            <div
              className={classes.progress}
              role="progressbar"
              aria-label="Aprovações"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={feitas}
            >
              <div className={classes.progressBar} style={{ width: `${total ? (feitas / total) * 100 : 0}%` }} />
            </div>
          </>
        )}
      </div>

      <div className={classes.blocks}>
        <div className={classes.block}>
          <h4 className={classes.blockTitle}>Recurso</h4>
          <dl className={classes.dl}>
            <dt>Nome</dt>
            <dd>{solicitacao.recurso}</dd>
            <dt>Tipo</dt>
            <dd>{solicitacao.oferta}</dd>
            <dt>Grupo dono</dt>
            <dd>{solicitacao.grupo}</dd>
            <dt>Dono</dt>
            <dd>{solicitacao.dono}</dd>
            <dt>Ambiente</dt>
            <dd>{solicitacao.ambiente}</dd>
          </dl>
        </div>
        <div className={classes.block}>
          <h4 className={classes.blockTitle}>Solicitação</h4>
          <dl className={classes.dl}>
            <dt>Solicitante</dt>
            <dd>{solicitacao.solicitante}</dd>
            <dt>Time</dt>
            <dd>{solicitacao.time}</dd>
            <dt>Solicitada em</dt>
            <dd>{solicitacao.data}</dd>
            <dt>{aberta ? 'Aberta' : 'Situação'}</dt>
            <dd>{aberta ? haQuanto(solicitacao.data) : ROTULO_STATUS[solicitacao.status]}</dd>
          </dl>
        </div>
      </div>

      <div className={classes.block}>
        <h4 className={classes.blockTitle}>Grupos aprovadores</h4>
        <div className={classes.approvers}>
          {solicitacao.aprovadores.map(grupo => (
            <div key={grupo.nome} className={classes.approver}>
              <div>
                <div className={classes.approverName}>{grupo.nome}</div>
                <div className={classes.approverNote}>{grupo.nota}</div>
              </div>
              <SeloAprovador situacao={grupo.situacao} />
            </div>
          ))}
        </div>
      </div>

      <blockquote className={classes.quote}>
        <strong>Justificativa</strong>
        {solicitacao.justificativa}
      </blockquote>

      <div className={classes.block}>
        <h4 className={classes.blockTitle}>Andamento</h4>
        <Andamento solicitacao={solicitacao} />
      </div>
    </div>
  );
}

/** Todos os diálogos de Aprovações; abre o que estiver em `dialogo`. */
export function Dialogs({ dialogo, onClose, onOpen, onAprovar, onRejeitar, onCancelar }: Props) {
  const classes = useStyles();
  const [motivo, setMotivo] = useState('');
  const [tentou, setTentou] = useState(false);

  // Cada diálogo começa com o motivo em branco.
  useEffect(() => {
    setMotivo('');
    setTentou(false);
  }, [dialogo]);

  if (!dialogo) return null;
  const { solicitacao } = dialogo;
  let largo = false;
  let conteudo: ReactNode = null;

  if (dialogo.tipo === 'aprovar') {
    conteudo = (
      <>
        <Cabecalho eyebrow="Aprovações" titulo="Aprovar solicitação" />
        <DialogContent>
          <Resumo solicitacao={solicitacao} />
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Voltar
            </button>
            <button
              type="button"
              className={classes.buttonPrimary}
              onClick={() => {
                onAprovar(solicitacao.id);
                onClose();
              }}
            >
              Aprovar
            </button>
          </span>
        </DialogActions>
      </>
    );
  } else if (dialogo.tipo === 'rejeitar' || dialogo.tipo === 'cancelar') {
    const rejeitando = dialogo.tipo === 'rejeitar';
    const curto = rejeitando && motivo.trim().length < MOTIVO_MINIMO;
    const confirmar = () => {
      setTentou(true);
      if (curto) return;
      if (rejeitando) onRejeitar(solicitacao.id, motivo.trim());
      else onCancelar(solicitacao.id, motivo.trim());
      onClose();
    };
    conteudo = (
      <>
        <Cabecalho eyebrow="Aprovações" titulo={rejeitando ? 'Rejeitar solicitação' : 'Cancelar solicitação'} />
        <DialogContent>
          <Resumo solicitacao={solicitacao} />
          <label className={classes.field}>
            <span className={classes.fieldLabel}>{rejeitando ? 'Motivo da rejeição' : 'Motivo (opcional)'}</span>
            <textarea className={classes.textarea} value={motivo} onChange={event => setMotivo(event.target.value)} />
            {tentou && curto ? (
              <span className={classes.erro}>Escreva o motivo, com pelo menos {MOTIVO_MINIMO} caracteres.</span>
            ) : (
              <span className={classes.fieldHint}>
                {rejeitando ? `Vai para quem pediu. Mínimo de ${MOTIVO_MINIMO} caracteres.` : 'Fica registrado no andamento da solicitação.'}
              </span>
            )}
          </label>
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Voltar
            </button>
            <button type="button" className={classes.buttonDanger} onClick={confirmar}>
              {rejeitando ? 'Rejeitar' : 'Cancelar solicitação'}
            </button>
          </span>
        </DialogActions>
      </>
    );
  } else {
    largo = true;
    conteudo = (
      <>
        <Cabecalho eyebrow="Detalhes da solicitação" titulo={solicitacao.recurso}>
          <span className={classes.badgePurple}>Deleção</span>
          ambiente <SeloAmbiente ambiente={solicitacao.ambiente} /> · {solicitacao.oferta} ·{' '}
          <span className={solicitacao.excluido ? classes.badgeLime : classes.badge}>{solicitacao.excluido ? 'excluído' : 'não excluído'}</span>
          <StatusBadge status={solicitacao.status} />
        </Cabecalho>
        <DialogContent>
          <Detalhes solicitacao={solicitacao} />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          {solicitacao.noMapa && !solicitacao.excluido ? (
            <Link to={linkDoMapa(solicitacao)} className={classes.link}>
              Ver no mapa de provisionamento ↗
            </Link>
          ) : (
            <span />
          )}
          <span className={classes.dialogButtons}>
            {podeAprovar(solicitacao) && (
              <button type="button" className={classes.buttonDanger} onClick={() => onOpen({ tipo: 'rejeitar', solicitacao })}>
                Rejeitar
              </button>
            )}
            {podeCancelar(solicitacao) && (
              <button type="button" className={classes.buttonDanger} onClick={() => onOpen({ tipo: 'cancelar', solicitacao })}>
                Cancelar solicitação
              </button>
            )}
            <button type="button" className={classes.button} onClick={onClose}>
              Fechar
            </button>
            {podeAprovar(solicitacao) && (
              <button type="button" className={classes.buttonPrimary} onClick={() => onOpen({ tipo: 'aprovar', solicitacao })}>
                Aprovar
              </button>
            )}
          </span>
        </DialogActions>
      </>
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth={largo ? 'md' : 'sm'} fullWidth PaperProps={{ className: classes.dialogPaper }}>
      {conteudo}
    </Dialog>
  );
}
