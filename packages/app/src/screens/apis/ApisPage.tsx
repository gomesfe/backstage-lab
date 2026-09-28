import { EntityTablePage } from '../_shared/EntityTablePage';

/** APIs publicadas. O que a tela deve conter está em `README.md`. */
export function ApisPage() {
  return (
    <EntityTablePage
      eyebrow="Explorer"
      title="APIs"
      subtitle="Explore, versione e consuma as APIs publicadas no portal."
      kinds={['API']}
      emptyMessage="Nenhuma API registrada. Declare uma entidade kind: API no catalog-info.yaml do serviço."
    />
  );
}
