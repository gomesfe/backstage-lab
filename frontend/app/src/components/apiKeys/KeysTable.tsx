import { useState } from 'react';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import type { Chave } from './api';
import { expiraEmBreve, formatarData, ROTULO_STATUS } from './helpers';
import { useStyles } from './styles';

type Props = {
  chaves: Chave[];
  onRevogar: (chave: Chave) => Promise<void>;
};

const COLUNAS = [
  'Nome',
  'Chave',
  'Status',
  'Dono',
  'Criada em',
  'Expira em',
  'Último uso',
];

/** As chaves. Revogar é irreversível: o primeiro clique pede confirmação na própria linha. */
export function KeysTable({ chaves, onRevogar }: Props) {
  const classes = useStyles();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [revogando, setRevogando] = useState<string | null>(null);

  const selo = (chave: Chave) => {
    if (expiraEmBreve(chave))
      return <span className={classes.badgeWarn}>expira em breve</span>;
    if (chave.status === 'active')
      return <span className={classes.badgeLime}>{ROTULO_STATUS.active}</span>;
    if (chave.status === 'revoked')
      return (
        <span className={classes.badgeDanger}>{ROTULO_STATUS.revoked}</span>
      );
    return <span className={classes.badgeWarn}>{ROTULO_STATUS.expired}</span>;
  };

  const acoes = (chave: Chave) => {
    if (chave.status !== 'active')
      return <span className={classes.muted}>—</span>;
    if (confirmando !== chave.id) {
      return (
        <button
          type="button"
          className={classes.pillDanger}
          onClick={() => setConfirmando(chave.id)}
        >
          Revogar
        </button>
      );
    }
    return (
      <span className={classes.actions} style={{ flexWrap: 'nowrap' }}>
        <span className={classes.confirmar}>Revogar?</span>
        <button
          type="button"
          className={classes.pillDanger}
          disabled={revogando === chave.id}
          onClick={async () => {
            setRevogando(chave.id);
            try {
              await onRevogar(chave);
            } finally {
              setRevogando(null);
              setConfirmando(null);
            }
          }}
        >
          {revogando === chave.id ? 'Revogando…' : 'Sim, revogar'}
        </button>
        <button
          type="button"
          className={classes.pill}
          onClick={() => setConfirmando(null)}
        >
          Cancelar
        </button>
      </span>
    );
  };

  return (
    <div className={classes.tableWrap}>
      <MuiTable className={classes.table} size="small" aria-label="API Keys">
        <TableHead>
          <TableRow>
            {COLUNAS.map(coluna => (
              <TableCell key={coluna} className={classes.th}>
                {coluna}
              </TableCell>
            ))}
            <TableCell className={`${classes.th} ${classes.right}`}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chaves.map(chave => (
            <TableRow key={chave.id} className={classes.row}>
              <TableCell className={classes.td}>
                <span className={classes.name}>{chave.description}</span>
              </TableCell>
              <TableCell className={classes.td}>
                <span className={classes.prefixo}>{chave.prefix}…</span>
              </TableCell>
              <TableCell className={classes.td}>{selo(chave)}</TableCell>
              <TableCell className={classes.td}>
                {chave.owner.replace(/^user:(default\/)?/, '')}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {formatarData(chave.createdAt)}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {chave.expiresAt ? formatarData(chave.expiresAt) : 'nunca'}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.nowrap}`}>
                {chave.lastUsedAt
                  ? formatarData(chave.lastUsedAt)
                  : 'nunca usada'}
              </TableCell>
              <TableCell className={`${classes.td} ${classes.right}`}>
                {acoes(chave)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </div>
  );
}
