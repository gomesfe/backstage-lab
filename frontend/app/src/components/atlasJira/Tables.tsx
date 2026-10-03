import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { linkDaIssue, TOM_STATUS, TOM_TIPO } from './helpers';
import { Selo } from './Selo';
import { useStyles } from './styles';
import type { Card, Dialogo, Rascunho } from './types';

function Cabecalho({ colunas }: { colunas: string[] }) {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        {colunas.map((coluna, indice) => (
          <TableCell
            key={coluna}
            className={`${classes.th} ${
              indice === colunas.length - 1 ? classes.right : ''
            }`}
          >
            {coluna}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function Origem({ origem }: { origem: string }) {
  const classes = useStyles();
  return (
    <a
      href={linkDaIssue(origem)}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.origem}
    >
      {origem}
    </a>
  );
}

/** Rascunhos: issues importadas, com Criar card e Descartar. */
export function DraftsTable({
  rascunhos,
  onAbrir,
}: {
  rascunhos: Rascunho[];
  onAbrir: (dialogo: Dialogo) => void;
}) {
  const classes = useStyles();
  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label="Rascunhos">
        <Cabecalho
          colunas={[
            'Origem',
            'Solicitante da execução',
            'Título',
            'Tipo',
            'Data de importação',
            'Ação',
          ]}
        />
        <TableBody>
          {rascunhos.map(rascunho => (
            <TableRow key={rascunho.id} className={classes.row}>
              <TableCell className={classes.td}>
                <Origem origem={rascunho.origem} />
              </TableCell>
              <TableCell className={classes.td}>
                {rascunho.solicitante}
              </TableCell>
              <TableCell className={classes.td}>
                <button
                  type="button"
                  className={classes.tituloBotao}
                  onClick={() => onAbrir({ tipo: 'rascunho', rascunho })}
                >
                  {rascunho.titulo}
                </button>
              </TableCell>
              <TableCell className={classes.td}>
                <Selo tom={TOM_TIPO[rascunho.tipo]}>{rascunho.tipo}</Selo>
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {rascunho.importadoEm}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.right}`}>
                <span
                  className={classes.actions}
                  style={{ flexWrap: 'nowrap' }}
                >
                  <button
                    type="button"
                    className={classes.pillPrimary}
                    onClick={() => onAbrir({ tipo: 'criar', rascunho })}
                  >
                    Criar card
                  </button>
                  <button
                    type="button"
                    className={classes.pillDanger}
                    onClick={() => onAbrir({ tipo: 'descartar', rascunho })}
                  >
                    Descartar
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

/** Cards abertos no Jira. */
export function CardsTable({
  cards,
  onAbrir,
}: {
  cards: Card[];
  onAbrir: (dialogo: Dialogo) => void;
}) {
  const classes = useStyles();
  return (
    <div className={classes.tableWrap}>
      <MuiTable
        className={classes.table}
        size="small"
        aria-label="Cards abertos"
      >
        <Cabecalho
          colunas={[
            'Card',
            'Título',
            'Tipo',
            'Status',
            'Responsável',
            'Origem',
            'Criado em',
            'Ação',
          ]}
        />
        <TableBody>
          {cards.map(card => (
            <TableRow key={card.chave} className={classes.row}>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                <span className={classes.name}>{card.chave}</span>
              </TableCell>
              <TableCell className={classes.td}>{card.titulo}</TableCell>
              <TableCell className={classes.td}>
                <Selo tom={TOM_TIPO[card.tipo]}>{card.tipo}</Selo>
              </TableCell>
              <TableCell className={classes.td}>
                <Selo tom={TOM_STATUS[card.status]}>{card.status}</Selo>
              </TableCell>
              <TableCell className={classes.td}>{card.responsavel}</TableCell>
              <TableCell className={classes.td}>
                <Origem origem={card.origem} />
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {card.criadoEm}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.right}`}>
                <button
                  type="button"
                  className={classes.pill}
                  onClick={() => onAbrir({ tipo: 'card', card })}
                >
                  Detalhes
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </div>
  );
}
