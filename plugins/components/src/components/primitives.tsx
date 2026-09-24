import type { ReactNode } from 'react';
import { Content, Page } from '@backstage/core-components';
import InboxIcon from '@material-ui/icons/Inbox';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';

/**
 * Primitivas do Atlas Design System.
 *
 * Estes componentes **não definem estilo**: eles montam a marcação com as
 * classes de `atlas-ds.css`, que é o design system portado do redesign.
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
  return (
    <Page themeId={themeId}>
      <Content>
        <div className="atlas-appContainer">
          <div className="atlas-pageHeader">
            <div className="atlas-pageTitleGroup">
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
};

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
                style={{ textAlign: column.align ?? 'left' }}
              >
                {column.header}
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
}: {
  title: ReactNode;
  badge?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <article className="atlas-featureCard">
      <div className="atlas-featureCardHead">
        {icon && <span className="atlas-featureCardIcon">{icon}</span>}
        {badge}
      </div>
      <div className="atlas-featureCardTitle">{title}</div>
      {body && <div className="atlas-featureCardDesc">{body}</div>}
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
