import { useLocation } from 'react-router-dom';
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { OffersPage } from './OffersPage';

/**
 * A rota /create do portal. Só o índice é nosso (a galeria de ofertas); tudo
 * abaixo dele — o formulário de cada oferta, a página da tarefa, o editor —
 * continua sendo o do scaffolder, que é quem executa a oferta.
 */
export function CreatePage() {
  const { pathname } = useLocation();
  const ehIndice = pathname === '/create' || pathname === '/create/';
  return ehIndice ? <OffersPage /> : <ScaffolderPage />;
}
