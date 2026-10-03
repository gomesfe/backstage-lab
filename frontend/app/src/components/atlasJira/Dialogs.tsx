import type { ReactNode } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useStyles } from './styles';
import type { Dialogo, Rascunho } from './types';

type Props = {
  dialogo: Dialogo | null;
  onClose: () => void;
  onOpen: (dialogo: Dialogo) => void;
  onCriarCard: (rascunho: Rascunho) => void;
  onDescartar: (rascunho: Rascunho) => void;
};

function Campos({ campos }: { campos: [string, string][] }) {
  const classes = useStyles();
  return (
    <div className={classes.leitura}>
      {campos.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <span className={classes.fieldLabel}>{rotulo}</span>
          <span className={classes.valor}>{valor}</span>
        </div>
      ))}
    </div>
  );
}

function ResumoRascunho({ rascunho }: { rascunho: Rascunho }) {
  const classes = useStyles();
  return (
    <>
      <Campos
        campos={[
          ['Origem', rascunho.origem],
          ['Solicitante da execução', rascunho.solicitante],
          ['Tipo', rascunho.tipo],
          ['Importado em', rascunho.importadoEm],
        ]}
      />
      <div className={classes.field}>
        <span className={classes.fieldLabel}>Descrição da issue</span>
        <span className={classes.valor}>{rascunho.descricao}</span>
      </div>
    </>
  );
}

/** Ver rascunho, criar card, descartar e detalhes do card. */
export function Dialogs({
  dialogo,
  onClose,
  onOpen,
  onCriarCard,
  onDescartar,
}: Props) {
  const classes = useStyles();
  if (!dialogo) return null;

  let titulo = '';
  let corpo: ReactNode = null;
  let botoes: ReactNode = null;

  if (dialogo.tipo === 'rascunho') {
    titulo = dialogo.rascunho.titulo;
    corpo = <ResumoRascunho rascunho={dialogo.rascunho} />;
    botoes = (
      <>
        <button type="button" className={classes.button} onClick={onClose}>
          Fechar
        </button>
        <button
          type="button"
          className={classes.buttonPrimary}
          onClick={() => onOpen({ tipo: 'criar', rascunho: dialogo.rascunho })}
        >
          Criar card
        </button>
      </>
    );
  } else if (dialogo.tipo === 'criar') {
    const { rascunho } = dialogo;
    titulo = 'Criar card no Jira';
    corpo = (
      <>
        <p className={classes.heroSub}>
          <strong>{rascunho.titulo}</strong>
        </p>
        <ResumoRascunho rascunho={rascunho} />
        <p className={classes.heroSub}>
          O card nasce em “A fazer”, sem responsável, com link para a issue de
          origem.
        </p>
      </>
    );
    botoes = (
      <>
        <button type="button" className={classes.button} onClick={onClose}>
          Voltar
        </button>
        <button
          type="button"
          className={classes.buttonPrimary}
          onClick={() => {
            onCriarCard(rascunho);
            onClose();
          }}
        >
          Criar card
        </button>
      </>
    );
  } else if (dialogo.tipo === 'descartar') {
    const { rascunho } = dialogo;
    titulo = 'Descartar rascunho';
    corpo = (
      <>
        <p className={classes.heroSub}>
          <strong>{rascunho.titulo}</strong>
        </p>
        <ResumoRascunho rascunho={rascunho} />
        <div className={`${classes.alert} ${classes.alertWarn}`}>
          <strong className={classes.alertTitle}>
            A issue continua no GitHub
          </strong>
          Descartar só tira o rascunho daqui. Se a issue for atualizada, ela
          volta na próxima sincronização.
        </div>
      </>
    );
    botoes = (
      <>
        <button type="button" className={classes.button} onClick={onClose}>
          Voltar
        </button>
        <button
          type="button"
          className={classes.buttonDanger}
          onClick={() => {
            onDescartar(rascunho);
            onClose();
          }}
        >
          Descartar
        </button>
      </>
    );
  } else {
    const { card } = dialogo;
    titulo = card.chave;
    corpo = (
      <Campos
        campos={[
          ['Título', card.titulo],
          ['Tipo', card.tipo],
          ['Status', card.status],
          ['Responsável', card.responsavel],
          ['Origem', card.origem],
          ['Criado em', card.criadoEm],
        ]}
      />
    );
    botoes = (
      <button type="button" className={classes.button} onClick={onClose}>
        Fechar
      </button>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={dialogo.tipo === 'rascunho' ? 'md' : 'sm'}
      fullWidth
      PaperProps={{ className: classes.dialogPaper }}
    >
      <div className={classes.dialogHead}>
        <span className={classes.dialogEyebrow}>Atlas × Jira</span>
        <h3 className={classes.dialogTitle}>{titulo}</h3>
      </div>
      <DialogContent>{corpo}</DialogContent>
      <DialogActions
        className={classes.dialogActions}
        style={{ justifyContent: 'flex-end' }}
      >
        <span className={classes.dialogButtons}>{botoes}</span>
      </DialogActions>
    </Dialog>
  );
}
