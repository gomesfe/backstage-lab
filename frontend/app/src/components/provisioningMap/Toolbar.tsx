import FilterIcon from '@material-ui/icons/FilterList';
import { FilterSelect } from './FilterSelect';
import { ITENS_POR_PAGINA } from './helpers';
import { useStyles } from './styles';

type Props = {
  titulo: string;
  total: number;
  /** "com IaC" / "sem IaC" ao lado do título. */
  selo?: { texto: string; tipo: 'iac' | 'semIac' };
  filtrosAbertos: boolean;
  filtrosAtivos: number;
  onToggleFiltros: () => void;
  porPagina: number;
  onPorPagina: (valor: number) => void;
};

/** Título + contador + botão de filtros + itens por página. */
export function Toolbar({ titulo, total, selo, filtrosAbertos, filtrosAtivos, onToggleFiltros, porPagina, onPorPagina }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.toolbar}>
      <h3 className={classes.toolbarTitle}>
        {titulo}
        <span className={classes.count}>{total}</span>
        {selo && <span className={selo.tipo === 'iac' ? classes.badgeIac : classes.badgeSemIac}>{selo.texto}</span>}
      </h3>
      <div className={classes.toolbarActions}>
        <button
          type="button"
          className={`${classes.filtersButton} ${filtrosAbertos || filtrosAtivos ? classes.filtersButtonActive : ''}`}
          aria-pressed={filtrosAbertos}
          onClick={onToggleFiltros}
        >
          <FilterIcon style={{ fontSize: 16 }} /> Filtros{filtrosAtivos ? ` (${filtrosAtivos})` : ''}
        </button>
        <FilterSelect
          label="Itens"
          value={porPagina === ITENS_POR_PAGINA[0] ? '' : String(porPagina)}
          options={ITENS_POR_PAGINA.slice(1).map(String)}
          allLabel={String(ITENS_POR_PAGINA[0])}
          clearable={false}
          onChange={valor => onPorPagina(Number(valor || ITENS_POR_PAGINA[0]))}
        />
      </div>
    </div>
  );
}
