import SearchIcon from '@material-ui/icons/Search';
import { AMBIENTES } from '../shared/ambientes';
import { FilterSelect } from '../shared/FilterSelect';
import { ITENS_POR_PAGINA } from '../shared/filtros';
import { ABAS_STATUS } from './helpers';
import { useStyles } from './styles';
import type { Filtros as FiltrosTipo, FiltroStatus } from './types';

type Props = {
  filtros: FiltrosTipo;
  contagens: Record<FiltroStatus, number>;
  grupos: string[];
  porPagina: number;
  onChange: (filtros: FiltrosTipo) => void;
  onPorPagina: (valor: number) => void;
};

/** Busca, abas de status (com contagem), ambiente, grupo e itens por página. */
export function Filters({
  filtros,
  contagens,
  grupos,
  porPagina,
  onChange,
  onPorPagina,
}: Props) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.filters}>
        <label className={classes.search}>
          <SearchIcon style={{ fontSize: 18 }} />
          <input
            type="search"
            placeholder="Buscar por recurso ou solicitante"
            aria-label="Buscar por recurso ou solicitante"
            value={filtros.busca}
            onChange={event =>
              onChange({ ...filtros, busca: event.target.value })
            }
          />
        </label>
      </div>
      <div className={classes.statusBar}>
        <div
          className={`${classes.tabs} ${classes.statusTabs}`}
          role="group"
          aria-label="Status"
        >
          {ABAS_STATUS.map(aba => (
            <button
              key={aba.id}
              type="button"
              aria-pressed={filtros.status === aba.id}
              className={`${classes.tab} ${classes.statusTab} ${
                filtros.status === aba.id ? classes.tabActive : ''
              }`}
              onClick={() => onChange({ ...filtros, status: aba.id })}
            >
              {aba.rotulo}
              {aba.id !== 'todos' && ` (${contagens[aba.id]})`}
            </button>
          ))}
        </div>
        <div className={classes.filters}>
          <FilterSelect
            label="Ambiente"
            value={filtros.ambiente}
            options={AMBIENTES}
            onChange={ambiente => onChange({ ...filtros, ambiente })}
          />
          <FilterSelect
            label="Grupo"
            value={filtros.grupo}
            options={grupos}
            onChange={grupo => onChange({ ...filtros, grupo })}
          />
          <FilterSelect
            label="Itens"
            value={porPagina === ITENS_POR_PAGINA[0] ? '' : String(porPagina)}
            options={ITENS_POR_PAGINA.slice(1).map(String)}
            allLabel={String(ITENS_POR_PAGINA[0])}
            clearable={false}
            onChange={valor =>
              onPorPagina(Number(valor || ITENS_POR_PAGINA[0]))
            }
          />
        </div>
      </div>
    </>
  );
}
