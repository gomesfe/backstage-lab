import { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useObservable from 'react-use/lib/useObservable';
import {
  useApi,
  appThemeApiRef,
  identityApiRef,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  Tabs,
  SettingRow,
  Switch,
  atlasEnvApiRef,
} from '../../components';

/**
 * Configurações do usuário. O que a tela deve conter está em `README.md`.
 *
 * Aparência, identidade e feature flags — tudo lido das APIs do Backstage,
 * então o que a tela mostra é o estado real da sessão.
 */
export function AtlasSettingsPage() {
  const [tab, setTab] = useState('appearance');

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
      <section className="atlas-tableContainerCard">
        <div className="atlas-sectionCardHeader">
          <Tabs
            tabs={[
              { id: 'appearance', label: 'Aparência' },
              { id: 'identity', label: 'Identidade' },
              { id: 'flags', label: 'Feature flags' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'appearance' && (
          <div className="atlas-optionCards">
            {themes.map(theme => (
              <button
                key={theme.id}
                type="button"
                className={`atlas-modalActionOption ${
                  activeThemeId === theme.id ? 'atlas-modalActionOptionChecked' : ''
                }`}
                style={{ minWidth: 180 }}
                onClick={() => appThemeApi.setActiveThemeId(theme.id)}
              >
                {/* A amostra é um .atlas-root próprio: mostra as cores do
                    tema dela, não as do tema ativo. */}
                <span
                  className="atlas-root"
                  data-theme={theme.variant === 'dark' ? 'dark' : 'light'}
                  style={{ background: 'none', width: 'auto' }}
                  aria-hidden
                >
                  <span className="atlas-themeSwatch">
                    <span />
                    <span />
                  </span>
                </span>
                <div>
                  <div className="atlas-modalActionLabel">{theme.title}</div>
                  <div className="atlas-settingDesc">
                    {theme.variant === 'dark' ? 'Superfícies escuras' : 'Cinza médio, menos brilho'}
                  </div>
                </div>
                <span
                  className={`atlas-optionCheckCircle ${
                    activeThemeId === theme.id ? '' : 'atlas-optionCheckCircleEmpty'
                  }`}
                >
                  {activeThemeId === theme.id ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === 'identity' && (
          <>
            <div className="atlas-profileRow">
              <span className="atlas-avatar">
                {(profile?.displayName ?? identity?.userEntityRef?.split('/').pop() ?? '?')
                  .split(' ')
                  .map(part => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="atlas-settingName">{profile?.displayName ?? 'Sem nome de exibição'}</div>
                <div className="atlas-settingDesc">{profile?.email ?? identity?.userEntityRef ?? ''}</div>
              </div>
              <button type="button" className="atlas-btnPill" onClick={() => identityApi.signOut()}>
                Sair
              </button>
            </div>
            <SettingRow
              name="Usuário"
              desc="Como o portal identifica você. É esta referência que o RBAC usa para encontrar suas permissões."
              control={
                <span className="atlas-costMono">
                  {identity?.userEntityRef ?? '—'}
                </span>
              }
            />
            <SettingRow
              name="Nome de exibição"
              desc="Vem do perfil do provedor de login."
              control={
                <span className="atlas-costMono">
                  {profile?.displayName ?? '—'}
                </span>
              }
            />
            <SettingRow
              name="Grupos"
              desc="Os grupos do catálogo aos quais você pertence. Sem grupo, o RBAC cai no padrão fechado."
              control={
                <span className="atlas-costMono">
                  {identity?.ownershipEntityRefs
                    ?.filter(ref => ref.startsWith('group:'))
                    .join(', ') || 'nenhum'}
                </span>
              }
            />
            <SettingRow
              name="Versão do portal"
              desc="Identidade desta instalação, lida do app-config."
              control={
                <span className="atlas-costMono">
                  {env.version} · {env.envName}
                </span>
              }
            />
          </>
        )}

        {tab === 'flags' &&
          (flags.length === 0 ? (
            <SettingRow
              name="Nenhuma feature flag registrada"
              desc="Plugins registram flags para liberar funcionalidade em construção. Nenhum plugin instalado registrou uma."
              control={<span />}
            />
          ) : (
            flags.map(flag => (
              <SettingRow
                key={flag.name}
                name={flag.name}
                desc={`Registrada pelo plugin ${flag.pluginId || 'app'}.`}
                control={
                  <Switch
                    checked={featureFlagsApi.isActive(flag.name)}
                    onChange={checked => {
                      featureFlagsApi.save({
                        states: { [flag.name]: checked ? 1 : 0 },
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
