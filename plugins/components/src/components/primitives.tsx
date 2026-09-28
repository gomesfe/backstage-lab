import { useEffect, useRef, useState, type ReactNode } from 'react';
import MuiModal from '@material-ui/core/Modal';
import { useTheme } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { Content, Page } from '@backstage/core-components';
import InboxIcon from '@material-ui/icons/Inbox';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';

/**
 * Primitivas do Atlas Design System.
 *
 * Estes componentes **não definem estilo**: eles montam a marcação com as
 * classes de `atlas.css`, gerado do repositório atlas-design-system.
 *
 * A primeira versão recriava as formas em `makeStyles` a partir dos tokens.
 * Funcionava, mas divergia do design em espaçamento, raio e estados de hover
 * — e cada tela nova divergia um pouco mais. Consumir as classes elimina a
 * tradução, que era onde a diferença nascia.
 */

/* ----------------------------------------------------------------- badge --- */

export type BadgeVariant = 'lime' | 'info' | 'warning' | 'purple' | 'danger';

const BADGE_CLASS: Record<BadgeVariant, string> = {
  lime: 'atlas-badgeLime',
  info: 'atlas-badgeInfo',
  warning: 'atlas-badgeWarning',
  purple: 'atlas-badgePurple',
  danger: 'atlas-badgeDanger',
};

export function Badge({
  variant = 'info',
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span className={`atlas-badgeTag ${BADGE_CLASS[variant]}`}>{children}</span>
  );
}

/* --------------------------------------------------------------- AtlasPage --- */

export type Crumb = { label: string; to: string };

/**
 * Trilha de localização: "Home › Trilhas › Primeiros passos".
 *
 * Só aparece em tela de detalhe — quando a página passa `parents`. Nas telas
 * principais ela só repetiria o que a barra de navegação já mostra.
 */
function Breadcrumbs({ parents = [], current }: { parents?: Crumb[]; current: string }) {
  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }, ...parents];
  return (
    <nav className="atlas-breadcrumb" aria-label="Você está em">
      {crumbs.map(crumb => (
        <span key={crumb.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <RouterLink to={crumb.to}>{crumb.label}</RouterLink>
          <span className="atlas-breadcrumbSep" aria-hidden>›</span>
        </span>
      ))}
      <span className="atlas-breadcrumbCurrent" aria-current="page">{current}</span>
    </nav>
  );
}

export function AtlasPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  themeId = 'tool',
  parents,
  crumb,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  themeId?: string;
  /** Níveis entre a Home e esta tela. Com eles, aparece a trilha de localização. */
  parents?: Crumb[];
  /** Nome desta tela na trilha, se diferente do título. */
  crumb?: string;
}) {
  return (
    <Page themeId={themeId}>
      <Content>
        <div className="atlas-appContainer">
          <div className="atlas-pageHeader">
            <div className="atlas-pageTitleGroup">
              {parents?.length ? <Breadcrumbs parents={parents} current={crumb ?? title} /> : null}
              {eyebrow && <span className="atlas-pageEyebrow">{eyebrow}</span>}
              <h1 className="atlas-pageTitle">{title}</h1>
              {subtitle && <p className="atlas-pageSubtitle">{subtitle}</p>}
            </div>
            {actions && <div className="atlas-pageActions">{actions}</div>}
          </div>
          {children}
        </div>
      </Content>
    </Page>
  );
}

/* ------------------------------------------------------------ cartão base --- */

export function SectionCard({
  title,
  icon,
  actions,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          {icon}
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Variante do cartão usada pelas telas de tabela. */
export function TableCard({ children }: { children: ReactNode }) {
  return <section className="atlas-tableContainerCard">{children}</section>;
}

/* ------------------------------------------------------------- DataTable --- */

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Classe extra na célula e no cabeçalho (ex.: `atlas-envTd`). */
  className?: string;
  /** Filtro por coluna: aparece um funil no cabeçalho. Quem filtra é a tela. */
  filter?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
};

const FunnelIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" />
  </svg>
);

/**
 * Funil do cabeçalho + popover com busca, "Limpar" e "Fechar".
 *
 * O popover é `position: fixed`, posicionado pelo botão: a moldura da tabela
 * rola na horizontal, e um popover absoluto dentro dela seria cortado.
 */
function ColumnFilterButton({
  label,
  filter,
}: {
  label: string;
  filter: NonNullable<Column<unknown>['filter']>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [draft, setDraft] = useState(filter.value);

  useEffect(() => {
    if (!pos) return undefined;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && (e.target as HTMLElement).closest('.atlas-popover, .atlas-colFilterBtn')) return;
      setPos(null);
    };
    const onScroll = () => setPos(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [pos]);

  const open = () => {
    const rect = buttonRef.current!.getBoundingClientRect();
    setDraft(filter.value);
    setPos({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - 260) });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`atlas-colFilterBtn ${filter.value ? 'atlas-colFilterBtnActive' : ''}`}
        aria-label={`Filtrar por ${label}`}
        aria-expanded={Boolean(pos)}
        title={filter.value ? `Filtrando por “${filter.value}”` : `Filtrar por ${label}`}
        onClick={() => (pos ? setPos(null) : open())}
      >
        <FunnelIcon />
      </button>
      {pos && (
        <div className="atlas-popover" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label={`Filtrar ${label}`}>
          <input
            className="atlas-input"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder={filter.placeholder ?? `Pesquisar ${label.toLowerCase()}`}
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              filter.onChange(e.target.value);
            }}
            onKeyDown={e => e.key === 'Enter' && setPos(null)}
          />
          <div className="atlas-popoverActions">
            <button
              type="button"
              className="atlas-btnPill"
              onClick={() => {
                setDraft('');
                filter.onChange('');
              }}
            >
              Limpar
            </button>
            <button type="button" className="atlas-btnPill" onClick={() => setPos(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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
  if (error) {
    return (
      <div className="atlas-recentTableWrap">
        <div className="atlas-errorState">
          <WarningIcon
            style={{ verticalAlign: '-5px', marginRight: 6, fontSize: 18 }}
          />
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    // As linhas de esqueleto do DS, e não um spinner: a tabela não muda de
    // altura quando os dados chegam.
    return (
      <div className="atlas-recentTableWrap">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="atlas-skeletonLine"
              style={{ width: `${90 - index * 8}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="atlas-recentTableWrap">
        <div className="atlas-emptyState">
          <InboxIcon
            style={{ display: 'block', margin: '0 auto 8px', opacity: 0.6 }}
          />
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-recentTableWrap">
      <table className="atlas-recentTable">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={column.className}
                style={{ textAlign: column.align ?? 'left' }}
              >
                {column.filter ? (
                  <span className="atlas-thFilter">
                    {column.header}
                    <ColumnFilterButton label={column.header} filter={column.filter} />
                  </span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(column => (
                <td
                  key={column.key}
                  className={column.className}
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

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="atlas-cardGrid">{children}</div>;
}

export function FeatureCard({
  title,
  badge,
  body,
  footer,
  icon,
  children,
}: {
  title: ReactNode;
  badge?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  /** Conteúdo extra entre a descrição e o rodapé (ex.: barra de progresso). */
  children?: ReactNode;
}) {
  return (
    <article className="atlas-featureCard">
      <div className="atlas-featureCardHead">
        {icon && <span className="atlas-featureCardIcon">{icon}</span>}
        {badge}
      </div>
      <div className="atlas-featureCardTitle">{title}</div>
      {body && <div className="atlas-featureCardDesc">{body}</div>}
      {children}
      {footer && <div className="atlas-featureCardFooter">{footer}</div>}
    </article>
  );
}

/* ------------------------------------------------------------------ misc --- */

export function Pill({
  active,
  lime,
  onClick,
  children,
}: {
  active?: boolean;
  lime?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const className = lime
    ? 'atlas-btnPill atlas-btnPillLime'
    : `atlas-groupViewBtn ${active ? 'atlas-groupViewBtnActive' : ''}`;

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="atlas-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`atlas-tabBtn ${
            active === tab.id ? 'atlas-tabBtnActive' : ''
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
}: {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const variantClass = {
    info: 'atlas-alertInfo',
    warning: 'atlas-alertWarning',
    danger: 'atlas-alertDanger',
    success: 'atlas-alertSuccess',
  }[variant];

  return (
    <div className={`atlas-alert ${variantClass}`}>
      {icon}
      <div>
        {title && <div className="atlas-alertTitle">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ misc --- */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`atlas-switch ${checked ? 'atlas-switchOn' : ''}`}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className="atlas-switchKnob" />
    </button>
  );
}

export function SettingRow({
  name,
  desc,
  control,
}: {
  name: ReactNode;
  desc?: ReactNode;
  control: ReactNode;
}) {
  return (
    <div className="atlas-settingRow">
      <div className="atlas-settingInfo">
        <span className="atlas-settingName">{name}</span>
        {desc && <span className="atlas-settingDesc">{desc}</span>}
      </div>
      {control}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="atlas-field">
      <label className="atlas-fieldLabel">{label}</label>
      {children}
      {hint && <span className="atlas-fieldHint">{hint}</span>}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  info,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  info?: ReactNode;
}) {
  return (
    <div className="atlas-pagination">
      <span className="atlas-paginationInfo">{info}</span>
      <div className="atlas-paginationBtns">
        <button
          type="button"
          className="atlas-pageBtn"
          disabled={page <= 1}
          onClick={() => onChange(1)}
        >
          «
        </button>
        <button
          type="button"
          className="atlas-pageBtn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>
        <span className="atlas-pageBtn atlas-pageBtnActive">{page}</span>
        <span className="atlas-paginationInfo">de {pageCount}</span>
        <button
          type="button"
          className="atlas-pageBtn"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
        <button
          type="button"
          className="atlas-pageBtn"
          disabled={page >= pageCount}
          onClick={() => onChange(pageCount)}
        >
          »
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ modal --- */

/**
 * Modal do design system (`atlas-modal*`) sobre o `Modal` do MUI.
 *
 * O MUI fica só com o que é difícil de acertar à mão — foco preso dentro do
 * modal, Esc fecha, foco volta a quem abriu. O visual é todo do DS.
 *
 * O modal é renderizado num portal, fora do `.atlas-root` da página, então
 * abre o próprio `.atlas-root` com o tema ativo; sem isso as variáveis de
 * cor não existem ali dentro.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Mais largo e com corpo rolável, para texto longo. */
  wide?: boolean;
}) {
  const theme = useTheme();
  return (
    <MuiModal open={open} onClose={onClose} hideBackdrop aria-labelledby="atlas-modal-title">
      <div
        className="atlas-root atlas-modalBackdrop"
        data-theme={theme.palette.type === 'light' ? 'light' : 'dark'}
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        onMouseDown={e => e.target === e.currentTarget && onClose()}
        tabIndex={-1}
      >
        <div
          className={`atlas-modalContentBox ${wide ? 'atlas-modalContentBoxWide' : ''}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="atlas-modalHeader">
            <h3 id="atlas-modal-title">{title}</h3>
            <button type="button" className="atlas-modalCloseBtn" aria-label="Fechar" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="atlas-modalBody">{children}</div>
          {footer && <div className="atlas-modalFooter">{footer}</div>}
        </div>
      </div>
    </MuiModal>
  );
}
