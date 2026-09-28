import { useState, type ReactNode } from 'react';
import Modal from '@material-ui/core/Modal';
import { useTheme } from '@material-ui/core/styles';
import { Alert, Field } from '@internal/plugin-components';
import type { CreatedApiKey } from '../../api/ApiKeysClient';

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
  onCreate: (input: { description: string; ttlSeconds: number | null }) => Promise<CreatedApiKey>;
};

/**
 * Modal do design system (`atlas-modal*`) sobre o `Modal` do MUI.
 *
 * O MUI fica só com o que é difícil de acertar à mão — foco preso dentro do
 * modal, Esc fecha, foco volta ao botão que abriu. O visual é todo do DS.
 *
 * O modal é renderizado num portal, fora do `.atlas-root` da página, então
 * ele abre o próprio `.atlas-root` com o tema ativo; sem isso as variáveis
 * de cor não existem ali dentro.
 */
function AtlasModal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Modal open={open} onClose={onClose} hideBackdrop aria-labelledby="atlas-modal-title">
      <div
        className="atlas-root atlas-modalBackdrop"
        data-theme={theme.palette.type === 'light' ? 'light' : 'dark'}
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        onMouseDown={e => e.target === e.currentTarget && onClose()}
        tabIndex={-1}
      >
        <div className="atlas-modalContentBox" role="dialog" aria-modal="true">
          <div className="atlas-modalHeader">
            <h3 id="atlas-modal-title">{title}</h3>
            <button type="button" className="atlas-modalCloseBtn" aria-label="Fechar" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="atlas-modalBody">{children}</div>
          <div className="atlas-modalFooter">{footer}</div>
        </div>
      </div>
    </Modal>
  );
}

export function CreateKeyDialog({ open, onClose, onCreate }: Props) {
  const [description, setDescription] = useState('');
  const [ttlIndex, setTtlIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [created, setCreated] = useState<CreatedApiKey | undefined>();
  const [copied, setCopied] = useState(false);

  const close = () => {
    setDescription('');
    setTtlIndex(1);
    setError(undefined);
    setCreated(undefined);
    setCopied(false);
    setBusy(false);
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setCreated(await onCreate({ description: description.trim(), ttlSeconds: TTL_OPTIONS[ttlIndex].value }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.secret);
      setCopied(true);
    } catch {
      // Sem permissão de área de transferência: o campo segue selecionável.
    }
  };

  // Depois de criada, a tela vira o único lugar onde o segredo existe.
  if (created) {
    return (
      <AtlasModal
        open={open}
        onClose={close}
        title="Chave criada"
        footer={
          <button type="button" className="atlas-btnPill atlas-btnPillLime" onClick={close}>
            Já copiei
          </button>
        }
      >
        <Alert variant="warning" title="Copie agora">
          O segredo não é guardado em lugar nenhum. Fechando esta janela ele desaparece e será
          preciso emitir outra chave.
        </Alert>
        <div className="atlas-secretReveal">
          <span style={{ flex: 1 }}>{created.secret}</span>
          <button type="button" className="atlas-btnPill" onClick={copy}>
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </AtlasModal>
    );
  }

  const canSubmit = !busy && description.trim() !== '';

  return (
    <AtlasModal
      open={open}
      onClose={close}
      title="Nova API key"
      footer={
        <>
          <button type="button" className="atlas-btnPill" onClick={close} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="atlas-btnPill atlas-btnPillLime" onClick={submit} disabled={!canSubmit}>
            {busy ? 'Criando…' : 'Criar chave'}
          </button>
        </>
      }
    >
      <Field label="Para que serve" hint="Só para você reconhecer a chave depois. Ex.: pipeline de deploy do checkout.">
        <input
          className={`atlas-input ${error ? 'atlas-inputError' : ''}`}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
        />
      </Field>
      <Field label="Expira em" hint="Prefira o prazo mais curto que a automação aguenta.">
        <select className="atlas-select" value={ttlIndex} onChange={e => setTtlIndex(Number(e.target.value))}>
          {TTL_OPTIONS.map((option, index) => (
            <option key={option.label} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {error && <Alert variant="danger" title="Não foi possível criar">{error}</Alert>}
    </AtlasModal>
  );
}
