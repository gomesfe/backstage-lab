import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useStyles } from './styles';
import type { Etapa } from './types';

type Props = {
  etapa: Etapa;
  numero: number;
  total: number;
  feita: boolean;
  onAlternar: () => void;
  onAnterior: () => void;
  /** Conclui a etapa e abre a próxima (ou fecha, na última). */
  onConcluirESeguir: () => void;
  onClose: () => void;
};

/** O texto completo de uma etapa, com marcar como concluída e seguir. */
export function StepDialog({
  etapa,
  numero,
  total,
  feita,
  onAlternar,
  onAnterior,
  onConcluirESeguir,
  onClose,
}: Props) {
  const classes = useStyles();
  const ultima = numero === total;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: classes.dialogPaper }}
    >
      <div className={classes.dialogHead}>
        <span className={classes.dialogEyebrow}>
          Etapa {numero} de {total}
        </span>
        <h3 className={classes.dialogTitle}>
          {numero}. {etapa.titulo}
        </h3>
      </div>
      <DialogContent>
        <div className={classes.prosa}>
          <p>{etapa.resumo}</p>
          {etapa.conteudo?.map(bloco => (
            <section key={bloco.titulo}>
              <h4>{bloco.titulo}</h4>
              {bloco.paragrafos?.map(paragrafo => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
              {bloco.itens && (
                <ul>
                  {bloco.itens.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {numero > 1 ? (
          <button type="button" className={classes.button} onClick={onAnterior}>
            ‹ Etapa anterior
          </button>
        ) : (
          <span />
        )}
        <span className={classes.dialogButtons}>
          <button type="button" className={classes.button} onClick={onAlternar}>
            {feita ? 'Desmarcar' : 'Marcar como concluída'}
          </button>
          <button
            type="button"
            className={classes.buttonPrimary}
            onClick={onConcluirESeguir}
          >
            {ultima ? 'Concluir trilha' : 'Concluir e seguir'}
          </button>
        </span>
      </DialogActions>
    </Dialog>
  );
}
