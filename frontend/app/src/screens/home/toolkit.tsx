import { useEffect, useRef, useState, type ReactNode } from 'react';
import AppsIcon from '@material-ui/icons/Apps';
import GitHubIcon from '@material-ui/icons/GitHub';
import ReleaseNotesIcon from '@material-ui/icons/NewReleases';
import CloudIcon from '@material-ui/icons/CloudQueue';
import SonarIcon from '@material-ui/icons/TrackChanges';
import ShieldIcon from '@material-ui/icons/VerifiedUser';
import ChartIcon from '@material-ui/icons/ShowChart';

export type ToolkitTool = {
  id: string;
  label: string;
  url: string;
  icon: ReactNode;
  /** Cor do ícone; sem ela, o ícone usa a cor de texto do tema. */
  color?: string;
};

/**
 * Ferramentas externas do time — a lista do menu Toolkit da barra e do
 * cartão "Ferramentas" da Home. Troque as URLs pelas do ambiente real.
 */
export const TOOLKIT_TOOLS: ToolkitTool[] = [
  {
    id: 'release-notes',
    label: 'Release Notes',
    url: 'https://github.com/gomesfe/backstage-lab/releases',
    icon: <ReleaseNotesIcon />,
  },
  { id: 'github', label: 'GitHub', url: 'https://github.com', icon: <GitHubIcon /> },
  {
    id: 'aws',
    label: 'AWS',
    url: 'https://console.aws.amazon.com',
    icon: <CloudIcon />,
    color: '#ff9900',
  },
  {
    id: 'sonarqube',
    label: 'SonarQube',
    url: 'https://sonarcloud.io',
    icon: <SonarIcon />,
    color: 'var(--info)',
  },
  {
    id: 'veracode',
    label: 'Veracode',
    url: 'https://analysiscenter.veracode.com',
    icon: <ShieldIcon />,
    color: 'var(--info)',
  },
  {
    id: 'devops-metrics',
    label: 'Indicadores DevOps',
    url: 'https://dora.dev',
    icon: <ChartIcon />,
    color: 'var(--danger)',
  },
];

/**
 * Botão "Toolkit" da barra: abre uma grade com as ferramentas externas.
 * Fecha ao clicar fora, com Esc ou ao escolher uma ferramenta.
 */
export function ToolkitMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="atlas-navDropdownWrapper">
      <button
        ref={buttonRef}
        type="button"
        className="atlas-navActionBtn"
        aria-label="Toolkit"
        title="Toolkit"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="atlas-toolkit-menu"
        onClick={() => setOpen(value => !value)}
      >
        <AppsIcon fontSize="small" />
      </button>

      {open && (
        <div
          id="atlas-toolkit-menu"
          className="atlas-navDropdownMenu"
          role="menu"
          aria-label="Toolkit"
          style={{ width: 'min(360px, calc(100vw - 32px))', padding: '8px 0 14px' }}
        >
          <div className="atlas-dropdownHeader">Toolkit</div>
          <div
            className="atlas-appDockGridCompact"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', padding: '8px 14px 0' }}
          >
            {TOOLKIT_TOOLS.map(tool => (
              <a
                key={tool.id}
                role="menuitem"
                className="atlas-appDockItem"
                href={tool.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setOpen(false)}
              >
                <span className="atlas-appDockIcon" style={tool.color ? { color: tool.color } : undefined}>
                  {tool.icon}
                </span>
                <span className="atlas-appDockName">{tool.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
