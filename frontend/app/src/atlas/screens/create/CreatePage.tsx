import { useLocation } from 'react-router-dom';
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { AtlasHtmlScreen } from '../../shell/html/AtlasHtmlScreen';

/**
 * A rota /create do portal.
 *
 * Só o índice é a tela HTML (`index.html`, a galeria de ofertas). Tudo abaixo
 * dele — o formulário de cada oferta, a página da tarefa, o editor — continua
 * sendo o do scaffolder: é ele que executa a oferta.
 */
export function AtlasCreatePage() {
  const { pathname } = useLocation();
  const isIndex = pathname === '/create' || pathname === '/create/';

  return isIndex ? <AtlasHtmlScreen slug="create" /> : <ScaffolderPage />;
}
