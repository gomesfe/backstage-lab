import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import type { SignInPageProps } from '@backstage/core-plugin-api';

/**
 * Tela de login do portal.
 *
 * Dois caminhos, de propósito:
 *  - GitHub, o caminho normal. Traz o username, que o backend resolve para
 *    `user:default/<username>` e é o que o RBAC usa para achar suas roles.
 *  - Guest, escada de incêndio. Entra sem rede e sem OAuth configurado, mas
 *    cai em `user:development/guest`, que no rbac-policy.csv só tem leitura.
 */
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
              providers={[
                'guest',
                {
                  id: 'github-auth-provider',
                  title: 'GitHub',
                  message: 'Entrar com sua conta do GitHub',
                  apiRef: githubAuthApiRef,
                },
              ]}
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
