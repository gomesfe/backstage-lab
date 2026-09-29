import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import FlashIcon from '@material-ui/icons/FlashOn';
import CloudIcon from '@material-ui/icons/CloudQueue';
import SearchIcon from '@material-ui/icons/Search';
import FolderIcon from '@material-ui/icons/FolderOpen';
import KeyIcon from '@material-ui/icons/VpnKey';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PolicyIcon from '@material-ui/icons/Policy';
import TemplateIcon from '@material-ui/icons/ViewQuilt';
import BellIcon from '@material-ui/icons/NotificationsNone';
import CatalogIcon from '@material-ui/icons/ViewModule';
import GroupIcon from '@material-ui/icons/Group';
import AppsIcon from '@material-ui/icons/Apps';
import ApiIcon from '@material-ui/icons/Extension';
import SystemIcon from '@material-ui/icons/AccountTree';
import LinkIcon from '@material-ui/icons/Link';
import BuildIcon from '@material-ui/icons/Build';
import FlagIcon from '@material-ui/icons/Flag';
import ArrowIcon from '@material-ui/icons/CallMade';
import LayersIcon from '@material-ui/icons/Layers';
import SchoolIcon from '@material-ui/icons/School';
import CodeIcon from '@material-ui/icons/Code';
import InsightsIcon from '@material-ui/icons/Assessment';
import { Badge, type BadgeVariant } from '@internal/plugin-components';
import { TOOLKIT_TOOLS } from '../../modules/nav/toolkit';
import { LEARNING_PATHS, type LearningPath } from '../learning-paths/learningData';
import {
  FEATURED_LEARNING_PATH_IDS,
  GENERAL_UPDATES,
  ONBOARDING_STEPS,
  QUICK_ACTIONS,
  SERVICE_SCOPES,
  SONAR_BASE_URL,
  USEFUL_LINKS,
  type QuickAction,
  type QuickActionColor,
} from './data';
import type {
  ApplicationRow,
  Metric,
  MetricId,
  ServiceRow,
  WorkloadType,
} from './useHomeData';

/**
 * Seções da Home. Só marcação com as classes do design system
 * (`atlas.css`, gerado do repositório atlas-design-system).
 *
 * Tudo que leva a outro lugar é um link de verdade (`RouterLink`), não um
 * elemento com onClick: abre em nova aba com o botão do meio, funciona no
 * teclado e o leitor de tela anuncia como link.
 */

const QA_ICON_CLASS: Record<QuickActionColor, string> = {
  provision: 'atlas-qa-provision',
  search: 'atlas-qa-search',
  resources: 'atlas-qa-resources',
  request: 'atlas-qa-request',
  breakglass: 'atlas-qa-breakglass',
  governance: 'atlas-qa-governance',
  templates: 'atlas-qa-templates',
};

// Cada ícone diz o que a ação faz: provisionar é subir recurso na nuvem,
// break glass é destravar acesso de emergência. Mantenha em sincronia com o
// ícone da página de destino.
const QA_ICON: Record<QuickActionColor, ReactNode> = {
  provision: <CloudIcon fontSize="small" />,
  search: <SearchIcon fontSize="small" />,
  resources: <FolderIcon fontSize="small" />,
  request: <KeyIcon fontSize="small" />,
  breakglass: <LockOpenIcon fontSize="small" />,
  governance: <PolicyIcon fontSize="small" />,
  templates: <TemplateIcon fontSize="small" />,
};

const METRIC_ICON: Record<MetricId, ReactNode> = {
  components: <AppsIcon fontSize="small" />,
  apis: <ApiIcon fontSize="small" />,
  systems: <SystemIcon fontSize="small" />,
  squads: <GroupIcon fontSize="small" />,
  resources: <CloudIcon fontSize="small" />,
};

export const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="atlas-skeletonLine"
          style={{ width: `${85 - index * 10}%` }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------- seletor de escopo --- */

export function ServiceScopeSelector({
  scope,
  onChange,
}: {
  scope: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="atlas-groupViewShell">
      <div className="atlas-groupViewSelector" role="group" aria-label="Escopo do serviço">
        <span className="atlas-groupViewLabel">Escopo do serviço</span>
        {SERVICE_SCOPES.map(s => (
          <button
            key={s}
            type="button"
            aria-pressed={scope === s}
            className={`atlas-groupViewBtn ${scope === s ? 'atlas-groupViewBtnActive' : ''}`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="atlas-groupViewDescription">
        Métricas e serviços abaixo mostram só o que pertence ao escopo.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ hero --- */

export function HeroSection({
  firstName,
  metrics,
  loading,
}: {
  firstName?: string;
  metrics: Metric[];
  loading: boolean;
}) {
  return (
    <section className="atlas-heroOverviewLayout">
      <div className="atlas-welcomeCard">
        <span className="atlas-welcomeEyebrow">Portal do desenvolvedor</span>
        <h2 className="atlas-welcomeTitle">
          {firstName ? `Olá, ${firstName}` : 'Bem-vindo ao Atlas'}
        </h2>
        <p className="atlas-welcomeSub">
          Provisione, descubra e governe recursos em um só lugar.
        </p>
        <div className="atlas-welcomeActions">
          <RouterLink className="atlas-btnPill atlas-btnPillLime" to="/create">
            Provisionar recurso
          </RouterLink>
          <RouterLink className="atlas-btnPill" to="/catalog">
            Explorar catálogo
          </RouterLink>
        </div>
      </div>

      <div className="atlas-topOverviewCardsGrid">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`atlas-expandMetricCard ${index === 4 ? 'atlas-expandMetricCardWide' : ''}`}
              >
                <SkeletonLines count={2} />
              </div>
            ))
          : metrics.map(metric => (
              <RouterLink
                key={metric.id}
                to={metric.to}
                className={[
                  'atlas-expandMetricCard',
                  metric.highlighted
                    ? 'atlas-expandMetricCardHighlighted atlas-expandMetricCardWide'
                    : '',
                ].join(' ')}
              >
                <div className="atlas-metricCardHead">
                  <span className="atlas-metricCardTitle">{metric.title}</span>
                  <span className="atlas-metricCardIcon">
                    {METRIC_ICON[metric.id]}
                  </span>
                </div>
                <div className="atlas-metricBigValue">{metric.value}</div>
                <div className="atlas-metricCardSub">{metric.sub}</div>
              </RouterLink>
            ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- ações rápidas --- */

export function QuickActionsSection() {
  const renderAction = (action: QuickAction) => {
    const content = (
      <>
        <span className={`atlas-qaIconCircle ${QA_ICON_CLASS[action.color]}`}>
          {QA_ICON[action.color]}
        </span>
        <span className="atlas-qaLabelText">{action.label}</span>
      </>
    );

    return action.to === null ? (
      <button
        key={action.id}
        type="button"
        className="atlas-qaCardBtn"
        disabled
        title="Ainda não disponível no lab"
      >
        {content}
      </button>
    ) : (
      <RouterLink key={action.id} className="atlas-qaCardBtn" to={action.to}>
        {content}
      </RouterLink>
    );
  };

  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <FlashIcon fontSize="small" /> Ações rápidas
        </h3>
      </div>
      <div className="atlas-quickActionsCarousel">
        <div className="atlas-quickActionsViewport">
          <div className="atlas-quickActionsFlex">
            {QUICK_ACTIONS.map(renderAction)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ atualizações --- */

export function GeneralUpdatesSection() {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <BellIcon fontSize="small" /> Últimas atualizações
        </h3>
      </div>
      {GENERAL_UPDATES.length === 0 ? (
        <div className="atlas-emptyState">Nenhum comunicado no momento.</div>
      ) : (
        <div className="atlas-homeScrollableList">
          {GENERAL_UPDATES.map(update => (
            <div
              key={update.id}
              className="atlas-homeUpdateItem"
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
            >
              <span className="atlas-homeUpdateText">{update.text}</span>
              {update.linkUrl && (
                <RouterLink
                  className="atlas-templateLink"
                  to={update.linkUrl}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
                >
                  {update.linkLabel ?? 'Referência'} <ArrowIcon style={{ fontSize: 13 }} />
                </RouterLink>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- serviços --- */

export function ServicesSection({
  services,
  total,
  loading,
}: {
  services: ServiceRow[];
  total: number;
  loading: boolean;
}) {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <CatalogIcon fontSize="small" /> Serviços no catálogo
        </h3>
        {total > services.length && (
          <RouterLink className="atlas-btnPill" to="/catalog?kind=Component">
            Ver todos ({total})
          </RouterLink>
        )}
      </div>
      {loading ? (
        <SkeletonLines />
      ) : services.length === 0 ? (
        <div className="atlas-emptyState">
          Nenhum serviço neste escopo. Crie um com uma oferta em Ofertas.
        </div>
      ) : (
        <div className="atlas-homeScrollableList" style={{ gap: 2 }}>
          {services.map(service => (
            <RouterLink key={service.id} className="atlas-serviceRow" to={service.path}>
              <span
                className="atlas-serviceStatusDot"
                style={{
                  color:
                    service.lifecycle === 'production'
                      ? 'var(--lime)'
                      : service.lifecycle === 'deprecated'
                        ? 'var(--danger)'
                        : 'var(--purple-accent)',
                }}
              />
              <span className="atlas-serviceInfo">
                <span className="atlas-serviceName">{service.name}</span>
                <span className="atlas-serviceMeta">
                  {service.owner} · {service.type}
                </span>
              </span>
              {service.lifecycle && (
                <Badge variant={LIFECYCLE_VARIANT[service.lifecycle] ?? 'info'}>
                  {service.lifecycle}
                </Badge>
              )}
            </RouterLink>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- aplicações --- */

const WORKLOAD_LABEL: Record<WorkloadType, string> = {
  microservice: 'Microsserviço',
  'static-site': 'Site Estático',
  serverless: 'Serverless',
};

const WORKLOAD_VARIANT: Record<WorkloadType, BadgeVariant> = {
  microservice: 'info',
  'static-site': 'lime',
  serverless: 'purple',
};

type WorkloadFilter = 'all' | WorkloadType;

/** "PREVCAP-2001" → "PR"; "payments-api" → "PA". */
const initialsOf = (name: string) => {
  const parts = name.split(/[\s_-]+/).filter(part => /^[a-z]/i.test(part));
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? name).slice(0, 2);
  return letters.toUpperCase();
};

const externalLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  textDecoration: 'none',
};

export function ApplicationsSection({
  applications,
  loading,
}: {
  applications: ApplicationRow[];
  loading: boolean;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<WorkloadFilter>('all');

  const needle = query.trim().toLowerCase();
  const visible = applications.filter(
    app =>
      (filter === 'all' || app.workloadType === filter) &&
      (!needle || app.name.toLowerCase().includes(needle)),
  );

  return (
    <section className="atlas-sectionCard" style={{ minWidth: 0 }}>
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <LayersIcon fontSize="small" /> Aplicações
        </h3>
      </div>

      <div className="atlas-filtersBar">
        <div className="atlas-searchFieldWrap">
          <SearchIcon className="atlas-searchIcon" />
          <input
            className="atlas-filterInput"
            placeholder="Buscar workload..."
            aria-label="Buscar workload"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          className="atlas-filterSelect"
          aria-label="Filtrar por tipo"
          value={filter}
          onChange={e => setFilter(e.target.value as WorkloadFilter)}
        >
          <option value="all">Todos</option>
          <option value="microservice">Microsserviço</option>
          <option value="static-site">Site Estático</option>
          <option value="serverless">Serverless</option>
        </select>
      </div>

      {loading ? (
        <SkeletonLines count={5} />
      ) : visible.length === 0 ? (
        <div className="atlas-emptyState">
          {applications.length === 0
            ? 'Nenhuma aplicação neste escopo. Crie uma com uma oferta em Ofertas.'
            : 'Nenhuma aplicação encontrada com esses filtros.'}
        </div>
      ) : (
        <div className="atlas-recentTableWrap" style={{ maxHeight: 480, overflowY: 'auto' }}>
          <table className="atlas-recentTable">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tipo</th>
                <th scope="col">Repositório</th>
                <th scope="col">Sonar</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(app => (
                <tr key={app.id}>
                  <td className="atlas-resourceCell">
                    <RouterLink
                      to={app.path}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      <span
                        aria-hidden
                        className="atlas-badgeTag atlas-badgeLime"
                        style={{ padding: '4px 6px', borderRadius: 6, minWidth: 28, textAlign: 'center' }}
                      >
                        {initialsOf(app.name)}
                      </span>
                      {app.name}
                    </RouterLink>
                  </td>
                  <td>
                    {app.workloadType ? (
                      <Badge variant={WORKLOAD_VARIANT[app.workloadType]}>
                        {WORKLOAD_LABEL[app.workloadType]}
                      </Badge>
                    ) : (
                      <Badge variant="warning">{app.rawType}</Badge>
                    )}
                  </td>
                  <td>
                    {app.repoUrl ? (
                      <a
                        className="atlas-actionBtnLink"
                        href={app.repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={externalLinkStyle}
                      >
                        <CodeIcon style={{ fontSize: 14 }} /> Repo
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {app.sonarKey ? (
                      <a
                        className="atlas-actionBtnLink"
                        href={`${SONAR_BASE_URL}/project/overview?id=${encodeURIComponent(app.sonarKey)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={externalLinkStyle}
                      >
                        <InsightsIcon style={{ fontSize: 14 }} /> Sonar
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ em dúvida? --- */

export function LearningHelpSection() {
  const paths = FEATURED_LEARNING_PATH_IDS.map(id =>
    LEARNING_PATHS.find(path => path.id === id),
  ).filter((path): path is LearningPath => Boolean(path));

  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <SchoolIcon fontSize="small" /> Em dúvida? Aprenda mais com Learning Paths
        </h3>
      </div>
      <p className="atlas-onboardingStepDesc" style={{ margin: 0 }}>
        Trilhas guiadas para acelerar onboardings, padronizar entregas e evoluir
        seu conhecimento em plataforma.
      </p>
      <div className="atlas-toolkitGrid">
        {paths.map(path => (
          <RouterLink
            key={path.id}
            className="atlas-toolkitItem"
            to={`/learning-paths/${path.id}`}
          >
            {path.title}
            <ArrowIcon style={{ fontSize: 13 }} />
          </RouterLink>
        ))}
      </div>
      <RouterLink
        className="atlas-btnPill atlas-btnPillLime"
        to="/learning-paths"
        style={{ justifyContent: 'center' }}
      >
        Ver todas as trilhas
      </RouterLink>
    </section>
  );
}

/* ------------------------------------------------------------- links úteis --- */

export function UsefulLinksSection() {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <LinkIcon fontSize="small" /> Links úteis
        </h3>
      </div>
      <div className="atlas-usefulLinksList">
        {USEFUL_LINKS.map(link => (
          <RouterLink key={link.id} className="atlas-usefulLinkItem" to={link.href}>
            {link.label}
            <ArrowIcon style={{ fontSize: 15 }} />
          </RouterLink>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- ferramentas --- */

export function ToolkitSection() {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <BuildIcon fontSize="small" /> Ferramentas
        </h3>
      </div>
      <div className="atlas-toolkitGrid">
        {TOOLKIT_TOOLS.map(tool => (
          <a
            key={tool.id}
            className="atlas-toolkitItem"
            href={tool.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {tool.label}
            <ArrowIcon style={{ fontSize: 13 }} />
          </a>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ onboarding --- */

export function OnboardingSection() {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <FlagIcon fontSize="small" /> Comece por aqui
        </h3>
        <RouterLink className="atlas-btnPill" to="/learning-paths">
          Ver trilhas
        </RouterLink>
      </div>
      <div className="atlas-onboardingGrid">
        {ONBOARDING_STEPS.map(step => (
          <div key={step.id} className="atlas-onboardingStep">
            <span className="atlas-onboardingStepNum">{step.id}</span>
            <div>
              <h4 className="atlas-onboardingStepTitle">{step.title}</h4>
              <p className="atlas-onboardingStepDesc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
