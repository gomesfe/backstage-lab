import AddIcon from '@material-ui/icons/Add';
import ChatIcon from '@material-ui/icons/ChatBubbleOutline';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import type { Conversa } from './api';
import { quando } from './helpers';
import { useStyles } from './styles';

type Props = {
  conversas: Conversa[];
  carregando: boolean;
  ativaId: string | null;
  onNova: () => void;
  onAbrir: (id: string) => void;
  onApagar: (conversa: Conversa) => void;
};

/** Histórico: Nova conversa e as conversas da pessoa, da mais recente para a mais antiga. */
export function ConversationList({
  conversas,
  carregando,
  ativaId,
  onNova,
  onAbrir,
  onApagar,
}: Props) {
  const classes = useStyles();

  return (
    <aside
      className={`${classes.card} ${classes.historico}`}
      aria-label="Histórico de conversas"
    >
      <button type="button" className={classes.buttonPrimary} onClick={onNova}>
        <AddIcon style={{ fontSize: 16 }} /> Nova conversa
      </button>
      <div className={classes.rotulo}>Histórico</div>
      <div className={classes.lista}>
        {carregando && (
          <div
            className={classes.esqueleto}
            style={{ width: '80%', margin: 8 }}
          />
        )}
        {!carregando && conversas.length === 0 && (
          <p className={classes.meta} style={{ padding: '4px 8px', margin: 0 }}>
            Nenhuma conversa ainda. A primeira pergunta cria uma.
          </p>
        )}
        {conversas.map(conversa => (
          <div
            key={conversa.id}
            role="button"
            tabIndex={0}
            aria-current={conversa.id === ativaId ? 'true' : undefined}
            className={`${classes.item} ${
              conversa.id === ativaId ? classes.itemAtivo : ''
            }`}
            onClick={() => onAbrir(conversa.id)}
            onKeyDown={evento => evento.key === 'Enter' && onAbrir(conversa.id)}
          >
            <ChatIcon style={{ fontSize: 15, flexShrink: 0 }} />
            <span className={classes.itemTexto}>
              <span className={classes.itemTitulo}>{conversa.title}</span>
              <span className={classes.meta}>{quando(conversa.updatedAt)}</span>
            </span>
            <button
              type="button"
              className={classes.apagar}
              aria-label={`Apagar a conversa ${conversa.title}`}
              title="Apagar conversa"
              onClick={evento => {
                evento.stopPropagation();
                onApagar(conversa);
              }}
            >
              <DeleteIcon style={{ fontSize: 15 }} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
