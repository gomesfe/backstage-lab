import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import type { CreatedApiKey } from '../api/ApiKeysClient';

const TTL_OPTIONS: { label: string; value: number | null }[] = [
  { label: '7 dias', value: 7 * 24 * 60 * 60 },
  { label: '30 dias', value: 30 * 24 * 60 * 60 },
  { label: '90 dias', value: 90 * 24 * 60 * 60 },
  { label: '1 ano', value: 365 * 24 * 60 * 60 },
  { label: 'Sem expiração', value: null },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: {
    description: string;
    ttlSeconds: number | null;
  }) => Promise<CreatedApiKey>;
};

export function CreateKeyDialog({ open, onClose, onCreate }: Props) {
  const [description, setDescription] = useState('');
  const [ttlIndex, setTtlIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [created, setCreated] = useState<CreatedApiKey | undefined>();

  const reset = () => {
    setDescription('');
    setTtlIndex(1);
    setError(undefined);
    setCreated(undefined);
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setCreated(
        await onCreate({
          description,
          ttlSeconds: TTL_OPTIONS[ttlIndex].value,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  // Depois de criada, a tela vira o único lugar onde o segredo existe.
  if (created) {
    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>Chave criada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copie agora. O segredo não é guardado em lugar nenhum — fechando
            esta janela ele desaparece e você precisará emitir outra chave.
          </DialogContentText>
          <TextField
            value={created.secret}
            fullWidth
            multiline
            variant="outlined"
            label="Segredo"
            InputProps={{ readOnly: true }}
            onFocus={event => event.target.select()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary" variant="contained">
            Já copiei
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Nova API key</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Para que serve"
          placeholder="ex: pipeline de deploy do checkout"
          value={description}
          onChange={event => setDescription(event.target.value)}
          error={Boolean(error)}
          helperText={error}
        />
        <TextField
          select
          fullWidth
          margin="dense"
          label="Expira em"
          value={ttlIndex}
          onChange={event => setTtlIndex(Number(event.target.value))}
        >
          {TTL_OPTIONS.map((option, index) => (
            <MenuItem key={option.label} value={index}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={busy}>
          Cancelar
        </Button>
        <Button
          onClick={submit}
          color="primary"
          variant="contained"
          disabled={busy || description.trim() === ''}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
