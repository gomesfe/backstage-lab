import { EntityTablePage } from '../_shared/EntityTablePage';

/** Catálogo em tabela. O que a tela deve conter está em `README.md`. */
export function CatalogPage() {
  return (
    <EntityTablePage
      eyebrow="Descoberta"
      title="Catálogo"
      subtitle="Aplicações, sistemas, recursos e squads registrados no portal."
      kinds={['Component', 'System', 'Resource', 'Group']}
      emptyMessage="Nenhuma entidade registrada. Use um template em Create."
    />
  );
}
