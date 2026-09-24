import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import RocketIcon from '@material-ui/icons/FlightTakeoff';
import SearchIcon from '@material-ui/icons/Search';
import BoxesIcon from '@material-ui/icons/Widgets';
import KeyIcon from '@material-ui/icons/VpnKey';
import ShieldAlertIcon from '@material-ui/icons/ReportProblemOutlined';
import ShieldCheckIcon from '@material-ui/icons/VerifiedUser';
import TemplateIcon from '@material-ui/icons/Dashboard';
import BellIcon from '@material-ui/icons/NotificationsNone';
import ServerIcon from '@material-ui/icons/Storage';
import SparklesIcon from '@material-ui/icons/TrendingUp';
import LinkIcon from '@material-ui/icons/Link';
import BuildIcon from '@material-ui/icons/Build';
import SchoolIcon from '@material-ui/icons/School';
import ArrowIcon from '@material-ui/icons/CallMade';
import {
  GENERAL_UPDATES,
  ONBOARDING_STEPS,
  QUICK_ACTIONS,
  SERVICE_SCOPES,
  TOOLKIT_TOOLS,
  USEFUL_LINKS,
  type QuickAction,
  type QuickActionColor,
} from './data';
import type { Metric, ServiceRow } from './useHomeData';

/**
 * Seções da Home, portadas de `HomeSections.tsx` do redesign.
 *
 * Consomem as classes de `atlas-ds.css` diretamente — a primeira versão
 * recriava as formas em `makeStyles` a partir dos tokens, e cada tela nova
 * divergia um pouco mais do design real. Usar as classes elimina a tradução.
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

const QA_ICON: Record<QuickActionColor, ReactNode> = {
  provision: <RocketIcon fontSize="small" />,
  search: <SearchIcon fontSize="small" />,
  resources: <BoxesIcon fontSize="small" />,
  request: <KeyIcon fontSize="small" />,
  breakglass: <ShieldAlertIcon fontSize="small" />,
  governance: <ShieldCheckIcon fontSize="small" />,
  templates: <TemplateIcon fontSize="small" />,
};

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
      <div className="atlas-groupViewSelector">
        <span className="atlas-groupViewLabel">Escopo do serviço</span>
        {SERVICE_SCOPES.map(s => (
          <button
            key={s}
            type="button"
            className={`atlas-groupViewBtn ${scope === s ? 'atlas-groupViewBtnActive' : ''}`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="atlas-groupViewDescription">
        Filtre métricas, recursos e atualizações pelo serviço selecionado.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ hero --- */

export function HeroSection({
  metrics,
  loading,
}: {
  metrics: Metric[];
  loading: boolean;
}) {
  return (
    <section className="atlas-heroOverviewLayout">
      <div className="atlas-welcomeCard">
        <span className="atlas-welcomeEyebrow">Portal do Desenvolvedor</span>
        <h2 className="atlas-welcomeTitle">Bem-vindo ao Atlas</h2>
        <p className="atlas-welcomeSub">
          Provisione, descubra e governe recursos em um só lugar.
        </p>
      </div>

      <div className="atlas-topOverviewCardsGrid">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="atlas-expandMetricCard">
                <div className="atlas-skeletonLine" style={{ width: '60%' }} />
              </div>
            ))
          : metrics.map(metric => (
              <div
                key={metric.title}
                className={`atlas-expandMetricCard ${
                  metric.highlighted ? 'atlas-expandMetricCardHighlighted' : ''
                }`}
              >
                <div className="atlas-metricCardHead">
                  <span className="atlas-metricCardTitle">{metric.title}</span>
                  <span className="atlas-metricCardIcon">
                    {metric.highlighted ? (
                      <SparklesIcon fontSize="small" />
                    ) : (
                      <ServerIcon fontSize="small" />
                    )}
                  </span>
                </div>
                <div className="atlas-metricBigValue">{metric.value}</div>
              </div>
            ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- ações rápidas --- */

export function QuickActionsSection() {
  const navigate = useNavigate();

  const renderAction = (action: QuickAction) => (
    <button
      key={action.id}
      type="button"
      className="atlas-qaCardBtn"
      disabled={action.to === null}
      title={
        action.to === null ? 'Tela ainda não implementada no lab' : undefined
      }
      onClick={() => action.to && navigate(action.to)}
      style={
        action.to === null
          ? { opacity: 0.45, cursor: 'not-allowed' }
          : undefined
      }
    >
      <span className={`atlas-qaIconCircle ${QA_ICON_CLASS[action.color]}`}>
        {QA_ICON[action.color]}
      </span>
      <span className="atlas-qaLabelText">{action.label}</span>
    </button>
  );

  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <RocketIcon fontSize="small" /> Ações rápidas
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
  const navigate = useNavigate();

  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <BellIcon fontSize="small" /> Últimas atualizações gerais
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
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span className="atlas-homeUpdateText">{update.text}</span>
              {update.linkUrl && (
                <span
                  className="atlas-templateLink"
                  role="link"
                  tabIndex={0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.78rem',
                  }}
                  onClick={() => navigate(update.linkUrl!)}
                  onKeyDown={e => e.key === 'Enter' && navigate(update.linkUrl!)}
                >
                  {update.linkLabel ?? 'Referência'}{' '}
                  <ArrowIcon style={{ fontSize: 13 }} />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ServicesSection({
  services,
  loading,
}: {
  services: ServiceRow[];
  loading: boolean;
}) {
  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <ServerIcon fontSize="small" /> Serviços no catálogo
        </h3>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="atlas-skeletonLine"
              style={{ width: `${85 - index * 10}%` }}
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="atlas-emptyState">
          Nenhum componente no catálogo ainda. Use um template em Create.
        </div>
      ) : (
        <div className="atlas-homeScrollableList">
          {services.map(service => (
            <div
              key={service.name}
              className="atlas-homeUpdateItem"
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span className="atlas-homeUpdateText" style={{ fontWeight: 600 }}>
                {service.name}
              </span>
              <span className="atlas-homeUpdateMeta">
                {service.owner} · {service.kind} · {service.lifecycle}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function UsefulLinksSection() {
  const navigate = useNavigate();

  return (
    <section className="atlas-sectionCard">
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          <LinkIcon fontSize="small" /> Links úteis
        </h3>
      </div>
      <div className="atlas-usefulLinksList">
        {USEFUL_LINKS.map(link => (
          <a key={link.id} className="atlas-usefulLinkItem" onClick={() => navigate(link.href)}>
            {link.label}
            <ArrowIcon style={{ fontSize: 15 }} />
          </a>
        ))}
      </div>
    </section>
  );
}

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
          <SchoolIcon fontSize="small" /> Comece por aqui
        </h3>
      </div>
      <div className="atlas-onboardingGrid">
        {ONBOARDING_STEPS.map(step => (
          <div key={step.id} className="atlas-onboardingStep">
            <span className="atlas-onboardingStepNum">{step.id}</span>
            <h4 className="atlas-onboardingStepTitle">{step.title}</h4>
            <p className="atlas-onboardingStepDesc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
