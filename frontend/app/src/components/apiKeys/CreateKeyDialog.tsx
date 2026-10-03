import { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import type { ChaveCriada } from './api';
import { PRAZO_PADRAO, PRAZOS } from './helpers';
import { useStyles } from './styles';

type Props = {
  open: boolean;
  onClose: () => void;
  onCriar: (dados: {
    description: string;
    ttlSeconds: number | null;
  }) => Promise<ChaveCriada>;
};

/** "Nova API key". Depois de criada, mostra o segredo uma única vez. */
export function CreateKeyDialog({ open, onClose, onCriar }: Props) {
  const classes = useStyles();
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState(PRAZO_PADRAO);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [criada, setCriada] = useState<ChaveCriada>();
  const [copiado, setCopiado] = useState(false);

  const fechar = () => {
    setDescricao('');
    setPrazo(PRAZO_PADRAO);
    setErro(undefined);
    setCriada(undefined);
    setCopiado(false);
    setCriando(false);
    onClose();
  };

  const podeCriar = !criando && descricao.trim() !== '';

  const criar = async () => {
    if (!podeCriar) return;
    setCriando(true);
    setErro(undefined);
    try {
      setCriada(
        await onCriar({
          description: descricao.trim(),
          ttlSeconds: PRAZOS[prazo].segundos,
        }),
      );
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha));
    } finally {
      setCriando(false);
    }
  };

  const copiar = async () => {
    if (!criada) return;
    try {
      await navigator.clipboard.writeText(criada.secret);
      setCopiado(true);
    } catch {
      // Sem permissão de área de transferência: o texto segue selecionável.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={fechar}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: classes.dialogPaper }}
    >
      <div className={classes.dialogHead}>
        <span className={classes.dialogEyebrow}>API Keys</span>
        <h3 className={classes.dialogTitle}>
          {criada ? 'Chave criada' : 'Nova API key'}
        </h3>
      </div>
      <DialogContent>
        {criada ? (
          <>
            <div
              className={`${classes.alert} ${classes.alertWarn}`}
              style={{ marginTop: 0 }}
            >
              <strong className={classes.alertTitle}>Copie agora</strong>O
              segredo não é guardado em lugar nenhum. Fechando esta janela ele
              desaparece e será preciso emitir outra chave.
            </div>
            <div className={classes.segredo}>
              <span className={classes.segredoTexto}>{criada.secret}</span>
              <button type="button" className={classes.button} onClick={copiar}>
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <label className={classes.field} style={{ marginTop: 0 }}>
              <span className={classes.fieldLabel}>Para que serve</span>
              <input
                className={classes.input}
                value={descricao}
                aria-invalid={Boolean(erro)}
                onChange={evento => setDescricao(evento.target.value)}
                onKeyDown={evento => evento.key === 'Enter' && criar()}
              />
              <span className={classes.fieldHint}>
                Só para você reconhecer a chave depois. Ex.: pipeline de deploy
                do checkout.
              </span>
            </label>
            <label className={classes.field}>
              <span className={classes.fieldLabel}>Expira em</span>
              <select
                className={classes.input}
                value={prazo}
                onChange={evento => setPrazo(Number(evento.target.value))}
              >
                {PRAZOS.map((opcao, indice) => (
                  <option key={opcao.rotulo} value={indice}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
              <span className={classes.fieldHint}>
                Prefira o prazo mais curto que a automação aguenta.
              </span>
            </label>
            {erro && (
              <div className={`${classes.alert} ${classes.alertDanger}`}>
                <strong className={classes.alertTitle}>
                  Não foi possível criar
                </strong>
                {erro}
              </div>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions
        className={classes.dialogActions}
        style={{ justifyContent: 'flex-end' }}
      >
        {criada ? (
          <button
            type="button"
            className={classes.buttonPrimary}
            onClick={fechar}
          >
            Já copiei
          </button>
        ) : (
          <span className={classes.dialogButtons}>
            <button
              type="button"
              className={classes.button}
              onClick={fechar}
              disabled={criando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={classes.buttonPrimary}
              onClick={criar}
              disabled={!podeCriar}
            >
              {criando ? 'Criando…' : 'Criar chave'}
            </button>
          </span>
        )}
      </DialogActions>
    </Dialog>
  );
}
