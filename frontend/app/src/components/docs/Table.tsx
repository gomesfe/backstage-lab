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
import { linkDoDocumento, ROTULO_TIPO } from './helpers';
import type { Documento } from './types';

type Props = {
  documentos: Documento[];
  favoritos: Set<string>;
  colunas: FiltrosColuna;
  onColuna: (coluna: string, valor: string) => void;
  onFavorito: (documento: Documento) => void;
};

const COLUNAS: [string, string][] = [
  ['nome', 'Nome'],
  ['descricao', 'Descrição'],
  ['tipo', 'Tipo'],
  ['subtipo', 'Subtipo'],
  ['dono', 'Dono'],
  ['cicloDeVida', 'Ciclo de vida'],
  ['tags', 'Tags'],
];

/** O que publica documentação: o nome abre a documentação da entidade. */
export function Table({ documentos, favoritos, colunas, onColuna, onFavorito }: Props) {
  const classes = useAtlasStyles();

  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label="Documentação">
        <TableHead>
          <TableRow>
            {COLUNAS.map(([chave, rotulo]) => (
              <TableCell key={chave} className={classes.th}>
                <span className={classes.thInner}>
                  {rotulo}
                  <ColumnFilter label={rotulo} value={colunas[chave] ?? ''} onChange={valor => onColuna(chave, valor)} />
                </span>
              </TableCell>
            ))}
            <TableCell className={`${classes.th} ${classes.right}`}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documentos.map(documento => {
            const favorito = favoritos.has(documento.ancora);
            return (
              <TableRow key={documento.ancora} className={classes.row}>
                <TableCell className={classes.td}>
                  <Link to={linkDoDocumento(documento)} className={classes.nameLink}>
                    {documento.nome}
                  </Link>
                </TableCell>
                <TableCell className={`${classes.td} ${classes.muted}`}>{documento.descricao}</TableCell>
                <TableCell className={classes.td}>{ROTULO_TIPO[documento.tipo]}</TableCell>
                <TableCell className={classes.td}>{documento.subtipo}</TableCell>
                <TableCell className={classes.td}>{documento.dono}</TableCell>
                <TableCell className={classes.td}>
                  <SeloCiclo ciclo={documento.cicloDeVida} />
                </TableCell>
                <TableCell className={classes.td}>
                  <span className={classes.tags}>
                    {documento.tags.map(tag => (
                      <span key={tag} className={classes.tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                </TableCell>
                <TableCell className={`${classes.td} ${classes.right}`}>
                  <span className={classes.actions} style={{ flexWrap: 'nowrap' }}>
                    <button
                      type="button"
                      className={`${classes.iconButton} ${favorito ? classes.estrelaAtiva : ''}`}
                      aria-pressed={favorito}
                      title={favorito ? 'Tirar dos favoritos' : 'Favoritar'}
                      aria-label={`${favorito ? 'Tirar dos favoritos' : 'Favoritar'} ${documento.nome}`}
                      onClick={() => onFavorito(documento)}
                    >
                      {favorito ? '★' : '☆'}
                    </button>
                    <Link to={linkDoDocumento(documento)} className={classes.iconButton} title="Abrir" aria-label={`Abrir ${documento.nome}`}>
                      ↗
                    </Link>
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </MuiTable>
    </div>
  );
}
