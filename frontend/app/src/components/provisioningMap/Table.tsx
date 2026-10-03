import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import PendingIcon from '@material-ui/icons/Schedule';
import AddIcon from '@material-ui/icons/Add';
import { ColumnFilter } from '../shared/ColumnFilter';
import { AMBIENTES, FREE_DELETE_WINDOW_HOURS, soData } from './helpers';
import { useStyles } from './styles';
import type { Ambiente, EstadoAmbiente, FiltrosColuna, Recurso } from './types';

type Props = {
  recursos: Recurso[];
  servicos: Record<string, string>;
  colunas: FiltrosColuna;
  onColuna: (coluna: string, valor: string) => void;
  onPromover: (recurso: Recurso, ambiente: Ambiente) => void;
  onExcluir: (recurso: Recurso, ambiente: Ambiente) => void;
  onDetalhesAmbiente: (recurso: Recurso, ambiente: Ambiente) => void;
  onDetalhes: (recurso: Recurso) => void;
};

type CelulaProps = {
  estado: EstadoAmbiente;
  ambiente: Ambiente;
  onPromover: () => void;
  onExcluir: () => void;
  onDetalhes: () => void;
};

/** Um ambiente de um recurso: data + Excluir + Detalhes, pendente, ou Promover. */
function CelulaAmbiente({
  estado,
  ambiente,
  onPromover,
  onExcluir,
  onDetalhes,
}: CelulaProps) {
  const classes = useStyles();

  if (estado.tipo === 'vazio') {
    return (
      <span className={classes.envCell}>
        <span className={classes.envEmpty}>—</span>
        <button
          type="button"
          className={classes.pillAdd}
          onClick={onPromover}
          title={`Promover para ${ambiente}`}
        >
          <AddIcon style={{ fontSize: 13 }} /> Promover
        </button>
      </span>
    );
  }

  const pendente =
    estado.tipo === 'exclusaoPendente' || estado.tipo === 'aguardandoCloud';
  return (
    <span className={classes.envCell}>
      <span className={classes.envDate} title={estado.data}>
        {soData(estado.data)}
      </span>
      {pendente ? (
        <span
          className={classes.pillWarn}
          role="img"
          aria-label={
            estado.tipo === 'exclusaoPendente'
              ? 'Exclusão pendente'
              : 'Aguardando aprovação do time de cloud'
          }
          title={
            estado.tipo === 'exclusaoPendente'
              ? 'Exclusão pendente: solicitação registrada'
              : 'Aguardando aprovação do time de cloud'
          }
        >
          <PendingIcon style={{ fontSize: 13 }} />{' '}
          {estado.tipo === 'exclusaoPendente' ? 'Pendente' : 'Aguard. cloud'}
        </span>
      ) : (
        <button
          type="button"
          className={classes.pillDanger}
          onClick={onExcluir}
          title={
            estado.tipo === 'provisionado' && estado.exclusaoLivre
              ? `Provisionado há menos de ${FREE_DELETE_WINDOW_HOURS} h: sai sem aprovação`
              : `Precisa de aprovação (provisionado há mais de ${FREE_DELETE_WINDOW_HOURS} h)`
          }
        >
          <DeleteIcon style={{ fontSize: 13 }} /> Excluir
        </button>
      )}
      <button
        type="button"
        className={classes.pill}
        onClick={onDetalhes}
        title="Detalhes da promoção"
      >
        Detalhes
      </button>
    </span>
  );
}

/** Tabela de recursos com IaC: uma coluna por ambiente. */
export function Table({
  recursos,
  servicos,
  colunas,
  onColuna,
  onPromover,
  onExcluir,
  onDetalhesAmbiente,
  onDetalhes,
}: Props) {
  const classes = useStyles();
  const cabecalho = (
    chave: string,
    rotulo: string,
    alinhamento: 'left' | 'center' = 'left',
  ) => (
    <TableCell
      key={chave}
      className={`${classes.th} ${
        alinhamento === 'center' ? classes.center : ''
      }`}
    >
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
      <MuiTable className={classes.table} size="small" aria-label="Recursos">
        <TableHead>
          <TableRow>
            {cabecalho('nome', 'Nome do recurso')}
            {cabecalho('servico', 'Serviço Núclea')}
            {cabecalho('oferta', 'Oferta')}
            {AMBIENTES.map(ambiente => cabecalho(ambiente, ambiente, 'center'))}
            <TableCell className={`${classes.th} ${classes.right}`}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recursos.map(recurso => (
            <TableRow key={recurso.nome} className={classes.row}>
              <TableCell className={classes.td}>
                <span className={classes.name}>{recurso.nome}</span>
              </TableCell>
              <TableCell className={classes.td}>
                <span
                  className={classes.sigla}
                  title={servicos[recurso.servico]}
                >
                  {recurso.servico}
                </span>
              </TableCell>
              <TableCell className={classes.td}>{recurso.oferta}</TableCell>
              {AMBIENTES.map(ambiente => (
                <TableCell
                  key={ambiente}
                  className={`${classes.td} ${classes.center}`}
                >
                  <CelulaAmbiente
                    estado={recurso.ambientes[ambiente]}
                    ambiente={ambiente}
                    onPromover={() => onPromover(recurso, ambiente)}
                    onExcluir={() => onExcluir(recurso, ambiente)}
                    onDetalhes={() => onDetalhesAmbiente(recurso, ambiente)}
                  />
                </TableCell>
              ))}
              <TableCell className={`${classes.td} ${classes.right}`}>
                <button
                  type="button"
                  className={classes.pill}
                  onClick={() => onDetalhes(recurso)}
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
