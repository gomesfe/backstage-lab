import type { ReactNode } from 'react';
import type { Entity } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import { SeloCiclo } from '../shared/SeloCiclo';
import { nomeCurto, rotuloDoTipo } from './helpers';
import { useStyles } from './styles';

type Spec = { owner?: string; lifecycle?: string; system?: string };

/** "Sobre": tipo, dono, ciclo de vida, sistema, tags e atalhos (repositório, Sonar, docs). */
export function EntityAbout({
  entidade,
  fornecedores,
}: {
  entidade: Entity;
  fornecedores: Entity[];
}) {
  const classes = useStyles();
  const spec = (entidade.spec ?? {}) as Spec;
  const anotacoes = entidade.metadata.annotations ?? {};
  const tags = entidade.metadata.tags ?? [];
  const ancora = `${entidade.kind.toLowerCase()}-${entidade.metadata.name.toLowerCase()}`;
  const dono = nomeCurto(spec.owner);

  const campos: [string, ReactNode][] = [
    ['Tipo', rotuloDoTipo(entidade)],
    [
      'Dono',
      dono ? (
        <Link to={`/entidade#group-${dono.toLowerCase()}`}>{dono}</Link>
      ) : (
        '—'
      ),
    ],
    [
      'Ciclo de vida',
      spec.lifecycle ? <SeloCiclo ciclo={spec.lifecycle} /> : '—',
    ],
  ];
  if (spec.system) {
    const sistema = nomeCurto(spec.system);
    campos.push([
      'Sistema',
      <Link to={`/entidade#system-${sistema.toLowerCase()}`}>{sistema}</Link>,
    ]);
  }
  if (fornecedores.length) {
    campos.push([
      'Fornecida por',
      fornecedores.map((fornecedor, indice) => (
        <span key={fornecedor.metadata.name}>
          {indice > 0 && ', '}
          <Link
            to={`/entidade#${fornecedor.kind.toLowerCase()}-${fornecedor.metadata.name.toLowerCase()}`}
          >
            {fornecedor.metadata.name}
          </Link>
        </span>
      )),
    ]);
  }
  campos.push([
    'Tags',
    tags.length ? (
      <span className={classes.tags}>
        {tags.map(tag => (
          <Link
            key={tag}
            to={`/catalog?q=${encodeURIComponent(tag)}`}
            className={classes.tag}
          >
            {tag}
          </Link>
        ))}
      </span>
    ) : (
      '—'
    ),
  ]);

  const repositorio = anotacoes['github.com/project-slug'];
  const sonar = anotacoes['sonarqube.org/project-key'];
  const temDocs = Boolean(anotacoes['backstage.io/techdocs-ref']);

  return (
    <section className={classes.card}>
      <h3 className={classes.toolbarTitle}>Sobre</h3>
      {entidade.metadata.description && (
        <p className={classes.texto}>{entidade.metadata.description}</p>
      )}
      <div className={classes.campos}>
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <span className={classes.fieldLabel}>{rotulo}</span>
            <span className={classes.valor}>{valor}</span>
          </div>
        ))}
      </div>
      <div className={classes.botoes}>
        {entidade.kind === 'Group' && (
          <Link
            to={`/catalog?owner=${encodeURIComponent(entidade.metadata.name)}`}
            className={classes.button}
          >
            Ver itens no catálogo
          </Link>
        )}
        {entidade.kind === 'Resource' && (
          <Link
            to={`/provisioning-map?q=${encodeURIComponent(
              entidade.metadata.name,
            )}`}
            className={classes.button}
          >
            Ver no mapa de provisionamento
          </Link>
        )}
        {repositorio && (
          <a
            className={classes.button}
            href={`https://github.com/${repositorio}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Repositório ↗
          </a>
        )}
        {sonar && (
          <a
            className={classes.button}
            href={`https://sonarcloud.io/project/overview?id=${encodeURIComponent(
              sonar,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sonar ↗
          </a>
        )}
        {temDocs && (
          <Link to={`/entidade#${ancora}-docs`} className={classes.button}>
            Documentação
          </Link>
        )}
      </div>
    </section>
  );
}
