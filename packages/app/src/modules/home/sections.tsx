import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
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
import { Progress } from '@backstage/core-components';
import { atlasTokens } from '@internal/plugin-components';
import { useAtlasStyles } from './useAtlasStyles';
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

const { brand, radius, status } = atlasTokens;

/* ------------------------------------------------------------ seção base --- */

export function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const classes = useAtlasStyles();
  return (
    <section className={classes.sectionCard}>
      <div className={classes.sectionHeader}>
        <h3 className={classes.sectionTitle}>
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
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
  const classes = useAtlasStyles();
  const local = useScopeStyles();

  return (
    <div className={local.shell}>
      <div className={local.selector}>
        <span className={local.label}>Escopo do serviço</span>
        {SERVICE_SCOPES.map(s => (
          <button
            key={s}
            type="button"
            className={`${classes.pill} ${
              scope === s ? classes.pillActive : ''
            }`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className={local.description}>
        Filtre métricas, recursos e atualizações pelo serviço selecionado.
      </p>
    </div>
  );
}

const useScopeStyles = makeStyles(theme => ({
  shell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '10px 14px',
    width: '100%',
  },
  selector: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    minWidth: 0,
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: theme.palette.text.disabled,
    padding: '0 4px',
    whiteSpace: 'nowrap',
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: '0.78rem',
    lineHeight: 1.4,
    minWidth: 180,
    margin: 0,
  },
}));

/* ------------------------------------------------------------------ hero --- */

const useHeroStyles = makeStyles(theme => ({
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 2.5fr',
    gap: 16,
    alignItems: 'stretch',
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '18px 20px',
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },
  welcome: {
    background: `linear-gradient(135deg, ${brand.limeBg} 0%, ${theme.palette.background.paper} 60%)`,
    border: `1px solid ${brand.limeBorder}`,
    borderRadius: radius.md,
    padding: '18px 20px',
    minHeight: 140,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: brand.lime,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '6px 0',
    color: theme.palette.text.primary,
  },
  sub: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.45,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    width: '100%',
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr 1fr' },
  },
  metric: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.md,
    padding: '18px 20px',
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: brand.limeBorder,
      background: theme.palette.action.hover,
    },
  },
  metricHighlighted: {
    background: brand.lime,
    borderColor: brand.lime,
    color: brand.limeText,
    '&:hover': { background: brand.limeHover, borderColor: brand.lime },
  },
  metricHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricTitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  metricTitleOnLime: { color: 'rgba(255,255,255,0.9)' },
  metricValue: {
    fontSize: '1.85rem',
    fontWeight: 800,
    lineHeight: 1.1,
    marginTop: 4,
  },
}));

export function HeroSection({
  metrics,
  loading,
}: {
  metrics: Metric[];
  loading: boolean;
}) {
  const classes = useHeroStyles();

  return (
    <section className={classes.layout}>
      <div className={classes.welcome}>
        <span className={classes.eyebrow}>Portal do Desenvolvedor</span>
        <h2 className={classes.title}>Bem-vindo ao Atlas</h2>
        <p className={classes.sub}>
          Provisione, descubra e governe recursos em um só lugar.
        </p>
      </div>

      <div className={classes.grid}>
        {loading
          ? null
          : metrics.map(metric => (
              <div
                key={metric.title}
                className={`${classes.metric} ${
                  metric.highlighted ? classes.metricHighlighted : ''
                }`}
              >
                <div className={classes.metricHead}>
                  <span
                    className={`${classes.metricTitle} ${
                      metric.highlighted ? classes.metricTitleOnLime : ''
                    }`}
                  >
                    {metric.title}
                  </span>
                  {metric.highlighted ? (
                    <SparklesIcon fontSize="small" />
                  ) : (
                    <ServerIcon fontSize="small" />
                  )}
                </div>
                <div className={classes.metricValue}>{metric.value}</div>
              </div>
            ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- ações rápidas --- */

const QA_ICONS: Record<QuickActionColor, ReactNode> = {
  provision: <RocketIcon fontSize="small" />,
  search: <SearchIcon fontSize="small" />,
  resources: <BoxesIcon fontSize="small" />,
  request: <KeyIcon fontSize="small" />,
  breakglass: <ShieldAlertIcon fontSize="small" />,
  governance: <ShieldCheckIcon fontSize="small" />,
  templates: <TemplateIcon fontSize="small" />,
};

const QA_COLORS: Record<QuickActionColor, string> = {
  provision: brand.lime,
  search: status.info,
  resources: brand.purple,
  request: status.warning,
  breakglass: status.danger,
  governance: status.success,
  templates: brand.purple,
};

const useQuickActionStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  card: {
    minWidth: 150,
    flex: '0 0 auto',
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.md,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: brand.limeBorder,
      transform: 'translateY(-2px)',
    },
    '&:disabled': { opacity: 0.45, cursor: 'not-allowed', transform: 'none' },
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: 'left',
  },
}));

export function QuickActionsSection() {
  const classes = useQuickActionStyles();
  const navigate = useNavigate();

  const render = (action: QuickAction) => {
    const card = (
      <button
        key={action.id}
        type="button"
        className={classes.card}
        disabled={action.to === null}
        onClick={() => action.to && navigate(action.to)}
      >
        <span
          className={classes.circle}
          style={{ background: QA_COLORS[action.color] }}
        >
          {QA_ICONS[action.color]}
        </span>
        <span className={classes.label}>{action.label}</span>
      </button>
    );

    // Ação sem destino é tela que o lab ainda não tem. Some-la esconderia o
    // roadmap; deixá-la clicável levaria a um 404.
    return action.to === null ? (
      <Tooltip key={action.id} title="Tela ainda não implementada no lab">
        <span>{card}</span>
      </Tooltip>
    ) : (
      card
    );
  };

  return (
    <SectionCard title="Ações rápidas" icon={<RocketIcon fontSize="small" />}>
      <div className={classes.row}>{QUICK_ACTIONS.map(render)}</div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------ atualizações --- */

export function GeneralUpdatesSection() {
  const classes = useAtlasStyles();
  const navigate = useNavigate();

  return (
    <SectionCard
      title="Últimas atualizações gerais"
      icon={<BellIcon fontSize="small" />}
    >
      <div className={classes.list}>
        {GENERAL_UPDATES.map(update => (
          <div key={update.id} className={classes.listItem}>
            <span className={classes.itemText}>{update.text}</span>
            {update.linkUrl && (
              <span
                className={classes.link}
                role="link"
                tabIndex={0}
                onClick={() => navigate(update.linkUrl!)}
                onKeyDown={e => e.key === 'Enter' && navigate(update.linkUrl!)}
              >
                {update.linkLabel ?? 'Referência'}
                <ArrowIcon style={{ fontSize: 13 }} />
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function ServicesSection({
  services,
  loading,
}: {
  services: ServiceRow[];
  loading: boolean;
}) {
  const classes = useAtlasStyles();

  return (
    <SectionCard
      title="Serviços no catálogo"
      icon={<ServerIcon fontSize="small" />}
    >
      {loading ? (
        <Progress />
      ) : services.length === 0 ? (
        <div className={classes.empty}>
          Nenhum componente no catálogo ainda. Use um template em Create.
        </div>
      ) : (
        <div className={classes.list}>
          {services.map(service => (
            <div key={service.name} className={classes.listItem}>
              <span className={classes.itemText}>{service.name}</span>
              <span className={classes.itemMeta}>
                {service.owner} · {service.kind} · {service.lifecycle}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function UsefulLinksSection() {
  const classes = useAtlasStyles();
  const navigate = useNavigate();

  return (
    <SectionCard title="Links úteis" icon={<LinkIcon fontSize="small" />}>
      <div className={classes.list}>
        {USEFUL_LINKS.map(link => (
          <div key={link.id} className={classes.listItem}>
            <span
              className={classes.link}
              role="link"
              tabIndex={0}
              onClick={() => navigate(link.href)}
              onKeyDown={e => e.key === 'Enter' && navigate(link.href)}
            >
              {link.label}
              <ArrowIcon style={{ fontSize: 13 }} />
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function ToolkitSection() {
  const classes = useAtlasStyles();

  return (
    <SectionCard title="Ferramentas" icon={<BuildIcon fontSize="small" />}>
      <div className={classes.list}>
        {TOOLKIT_TOOLS.map(tool => (
          <div key={tool.id} className={classes.listItem}>
            <a
              className={classes.link}
              href={tool.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {tool.label}
              <ArrowIcon style={{ fontSize: 13 }} />
            </a>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------ onboarding --- */

const useOnboardingStyles = makeStyles(theme => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },
  step: {
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.md,
    padding: '16px 18px',
  },
  number: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: brand.limeBg,
    color: brand.lime,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.8rem',
    marginBottom: 8,
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    margin: '0 0 4px',
  },
  desc: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    margin: 0,
  },
}));

export function OnboardingSection() {
  const classes = useOnboardingStyles();

  return (
    <SectionCard title="Comece por aqui" icon={<SchoolIcon fontSize="small" />}>
      <div className={classes.grid}>
        {ONBOARDING_STEPS.map(step => (
          <div key={step.id} className={classes.step}>
            <span className={classes.number}>{step.id}</span>
            <h4 className={classes.title}>{step.title}</h4>
            <p className={classes.desc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
