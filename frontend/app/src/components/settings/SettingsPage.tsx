import { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useObservable from 'react-use/lib/useObservable';
import Avatar from '@material-ui/core/Avatar';
import Switch from '@material-ui/core/Switch';
import {
  appThemeApiRef,
  featureFlagsApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Content, Link, Page } from '@backstage/core-components';
import { atlasEnvApiRef, atlasTokens } from '../../atlas/components';
import { setPref, usePref } from '../../atlas/shell/prefs/prefs';
import { OptionCard, SettingRow } from './SettingRow';
import { useStyles } from './styles';

type Aba = 'aparencia' | 'identidade' | 'flags';

const ABAS: [Aba, string][] = [
  ['aparencia', 'Aparência'],
  ['identidade', 'Identidade'],
  ['flags', 'Feature flags'],
];

/** "Ana Souza" → "AS". */
function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .map(parte => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Configurações: aparência, identidade e feature flags — lidas das APIs do
 * Backstage, então o que a tela mostra é o estado real da sessão. Posição do
 * menu e ícones são preferências do navegador (`atlas.nav`, `atlas.navIcons`).
 */
export function SettingsPage() {
  const classes = useStyles();
  const [aba, setAba] = useState<Aba>('aparencia');

  const appThemeApi = useApi(appThemeApiRef);
  const identityApi = useApi(identityApiRef);
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const ambiente = useApi(atlasEnvApiRef);

  const temaAtivo = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const temas = appThemeApi.getInstalledThemes();
  const { value: identidade } = useAsync(
    () => identityApi.getBackstageIdentity(),
    [identityApi],
  );
  const { value: perfil } = useAsync(
    () => identityApi.getProfileInfo(),
    [identityApi],
  );

  const posicaoMenu = usePref('nav', 'top');
  const iconesNoMenu = usePref('navIcons', '1') === '1';

  const flags = featureFlagsApi.getRegisteredFlags();
  // featureFlagsApi não avisa quando muda: redesenha depois de salvar.
  const [, redesenhar] = useState(0);

  const nome =
    perfil?.displayName ?? identidade?.userEntityRef?.split('/').pop() ?? '?';
  const grupos =
    identidade?.ownershipEntityRefs?.filter(ref => ref.startsWith('group:')) ??
    [];

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Preferências</span>
              <h1 className={classes.title}>Configurações</h1>
              <p className={classes.subtitle}>
                Aparência, identidade e recursos experimentais desta sessão.
              </p>
            </div>
            <span className={classes.badgeInfo}>{ambiente.envName}</span>
          </div>

          <section className={classes.card}>
            <div
              className={classes.tabs}
              role="tablist"
              aria-label="Configurações"
            >
              {ABAS.map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={aba === id}
                  className={`${classes.tab} ${
                    aba === id ? classes.tabActive : ''
                  }`}
                  onClick={() => setAba(id)}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {aba === 'aparencia' && (
              <div>
                <div className={classes.opcoes}>
                  {temas.map(tema => {
                    const paleta =
                      tema.variant === 'dark'
                        ? atlasTokens.dark
                        : atlasTokens.light;
                    return (
                      <OptionCard
                        key={tema.id}
                        titulo={tema.title}
                        texto={
                          tema.variant === 'dark'
                            ? 'Superfícies escuras'
                            : 'Cinza médio, menos brilho'
                        }
                        marcada={temaAtivo === tema.id}
                        onClick={() => appThemeApi.setActiveThemeId(tema.id)}
                        antes={
                          <span className={classes.amostra} aria-hidden>
                            <span style={{ background: paleta.bgApp }} />
                            <span style={{ background: paleta.bgCard }} />
                            <span
                              style={{ background: atlasTokens.brand.lime }}
                            />
                          </span>
                        }
                      />
                    );
                  })}
                </div>
                <div style={{ marginTop: 18 }}>
                  <SettingRow
                    titulo="Posição do menu"
                    texto="No topo (padrão) ou na lateral. Em telas estreitas (abaixo de 900px) o menu volta para o topo."
                  />
                  <div className={classes.opcoes}>
                    <OptionCard
                      titulo="No topo"
                      texto="Pílulas ao lado da logo"
                      marcada={posicaoMenu !== 'side'}
                      onClick={() => setPref('nav', null)}
                    />
                    <OptionCard
                      titulo="Na lateral"
                      texto="Lista à esquerda, sempre visível"
                      marcada={posicaoMenu === 'side'}
                      onClick={() => setPref('nav', 'side')}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <SettingRow
                    titulo="Ícones no menu"
                    texto="Mostra um ícone ao lado do nome de cada tela no menu. Desligado, o menu fica só com os nomes."
                  >
                    <Switch
                      color="primary"
                      checked={iconesNoMenu}
                      inputProps={{ 'aria-label': 'Mostrar ícones no menu' }}
                      onChange={evento =>
                        setPref('navIcons', evento.target.checked ? '1' : '0')
                      }
                    />
                  </SettingRow>
                </div>
              </div>
            )}

            {aba === 'identidade' && (
              <div>
                <div className={classes.perfil}>
                  <Avatar className={classes.avatar}>{iniciais(nome)}</Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className={classes.linhaTitulo}>
                      {perfil?.displayName ?? 'Sem nome de exibição'}
                    </span>
                    <span className={classes.linhaTexto}>
                      {perfil?.email ?? identidade?.userEntityRef ?? ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={classes.button}
                    onClick={() => identityApi.signOut()}
                  >
                    Sair
                  </button>
                </div>
                <SettingRow
                  titulo="Usuário"
                  texto="Como o portal identifica você. É esta referência que o RBAC usa para encontrar suas permissões."
                >
                  <span className={classes.valor}>
                    {identidade?.userEntityRef ?? '—'}
                  </span>
                </SettingRow>
                <SettingRow
                  titulo="Nome de exibição"
                  texto="Vem do perfil do provedor de login."
                >
                  <span className={classes.valor}>
                    {perfil?.displayName ?? '—'}
                  </span>
                </SettingRow>
                <SettingRow
                  titulo="Grupos"
                  texto="Os grupos do catálogo aos quais você pertence. Sem grupo, o RBAC cai no padrão fechado."
                >
                  {grupos.length ? (
                    <Link to="/my-groups" className={classes.valor}>
                      {grupos.join(', ')}
                    </Link>
                  ) : (
                    <span className={classes.valor}>nenhum</span>
                  )}
                </SettingRow>
                <SettingRow
                  titulo="Versão do portal"
                  texto="Identidade desta instalação, lida do app-config."
                >
                  <span className={classes.valor}>
                    {ambiente.version} · {ambiente.envName}
                  </span>
                </SettingRow>
              </div>
            )}

            {aba === 'flags' && (
              <div>
                {flags.length === 0 ? (
                  <SettingRow
                    titulo="Nenhuma feature flag registrada"
                    texto="Plugins registram flags para liberar funcionalidade em construção. Nenhum plugin instalado registrou uma."
                  />
                ) : (
                  flags.map(flag => (
                    <SettingRow
                      key={flag.name}
                      titulo={flag.name}
                      texto={`Registrada pelo plugin ${
                        flag.pluginId || 'app'
                      }.`}
                    >
                      <Switch
                        color="primary"
                        checked={featureFlagsApi.isActive(flag.name)}
                        inputProps={{ 'aria-label': flag.name }}
                        onChange={evento => {
                          featureFlagsApi.save({
                            states: {
                              [flag.name]: evento.target.checked ? 1 : 0,
                            },
                            merge: true,
                          });
                          redesenhar(atual => atual + 1);
                        }}
                      />
                    </SettingRow>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </Content>
    </Page>
  );
}
