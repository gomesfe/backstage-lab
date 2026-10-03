import ArrowIcon from '@material-ui/icons/CallMade';
import SearchIcon from '@material-ui/icons/Search';
import {
  Content,
  Link,
  Page,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useBusca } from './hooks/useBusca';
import { useStyles } from './styles';

const TIPOS: { id: string; rotulo: string }[] = [
  { id: '', rotulo: 'Tudo' },
  { id: 'software-catalog', rotulo: 'Catálogo' },
  { id: 'techdocs', rotulo: 'Docs' },
];

const ROTULO_RESULTADO: Record<string, string> = {
  'software-catalog': 'catálogo',
  techdocs: 'docs',
};

/** Busca global: serviços, APIs e documentação em todo o portal. */
export function SearchPage() {
  const classes = useStyles();
  const {
    termo,
    setTermo,
    aplicado,
    tipo,
    mudarTipo,
    resultados,
    semIndice,
    loading,
    error,
  } = useBusca();

  let conteudo;
  if (error) conteudo = <ResponseErrorPanel error={error} />;
  else if (loading) {
    conteudo = (
      <div className={classes.resultados} aria-hidden>
        {[85, 75, 65].map(largura => (
          <div
            key={largura}
            className={classes.esqueleto}
            style={{ width: `${largura}%` }}
          />
        ))}
      </div>
    );
  } else if (!aplicado)
    conteudo = (
      <div className={classes.empty}>
        Digite para buscar no catálogo e na documentação.
      </div>
    );
  else if (semIndice)
    conteudo = (
      <div className={classes.empty}>
        Ainda não há o que buscar neste tipo: nada foi indexado para ele.
      </div>
    );
  else if (resultados.length === 0)
    conteudo = (
      <div className={classes.empty}>Nenhum resultado para “{aplicado}”.</div>
    );
  else {
    conteudo = (
      <div className={classes.resultados}>
        <span className={classes.metricSub}>
          {resultados.length}{' '}
          {resultados.length === 1 ? 'resultado' : 'resultados'} para “
          {aplicado}”
        </span>
        {resultados.map(resultado => (
          <Link
            key={`${resultado.type}-${resultado.document.location}`}
            to={resultado.document.location}
            className={classes.resultado}
          >
            <span style={{ minWidth: 0 }}>
              <span className={classes.resultadoTitulo}>
                {resultado.document.title}
                <span
                  className={
                    resultado.type === 'techdocs'
                      ? classes.badgeInfo
                      : classes.badgeLime
                  }
                >
                  {ROTULO_RESULTADO[resultado.type] ?? resultado.type}
                </span>
              </span>
              <span className={classes.trecho}>{resultado.document.text}</span>
            </span>
            <ArrowIcon style={{ fontSize: 16 }} />
          </Link>
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
              <span className={classes.eyebrow}>Busca global</span>
              <h1 className={classes.title}>Buscar</h1>
              <p className={classes.subtitle}>
                Encontre serviços, APIs e documentação em todo o portal.
              </p>
            </div>
          </div>

          <section className={classes.card}>
            <label className={classes.search} style={{ flex: 'none' }}>
              <SearchIcon style={{ fontSize: 18 }} />
              <input
                type="search"
                aria-label="Buscar no Atlas"
                placeholder="Buscar serviços, APIs e documentação"
                value={termo}
                onChange={evento => setTermo(evento.target.value)}
              />
            </label>
            <div
              className={classes.tabs}
              role="tablist"
              aria-label="Tipo de resultado"
            >
              {TIPOS.map(item => (
                <button
                  key={item.id || 'tudo'}
                  type="button"
                  role="tab"
                  aria-selected={tipo === item.id}
                  className={`${classes.tab} ${
                    tipo === item.id ? classes.tabActive : ''
                  }`}
                  onClick={() => mudarTipo(item.id)}
                >
                  {item.rotulo}
                </button>
              ))}
            </div>
            {conteudo}
          </section>
        </div>
      </Content>
    </Page>
  );
}
