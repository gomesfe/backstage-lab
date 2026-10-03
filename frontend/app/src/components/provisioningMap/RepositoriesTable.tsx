import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { ColumnFilter } from '../shared/ColumnFilter';
import { useStyles } from './styles';
import type { FiltrosColuna, Repositorio } from './types';

type Props = {
  repositorios: Repositorio[];
  servicos: Record<string, string>;
  colunas: FiltrosColuna;
  onColuna: (coluna: string, valor: string) => void;
  onDetalhes: (repositorio: Repositorio) => void;
  onExcluir: (repositorio: Repositorio) => void;
};

/** Tabela de repositórios sem IaC. */
export function RepositoriesTable({
  repositorios,
  servicos,
  colunas,
  onColuna,
  onDetalhes,
  onExcluir,
}: Props) {
  const classes = useStyles();
  const cabecalho = (chave: string, rotulo: string) => (
    <TableCell key={chave} className={classes.th}>
      <span className={classes.thInner}>
        {rotulo}
        <ColumnFilter
          label={rotulo}
          value={colunas[chave] ?? ''}
          onChange={valor => onColuna(chave, valor)}
        />
      </span>
    </TableCell>
  );

  return (
    <div className={classes.tableWrap}>
      <MuiTable
        className={classes.table}
        size="small"
        aria-label="Repositórios"
      >
        <TableHead>
          <TableRow>
            {cabecalho('nome', 'Repositório')}
            {cabecalho('servico', 'Serviço Núclea')}
            {cabecalho('oferta', 'Oferta')}
            <TableCell className={`${classes.th} ${classes.right}`}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repositorios.map(repositorio => (
            <TableRow key={repositorio.nome} className={classes.row}>
              <TableCell className={classes.td}>
                <span className={classes.name}>{repositorio.nome}</span>
              </TableCell>
              <TableCell className={classes.td}>
                <span
                  className={classes.sigla}
                  title={servicos[repositorio.servico]}
                >
                  {repositorio.servico}
                </span>
              </TableCell>
              <TableCell className={classes.td}>{repositorio.oferta}</TableCell>
              <TableCell className={`${classes.td} ${classes.right}`}>
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  <button
                    type="button"
                    className={classes.pill}
                    onClick={() => onDetalhes(repositorio)}
                  >
                    Detalhes
                  </button>
                  <button
                    type="button"
                    className={classes.pillDanger}
                    onClick={() => onExcluir(repositorio)}
                  >
                    <DeleteIcon style={{ fontSize: 13 }} /> Excluir
                  </button>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </div>
  );
}
