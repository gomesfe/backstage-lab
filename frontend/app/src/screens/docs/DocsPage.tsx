import { EntityTablePage } from '../_shared/EntityTablePage';

/**
 * Índice de documentação. O que a tela deve conter está em `README.md`.
 *
 * O nome leva direto ao leitor do TechDocs, não à página da entidade: quem
 * está em "Docs" quer ler a documentação.
 */
export function DocsPage() {
  return (
    <EntityTablePage
      eyebrow="TechDocs"
      title="Docs"
      subtitle="Documentação técnica versionada junto ao código dos componentes."
      kinds={['Component', 'System', 'API']}
      requireTechdocs
      openIn="docs"
      emptyMessage="Nenhum componente publica TechDocs. Falta a anotação backstage.io/techdocs-ref no catalog-info.yaml."
    />
  );
}
