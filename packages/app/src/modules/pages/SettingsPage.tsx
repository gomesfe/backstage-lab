import { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useObservable from 'react-use/lib/useObservable';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Switch from '@material-ui/core/Switch';
import {
  useApi,
  appThemeApiRef,
  identityApiRef,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  atlasTokens,
} from '@internal/plugin-components';
import { atlasEnvApiRef } from '@internal/plugin-components';

const { radius } = atlasTokens;

const useStyles = makeStyles(theme => ({
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '8px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  tabs: { borderBottom: `1px solid ${theme.palette.divider}` },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '16px 0',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 0 },
  },
  name: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  desc: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    marginTop: 2,
  },
  themeGrid: { display: 'flex', gap: 12, flexWrap: 'wrap', padding: '16px 0' },
  themeCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.md,
    padding: '14px 18px',
    minWidth: 160,
    cursor: 'pointer',
    background: 'transparent',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    '&:hover': { borderColor: atlasTokens.brand.limeBorder },
  },
  themeCardActive: {
    borderColor: atlasTokens.brand.lime,
    background: atlasTokens.brand.limeBg,
  },
  themeName: {
    fontWeight: 700,
    fontSize: '0.88rem',
    color: theme.palette.text.primary,
  },
  themeVariant: {
    fontSize: '0.76rem',
    color: theme.palette.text.secondary,
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.82rem',
    color: theme.palette.text.secondary,
  },
}));

function Row({
  name,
  desc,
  control,
}: {
  name: string;
  desc: string;
  control: React.ReactNode;
}) {
  const classes = useStyles();
  return (
    <div className={classes.row}>
      <div>
        <div className={classes.name}>{name}</div>
        <div className={classes.desc}>{desc}</div>
      </div>
      {control}
    </div>
  );
}

/**
 * Configurações do usuário.
 *
 * Aparência, identidade e feature flags — tudo lido das APIs do Backstage,
 * então o que a tela mostra é o estado real da sessão.
 */
export function AtlasSettingsPage() {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  const appThemeApi = useApi(appThemeApiRef);
  const identityApi = useApi(identityApiRef);
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const env = useApi(atlasEnvApiRef);

  const activeThemeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const themes = appThemeApi.getInstalledThemes();

  const { value: identity } = useAsync(
    () => identityApi.getBackstageIdentity(),
    [identityApi],
  );
  const { value: profile } = useAsync(
    () => identityApi.getProfileInfo(),
    [identityApi],
  );

  const flags = featureFlagsApi.getRegisteredFlags();
  const [, forceRender] = useState(0);

  return (
    <AtlasPage
      eyebrow="Preferências"
      title="Configurações"
      subtitle="Aparência, identidade e recursos experimentais desta sessão."
      actions={<Badge variant="info">{env.envName}</Badge>}
    >
      <section className={classes.card}>
        <Tabs
          className={classes.tabs}
          value={tab}
          onChange={(_, next) => setTab(next)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Aparência" />
          <Tab label="Identidade" />
          <Tab label="Feature flags" />
        </Tabs>

        {tab === 0 && (
          <div className={classes.themeGrid}>
            {themes.map(theme => (
              <button
                key={theme.id}
                type="button"
                className={`${classes.themeCard} ${
                  activeThemeId === theme.id ? classes.themeCardActive : ''
                }`}
                onClick={() => appThemeApi.setActiveThemeId(theme.id)}
              >
                <div className={classes.themeName}>{theme.title}</div>
                <div className={classes.themeVariant}>
                  {theme.variant === 'dark' ? 'escuro' : 'claro'}
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 1 && (
          <>
            <Row
              name="Usuário"
              desc="Como o portal identifica você. É esta referência que o RBAC usa para encontrar suas permissões."
              control={
                <span className={classes.mono}>
                  {identity?.userEntityRef ?? '—'}
                </span>
              }
            />
            <Row
              name="Nome de exibição"
              desc="Vem do perfil do provedor de login."
              control={
                <span className={classes.mono}>
                  {profile?.displayName ?? '—'}
                </span>
              }
            />
            <Row
              name="Grupos"
              desc="Os grupos do catálogo aos quais você pertence. Sem grupo, o RBAC cai no padrão fechado."
              control={
                <span className={classes.mono}>
                  {identity?.ownershipEntityRefs
                    ?.filter(ref => ref.startsWith('group:'))
                    .join(', ') || 'nenhum'}
                </span>
              }
            />
            <Row
              name="Versão do portal"
              desc="Identidade desta instalação, lida do app-config."
              control={
                <span className={classes.mono}>
                  {env.version} · {env.envName}
                </span>
              }
            />
          </>
        )}

        {tab === 2 &&
          (flags.length === 0 ? (
            <Row
              name="Nenhuma feature flag registrada"
              desc="Plugins registram flags para liberar funcionalidade em construção. Nenhum plugin instalado registrou uma."
              control={<span />}
            />
          ) : (
            flags.map(flag => (
              <Row
                key={flag.name}
                name={flag.name}
                desc={`Registrada pelo plugin ${flag.pluginId || 'app'}.`}
                control={
                  <Switch
                    color="primary"
                    checked={featureFlagsApi.isActive(flag.name)}
                    onChange={event => {
                      featureFlagsApi.save({
                        states: { [flag.name]: event.target.checked ? 1 : 0 },
                        merge: true,
                      });
                      forceRender(n => n + 1);
                    }}
                  />
                }
              />
            ))
          ))}
      </section>
    </AtlasPage>
  );
}
