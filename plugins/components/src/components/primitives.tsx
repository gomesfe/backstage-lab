import type { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Content, Page, Progress } from '@backstage/core-components';
import InboxIcon from '@material-ui/icons/Inbox';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import { atlasTokens } from '../tokens';

/**
 * Primitivas visuais compartilhadas, portadas de `primitives.tsx` do redesign.
 *
 * Todas as telas do Atlas montam em cima destas três formas: o cabeçalho de
 * página, a etiqueta de status e a tabela. Reimplementá-las por tela é o
 * caminho mais curto para elas divergirem.
 */

const { brand, status, radius, maxWidth } = atlasTokens;

/* ----------------------------------------------------------------- badge --- */

export type BadgeVariant = 'lime' | 'info' | 'warning' | 'purple' | 'danger';

const BADGE_COLORS: Record<BadgeVariant, string> = {
  lime: brand.lime,
  info: status.info,
  warning: status.warning,
  purple: brand.purple,
  danger: status.danger,
};

const useBadgeStyles = makeStyles({
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: radius.pill,
    fontSize: '0.7rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    whiteSpace: 'nowrap',
  },
});

export function Badge({
  variant = 'info',
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  const classes = useBadgeStyles();
  const color = BADGE_COLORS[variant];

  return (
    <span
      className={classes.tag}
      style={{
        color,
        // 22% de opacidade dá fundo legível nos dois temas sem precisar de
        // uma cor por tema para cada variante.
        backgroundColor: `${color}38`,
        border: `1px solid ${color}59`,
      }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- AtlasPage --- */

const usePageStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth,
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  eyebrow: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: brand.lime,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '4px 0 0',
    color: theme.palette.text.primary,
  },
  subtitle: {
    fontSize: '0.88rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    margin: '6px 0 0',
    maxWidth: 720,
  },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
}));

/**
 * Casca de uma tela do Atlas.
 *
 * Usa `noHeader` do PageBlueprint e desenha o próprio cabeçalho: o do
 * Backstage é uma faixa de largura cheia, e o design pede título e subtítulo
 * dentro da mesma coluna do conteúdo.
 */
export function AtlasPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  themeId = 'tool',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  themeId?: string;
}) {
  const classes = usePageStyles();

  return (
    <Page themeId={themeId}>
      <Content>
        <div className={classes.container}>
          <header className={classes.header}>
            <div>
              {eyebrow && <span className={classes.eyebrow}>{eyebrow}</span>}
              <h1 className={classes.title}>{title}</h1>
              {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
            </div>
            {actions && <div className={classes.actions}>{actions}</div>}
          </header>
          {children}
        </div>
      </Content>
    </Page>
  );
}

/* ------------------------------------------------------------- DataTable --- */

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
};

const useTableStyles = makeStyles(theme => ({
  wrap: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '8px 4px',
    overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '0.72rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.text.disabled,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px',
    fontSize: '0.84rem',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  row: {
    transition: 'background 0.15s ease',
    '&:hover': { background: theme.palette.action.hover },
    '&:last-child td': { borderBottom: 0 },
  },
  state: {
    padding: '28px 16px',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
  },
}));

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  error,
  emptyMessage = 'Nenhum registro encontrado.',
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}) {
  const classes = useTableStyles();

  if (error) {
    return (
      <div className={classes.wrap}>
        <div className={classes.state}>
          <WarningIcon
            style={{ display: 'block', margin: '0 auto 8px', opacity: 0.7 }}
          />
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={classes.wrap}>
        <Progress />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={classes.wrap}>
        <div className={classes.state}>
          <InboxIcon
            style={{ display: 'block', margin: '0 auto 8px', opacity: 0.6 }}
          />
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.wrap}>
      <table className={classes.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={classes.th}
                style={{ textAlign: column.align ?? 'left' }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className={classes.row}>
              {columns.map(column => (
                <td
                  key={column.key}
                  className={classes.td}
                  style={{ textAlign: column.align ?? 'left' }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ FeatureCard --- */

const useCardStyles = makeStyles(theme => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: brand.limeBorder,
      transform: 'translateY(-2px)',
    },
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    margin: 0,
  },
  body: {
    fontSize: '0.83rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    fontSize: '0.75rem',
    color: theme.palette.text.disabled,
    flexWrap: 'wrap',
  },
}));

export function CardGrid({ children }: { children: ReactNode }) {
  const classes = useCardStyles();
  return <div className={classes.grid}>{children}</div>;
}

export function FeatureCard({
  title,
  badge,
  body,
  footer,
}: {
  title: ReactNode;
  badge?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}) {
  const classes = useCardStyles();

  return (
    <article className={classes.card}>
      <div className={classes.head}>
        <h3 className={classes.title}>{title}</h3>
        {badge}
      </div>
      {body && <p className={classes.body}>{body}</p>}
      {footer && <div className={classes.footer}>{footer}</div>}
    </article>
  );
}
