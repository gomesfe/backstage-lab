import SearchIcon from '@material-ui/icons/Search';
import { FilterSelect } from '../shared/FilterSelect';
import { useAtlasStyles } from '../shared/styles';
import type { Filtros as FiltrosTipo } from './types';

type Props = {
  filtros: FiltrosTipo;
  tipos: string[];
  donos: string[];
  ciclos: string[];
  podeLimpar: boolean;
  onChange: (filtros: FiltrosTipo) => void;
  onLimpar: () => void;
};

/** Busca, ★ Favoritos, Tipo, Dono, Ciclo de vida e Limpar filtros. */
export function Filters({ filtros, tipos, donos, ciclos, podeLimpar, onChange, onLimpar }: Props) {
  const classes = useAtlasStyles();

  return (
    <div className={classes.filters}>
      <label className={classes.search}>
        <SearchIcon style={{ fontSize: 18 }} />
        <input
          type="search"
          placeholder="Buscar por nome, descrição ou tag"
          aria-label="Buscar por nome, descrição ou tag"
          value={filtros.busca}
          onChange={event => onChange({ ...filtros, busca: event.target.value })}
        />
      </label>
      <button
        type="button"
        aria-pressed={filtros.soFavoritos}
        className={`${classes.toggle} ${filtros.soFavoritos ? classes.toggleAtivo : ''}`}
        onClick={() => onChange({ ...filtros, soFavoritos: !filtros.soFavoritos })}
      >
        ★ Favoritos
      </button>
      <FilterSelect label="Tipo" value={filtros.tipo} options={tipos} onChange={tipo => onChange({ ...filtros, tipo })} />
      <FilterSelect label="Dono" value={filtros.dono} options={donos} onChange={dono => onChange({ ...filtros, dono })} />
      <FilterSelect label="Ciclo de vida" value={filtros.cicloDeVida} options={ciclos} onChange={cicloDeVida => onChange({ ...filtros, cicloDeVida })} />
      {podeLimpar && (
        <button type="button" className={classes.link} style={{ background: 'none', border: 0, cursor: 'pointer', height: 36 }} onClick={onLimpar}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}
