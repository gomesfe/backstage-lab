import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Link } from '@backstage/core-components';
import { ColumnFilter } from '../shared/ColumnFilter';
import type { FiltrosColuna } from '../shared/filtros';
import { SeloCiclo } from '../shared/SeloCiclo';
import { useAtlasStyles } from '../shared/styles';
import { linkDaEntidade, ROTULO_COLUNA, ROTULO_TIPO } from './helpers';
import type { Coluna, Entidade } from './types';

/** Tags mostradas por linha; o resto vira "+N". */
const MAX_TAGS = 3;

type Props = {
  titulo: string;
  entidades: Entidade[];
  colunas: Coluna[];
  filtrosColuna: FiltrosColuna;
  onFiltroColuna: (coluna: string, valor: string) => void;
  /** O nome abre a documentação em vez da tela da entidade. */
  abrirDocs?: boolean;
  /** Sem links nem favoritos (itens internos, que não têm tela de entidade). */
  somenteLeitura?: boolean;
  ehFavorita: (entidade: Entidade) => boolean;
  onFavorito: (entidade: Entidade) => void;
};

/** Tabela de entidades do catálogo: base de Catálogo, APIs e Docs. */
export function EntityTable({
  titulo,
  entidades,
  colunas,
  filtrosColuna,
  onFiltroColuna,
  abrirDocs = false,
  somenteLeitura = false,
  ehFavorita,
  onFavorito,
}: Props) {
  const classes = useAtlasStyles();

  const celula = (entidade: Entidade, coluna: Coluna) => {
    switch (coluna) {
      case 'nome':
        return somenteLeitura ? (
          <span className={classes.name}>{entidade.nome}</span>
        ) : (
          <Link
            to={linkDaEntidade(entidade, abrirDocs)}
            className={classes.nameLink}
          >
            {entidade.nome}
          </Link>
        );
      case 'descricao':
        return (
          <span className={classes.muted}>{entidade.descricao || '—'}</span>
        );
      case 'tipo':
        return ROTULO_TIPO[entidade.tipo] ?? entidade.tipo;
      case 'ciclo':
        return entidade.ciclo ? (
          <SeloCiclo ciclo={entidade.ciclo} />
        ) : (
          <span className={classes.muted}>—</span>
        );
      case 'tags':
        if (!entidade.tags.length)
          return <span className={classes.muted}>—</span>;
        return (
          <span className={classes.tags} title={entidade.tags.join(', ')}>
            {entidade.tags.slice(0, MAX_TAGS).map(tag => (
              <span key={tag} className={classes.tag}>
                {tag}
              </span>
            ))}
            {entidade.tags.length > MAX_TAGS && (
              <span className={classes.tag}>
                +{entidade.tags.length - MAX_TAGS}
              </span>
            )}
          </span>
        );
      default:
        return entidade[coluna] || <span className={classes.muted}>—</span>;
    }
  };

  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label={titulo}>
        <TableHead>
          <TableRow>
            {colunas.map(coluna => (
              <TableCell key={coluna} className={classes.th}>
                <span className={classes.thInner}>
                  {ROTULO_COLUNA[coluna]}
                  <ColumnFilter
                    label={ROTULO_COLUNA[coluna]}
                    value={filtrosColuna[coluna] ?? ''}
                    onChange={valor => onFiltroColuna(coluna, valor)}
                  />
                </span>
              </TableCell>
            ))}
            {!somenteLeitura && (
              <TableCell className={`${classes.th} ${classes.right}`}>
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {entidades.map(entidade => {
            const favorita = ehFavorita(entidade);
            return (
              <TableRow key={entidade.ref} className={classes.row}>
                {colunas.map(coluna => (
                  <TableCell key={coluna} className={classes.td}>
                    {celula(entidade, coluna)}
                  </TableCell>
                ))}
                {!somenteLeitura && (
                  <TableCell className={`${classes.td} ${classes.right}`}>
                    <span
                      className={classes.actions}
                      style={{ flexWrap: 'nowrap' }}
                    >
                      <button
                        type="button"
                        className={`${classes.iconButton} ${
                          favorita ? classes.estrelaAtiva : ''
                        }`}
                        aria-pressed={favorita}
                        title={favorita ? 'Tirar dos favoritos' : 'Favoritar'}
                        aria-label={`${
                          favorita ? 'Tirar dos favoritos' : 'Favoritar'
                        } ${entidade.nome}`}
                        onClick={() => onFavorito(entidade)}
                      >
                        {favorita ? '★' : '☆'}
                      </button>
                      <Link
                        to={linkDaEntidade(entidade, abrirDocs)}
                        className={classes.iconButton}
                        title="Abrir"
                        aria-label={`Abrir ${entidade.nome}`}
                      >
                        ↗
                      </Link>
                    </span>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </MuiTable>
    </div>
  );
}
