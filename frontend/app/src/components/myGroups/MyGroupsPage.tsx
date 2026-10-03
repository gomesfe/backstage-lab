import PeopleIcon from '@material-ui/icons/People';
import CloudIcon from '@material-ui/icons/CloudQueue';
import {
  Content,
  Link,
  Page,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useMeusGrupos } from './hooks/useMeusGrupos';
import { useStyles } from './styles';

/** Meus grupos: a que times eu pertenço e o que é nosso no catálogo. */
export function MyGroupsPage() {
  const classes = useStyles();
  const { grupos, loading, error } = useMeusGrupos();

  let conteudo;
  if (error) {
    conteudo = <ResponseErrorPanel error={error} />;
  } else if (loading) {
    conteudo = (
      <div className={classes.grid} aria-hidden>
        {[1, 2, 3].map(item => (
          <article key={item} className={classes.cartao}>
            <div className={classes.esqueleto} style={{ width: '40%' }} />
            <div className={classes.esqueleto} style={{ width: '80%' }} />
            <div className={classes.esqueleto} style={{ width: '60%' }} />
          </article>
        ))}
      </div>
    );
  } else if (grupos.length === 0) {
    conteudo = (
      <section className={classes.card}>
        <div className={classes.empty}>
          <strong className={classes.alertTitle}>
            Você ainda não está em nenhum grupo.
          </strong>
          Grupos vêm do catálogo: adicione seu usuário a um <code>Group</code>{' '}
          em <code>examples/org.yaml</code>. Sem grupo, o RBAC também não
          encontra suas permissões.
        </div>
      </section>
    );
  } else {
    conteudo = (
      <div className={classes.grid}>
        {grupos.map(grupo => (
          <article key={grupo.ref} className={classes.cartao}>
            <div className={classes.selos}>
              <span className={classes.badgeLime}>membro</span>
              {grupo.tipo && (
                <span className={classes.badgeInfo}>{grupo.tipo}</span>
              )}
            </div>
            <div className={classes.titulo}>{grupo.titulo}</div>
            <div className={classes.texto}>
              {grupo.descricao ?? 'Sem descrição no catálogo.'}
            </div>
            <div className={classes.rodape}>
              <span className={classes.tag} title="Membros">
                <PeopleIcon style={{ fontSize: 12, verticalAlign: -2 }} />{' '}
                {grupo.membros}
              </span>
              <span className={classes.tag} title="Itens no catálogo">
                <CloudIcon style={{ fontSize: 12, verticalAlign: -2 }} />{' '}
                {grupo.itens}
              </span>
              <span className={classes.botoes}>
                <Link
                  to={`/catalog?owner=${encodeURIComponent(grupo.nome)}`}
                  className={classes.pill}
                >
                  Ver itens
                </Link>
                <Link
                  to={`/entidade#group-${grupo.nome.toLowerCase()}`}
                  className={classes.pillPrimary}
                >
                  Abrir
                </Link>
              </span>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Organização</span>
              <h1 className={classes.title}>Meus grupos</h1>
              <p className={classes.subtitle}>
                Os grupos e squads dos quais você faz parte, e o que cada um
                mantém no catálogo.
              </p>
            </div>
          </div>
          {conteudo}
        </div>
      </Content>
    </Page>
  );
}
