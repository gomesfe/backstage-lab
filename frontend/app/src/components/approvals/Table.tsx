import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Link } from '@backstage/core-components';
import { ColumnFilter } from '../shared/ColumnFilter';
import type { FiltrosColuna } from '../shared/filtros';
import { SeloAmbiente } from '../shared/SeloAmbiente';
import {
  podeAprovar,
  podeCancelar,
  quemAprovou,
  textoAprovacoes,
} from './helpers';
import { StatusBadge } from './StatusBadge';
import { useStyles } from './styles';
import type { Dialogo, Solicitacao } from './types';

type Props = {
  titulo: string;
  solicitacoes: Solicitacao[];
  colunas: FiltrosColuna;
  onColuna: (coluna: string, valor: string) => void;
  onAbrir: (dialogo: Dialogo) => void;
};

const COLUNAS: [string, string][] = [
  ['recurso', 'Recurso'],
  ['ambiente', 'Ambiente'],
  ['grupo', 'Grupo'],
  ['dono', 'Dono'],
  ['solicitante', 'Solicitante'],
  ['data', 'Solicitada em'],
  ['aprovacoes', 'Aprovações'],
  ['status', 'Status'],
];

export function linkDoMapa(solicitacao: Solicitacao): string {
  return `/provisioning-map?q=${encodeURIComponent(solicitacao.recurso)}`;
}

/** Tabela de solicitações: a mesma nos dois lados, só mudam as ações. */
export function Table({
  titulo,
  solicitacoes,
  colunas,
  onColuna,
  onAbrir,
}: Props) {
  const classes = useStyles();

  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label={titulo}>
        <TableHead>
          <TableRow>
            {COLUNAS.map(([chave, rotulo]) => (
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
            ))}
            <TableCell className={`${classes.th} ${classes.right}`}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {solicitacoes.map(solicitacao => (
            <TableRow key={solicitacao.id} className={classes.row}>
              <TableCell className={classes.td}>
                {solicitacao.noMapa ? (
                  <Link
                    to={linkDoMapa(solicitacao)}
                    className={classes.nameLink}
                    title="Ver no mapa de provisionamento"
                  >
                    {solicitacao.recurso}
                  </Link>
                ) : (
                  <span className={classes.name}>{solicitacao.recurso}</span>
                )}
                <span className={classes.sub}>{solicitacao.oferta}</span>
              </TableCell>
              <TableCell className={classes.td}>
                <SeloAmbiente ambiente={solicitacao.ambiente} />
              </TableCell>
              <TableCell className={classes.td}>{solicitacao.grupo}</TableCell>
              <TableCell className={classes.td}>{solicitacao.dono}</TableCell>
              <TableCell className={classes.td}>
                {solicitacao.solicitante}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {solicitacao.data}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                <span title={quemAprovou(solicitacao)}>
                  {textoAprovacoes(solicitacao)}
                </span>
              </TableCell>
              <TableCell className={classes.td}>
                <StatusBadge status={solicitacao.status} />
              </TableCell>
              <TableCell className={`${classes.td} ${classes.right}`}>
                <span
                  className={classes.actions}
                  style={{ flexWrap: 'nowrap' }}
                >
                  {podeAprovar(solicitacao) && (
                    <>
                      <button
                        type="button"
                        className={classes.pillPrimary}
                        onClick={() =>
                          onAbrir({ tipo: 'aprovar', solicitacao })
                        }
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className={classes.pillDanger}
                        onClick={() =>
                          onAbrir({ tipo: 'rejeitar', solicitacao })
                        }
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {podeCancelar(solicitacao) && (
                    <button
                      type="button"
                      className={classes.pillDanger}
                      onClick={() => onAbrir({ tipo: 'cancelar', solicitacao })}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    className={classes.pill}
                    onClick={() => onAbrir({ tipo: 'detalhes', solicitacao })}
                  >
                    Detalhes
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
