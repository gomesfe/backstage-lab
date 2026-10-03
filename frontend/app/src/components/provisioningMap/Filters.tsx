import SearchIcon from '@material-ui/icons/Search';
import { FilterSelect } from '../shared/FilterSelect';
import { useStyles } from './styles';
import type { FiltrosRecursos } from './types';

type Props = {
  filtros: FiltrosRecursos;
  ofertas: string[];
  servicos: string[];
  buscaPlaceholder: string;
  onChange: (filtros: FiltrosRecursos) => void;
};

/** Barra de filtros (abre pelo botão "Filtros" da Toolbar): nome, oferta e serviço. */
export function Filters({ filtros, ofertas, servicos, buscaPlaceholder, onChange }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.filters}>
      <label className={classes.search} style={{ alignSelf: 'flex-end' }}>
        <SearchIcon style={{ fontSize: 18 }} />
        <input
          type="search"
          placeholder={buscaPlaceholder}
          aria-label={buscaPlaceholder}
          value={filtros.busca}
          onChange={event => onChange({ ...filtros, busca: event.target.value })}
        />
      </label>
      <FilterSelect label="Oferta" value={filtros.oferta} options={ofertas} onChange={oferta => onChange({ ...filtros, oferta })} />
      <FilterSelect label="Serviço" value={filtros.servico} options={servicos} onChange={servico => onChange({ ...filtros, servico })} />
    </div>
  );
}
