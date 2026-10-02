import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { useStyles } from './styles';
import type { ItemInterno } from './types';

/** Recursos e repositórios que o próprio time do Atlas usa (aba restrita ao time). */
export function InternalTable({ itens }: { itens: ItemInterno[] }) {
  const classes = useStyles();

  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label="Interno do Atlas">
        <TableHead>
          <TableRow>
            {['Nome', 'Tipo', 'Oferta', 'Ambientes'].map(titulo => (
              <TableCell key={titulo} className={classes.th}>
                {titulo}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {itens.map(item => (
            <TableRow key={item.nome} className={classes.row}>
              <TableCell className={classes.td}>
                <span className={classes.name}>{item.nome}</span>
              </TableCell>
              <TableCell className={classes.td}>{item.tipo}</TableCell>
              <TableCell className={classes.td}>{item.oferta}</TableCell>
              <TableCell className={classes.td}>
                {item.ambientes.length ? (
                  <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                    {item.ambientes.map(ambiente => (
                      <span key={ambiente} className={classes.envBadge}>
                        {ambiente}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={classes.envEmpty}>—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </div>
  );
}
