import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { useEffect } from 'react';
import {
  appThemeApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import type { SignInPageProps } from '@backstage/core-plugin-api';
import type { IdentityProviders } from '@backstage/core-components';

/**
 * Tela de login do portal.
 *
 * Dois caminhos, de propósito:
 *  - GitHub, o caminho normal. Traz o username, que o backend resolve para
 *    `user:default/<username>` e é o que o RBAC usa para achar suas roles.
 *  - Guest, escada de incêndio. Entra sem rede e sem OAuth configurado, mas
 *    cai em `user:development/guest`, que no rbac-policy.csv só tem leitura.
 */
/**
 * Fora do componente de propósito: uma lista nova a cada render reinicia o
 * login silencioso do SignInPage, que ao ser cancelado apaga o provedor
 * lembrado — e o convidado perdia a sessão a cada recarga da página.
 */
const PROVEDORES: IdentityProviders = [
  'guest',
  {
    id: 'github-auth-provider',
    title: 'GitHub',
    message: 'Entrar com sua conta do GitHub',
    apiRef: githubAuthApiRef,
  },
];

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => {
      const { SignInPage } = await import('@backstage/core-components');
      const { AtlasLogo } = await import('../../components');
      const { useTheme } = await import('@material-ui/core/styles');
      // SignInPage aceita um provider só ou vários; a sobrecarga de vários é a
      // que queremos, e o TS não a infere sozinho a partir de SignInPageProps.
      return function AtlasSignInPage(props: SignInPageProps) {
        // O login pode renderizar fora do .atlas-root do app: abre um próprio,
        // para o logo (currentColor) e as cores do DS existirem aqui.
        const theme = useTheme();
        const appThemeApi = useApi(appThemeApiRef);
        // Sem tema escolhido, o Atlas é escuro. Decidir isso aqui, antes do
        // login: se o tema mudar depois, a árvore remonta, o SignInPage
        // cancela o login silencioso e apaga o provedor lembrado — e o F5
        // voltava para esta tela.
        useEffect(() => {
          if (!appThemeApi.getActiveThemeId()) {
            appThemeApi.setActiveThemeId('dark');
          }
        }, [appThemeApi]);
        return (
          <div
            className="atlas-root atlas-signIn"
            data-theme={theme.palette.type === 'light' ? 'light' : 'dark'}
          >
            <div className="atlas-signInBrand">
              <AtlasLogo variant="vertical" />
            </div>
            <SignInPage
              {...props}
              title="Entrar"
              align="center"
              providers={PROVEDORES}
            />
          </div>
        );
      };
    },
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [signInPage],
});
