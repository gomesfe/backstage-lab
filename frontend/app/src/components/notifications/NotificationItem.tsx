import type { ReactNode } from 'react';
import { Link } from '@backstage/core-components';
import type {
  Notification,
  NotificationSeverity,
} from '@backstage/plugin-notifications-common';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import LowIcon from '@material-ui/icons/NotificationsNone';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import MarkReadIcon from '@material-ui/icons/Drafts';
import MarkUnreadIcon from '@material-ui/icons/MarkunreadOutlined';
import ArrowIcon from '@material-ui/icons/CallMade';
import { ehExterno, quando, ROTULO_SEVERIDADE } from './helpers';
import { useStyles } from './styles';

const ICONE: Record<NotificationSeverity, ReactNode> = {
  critical: <ErrorIcon fontSize="small" />,
  high: <WarningIcon fontSize="small" />,
  normal: <InfoIcon fontSize="small" />,
  low: <LowIcon fontSize="small" />,
};

type Props = {
  notificacao: Notification;
  ocupado: boolean;
  onAtualizar: (mudanca: { read?: boolean; saved?: boolean }) => void;
};

/** Link da notificação: rota do portal na mesma aba; URL externa em nova aba. Abrir marca como lida. */
function LinkDaNotificacao({
  link,
  onAbrir,
  className,
  children,
  rotulo,
}: {
  link: string;
  onAbrir: () => void;
  className?: string;
  children: ReactNode;
  rotulo?: string;
}) {
  if (ehExterno(link)) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onAbrir}
        className={className}
        aria-label={rotulo}
        title={rotulo}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={link}
      onClick={onAbrir}
      className={className}
      aria-label={rotulo}
      title={rotulo}
    >
      {children}
    </Link>
  );
}

/** Uma notificação: severidade, título, descrição, quando e as ações. */
export function NotificationItem({ notificacao, ocupado, onAtualizar }: Props) {
  const classes = useStyles();
  const severidade = notificacao.payload.severity ?? 'normal';
  const lida = Boolean(notificacao.read);
  const salva = Boolean(notificacao.saved);
  const { link, title, description, topic } = notificacao.payload;
  const criada = new Date(notificacao.created);
  const abrir = () => !lida && onAtualizar({ read: true });

  return (
    <article
      className={`${classes.item} ${classes[severidade]} ${
        lida ? '' : classes.naoLida
      }`}
    >
      <span
        className={classes.icone}
        title={`Severidade ${ROTULO_SEVERIDADE[severidade].toLowerCase()}`}
      >
        {ICONE[severidade]}
      </span>
      <div className={classes.corpo}>
        <div className={classes.titulo}>
          {!lida && (
            <span className={classes.ponto} role="img" aria-label="Não lida" />
          )}
          {link ? (
            <LinkDaNotificacao link={link} onAbrir={abrir}>
              {title}
            </LinkDaNotificacao>
          ) : (
            title
          )}
        </div>
        {description && <div className={classes.descricao}>{description}</div>}
        <div className={classes.meta}>
          <span title={criada.toLocaleString('pt-BR')}>{quando(criada)}</span>
          {topic && <span>· {topic}</span>}
          <span>· {notificacao.origin.replace(/^plugin:/, '')}</span>
        </div>
      </div>
      <div className={classes.acoes}>
        {link && (
          <LinkDaNotificacao
            link={link}
            onAbrir={abrir}
            className={classes.iconButton}
            rotulo={`Abrir ${title}`}
          >
            <ArrowIcon style={{ fontSize: 16 }} />
          </LinkDaNotificacao>
        )}
        <button
          type="button"
          className={classes.iconButton}
          disabled={ocupado}
          title={lida ? 'Marcar como não lida' : 'Marcar como lida'}
          aria-label={lida ? 'Marcar como não lida' : 'Marcar como lida'}
          onClick={() => onAtualizar({ read: !lida })}
        >
          {lida ? (
            <MarkUnreadIcon style={{ fontSize: 16 }} />
          ) : (
            <MarkReadIcon style={{ fontSize: 16 }} />
          )}
        </button>
        <button
          type="button"
          className={`${classes.iconButton} ${salva ? classes.salva : ''}`}
          disabled={ocupado}
          title={salva ? 'Remover das salvas' : 'Salvar'}
          aria-label={salva ? 'Remover das salvas' : 'Salvar'}
          aria-pressed={salva}
          onClick={() => onAtualizar({ saved: !salva })}
        >
          {salva ? (
            <BookmarkIcon style={{ fontSize: 16 }} />
          ) : (
            <BookmarkBorderIcon style={{ fontSize: 16 }} />
          )}
        </button>
      </div>
    </article>
  );
}
