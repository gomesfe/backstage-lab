import type { ReactNode } from 'react';
import useObservable from 'react-use/lib/useObservable';
import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';

/**
 * Envolve a app inteira no `.atlas-root` do design system.
 *
 * O `atlas.css` declara todas as variáveis (`--bg-card`, `--lime`, …) dentro
 * de `.atlas-root`, e a variante clara em `[data-theme="light"]`. Sem este
 * wrapper nenhuma classe do DS resolve cor alguma — os componentes renderizam
 * sem fundo e sem borda, o que parece "CSS não carregou" e não é.
 *
 * O `data-theme` acompanha o tema escolhido no Backstage, para o DS e o MUI
 * nunca ficarem em modos diferentes.
 */
export function AtlasRootWrapper({ children }: { children: ReactNode }) {
  const appThemeApi = useApi(appThemeApiRef);
  const activeThemeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const isLight = activeThemeId
    ? appThemeApi
        .getInstalledThemes()
        .find(theme => theme.id === activeThemeId)?.variant === 'light'
    : false;

  return (
    <div className="atlas-root" data-theme={isLight ? 'light' : 'dark'}>
      {children}
    </div>
  );
}
