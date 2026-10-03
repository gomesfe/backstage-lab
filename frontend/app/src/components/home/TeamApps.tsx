import { useMemo, useState } from 'react';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SearchIcon from '@material-ui/icons/Search';
import { Link } from '@backstage/core-components';
import { usePref } from '../../atlas/shell/prefs/prefs';
import { linkDaEntidade } from '../catalog/helpers';
import { FilterSelect } from '../shared/FilterSelect';
import { contem } from '../shared/filtros';
import { TIME_PADRAO } from './data';
import type { AplicacaoDoTime } from './hooks/useHomeCatalogo';
import { iniciais, TIPO_APLICACAO } from './helpers';
import { useStyles } from './styles';

/** Aplicações do time escolhido em "Seu time", com repositório e Sonar. */
export function TeamApps({ aplicacoes }: { aplicacoes: AplicacaoDoTime[] }) {
  const classes = useStyles();
  const time = usePref('team', TIME_PADRAO);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');

  const tipos = useMemo(
    () =>
      Array.from(
        new Set(
          aplicacoes.map(
            aplicacao =>
              TIPO_APLICACAO[aplicacao.subtipo]?.rotulo ?? aplicacao.subtipo,
          ),
        ),
      ).sort(),
    [aplicacoes],
  );
  const doTime = aplicacoes
    .filter(aplicacao => time === 'all' || aplicacao.dono === time)
    .filter(
      aplicacao =>
        !tipo ||
        (TIPO_APLICACAO[aplicacao.subtipo]?.rotulo ?? aplicacao.subtipo) ===
          tipo,
    )
    .filter(
      aplicacao =>
        !busca.trim() ||
        contem(`${aplicacao.nome} ${aplicacao.descricao}`, busca),
    );

  const selo = (subtipo: string) => {
    const info = TIPO_APLICACAO[subtipo];
    const porTom = {
      info: classes.badgeInfo,
      lime: classes.badgeLime,
      purple: classes.badgePurple,
    };
    return (
      <span className={info ? porTom[info.tom] : classes.badge}>
        {info?.rotulo ?? (subtipo || '—')}
      </span>
    );
  };

  return (
    <section
      className={`${classes.card} ${classes.painel}`}
      style={{ minWidth: 0 }}
    >
      <div className={classes.toolbar}>
        <h3 className={classes.toolbarTitle}>Aplicações do time</h3>
        <Link
          to={
            time === 'all'
              ? '/catalog?kind=Component'
              : `/catalog?kind=Component&owner=${time}`
          }
          className={classes.button}
        >
          Ver no catálogo
        </Link>
      </div>
      <div className={classes.filters}>
        <label className={classes.search}>
          <SearchIcon style={{ fontSize: 18 }} />
          <input
            type="search"
            placeholder="Buscar workload..."
            aria-label="Buscar workload"
            value={busca}
            onChange={evento => setBusca(evento.target.value)}
          />
        </label>
        <FilterSelect
          label="Tipo"
          value={tipo}
          options={tipos}
          onChange={setTipo}
        />
      </div>
      {doTime.length === 0 ? (
        <div className={classes.empty}>
          Nenhuma aplicação encontrada com esses filtros.
        </div>
      ) : (
        <div
          className={classes.tableWrap}
          style={{ maxHeight: 480, overflowY: 'auto' }}
        >
          <MuiTable
            className={classes.table}
            size="small"
            aria-label="Aplicações do time"
          >
            <TableHead>
              <TableRow>
                {['Nome', 'Tipo', 'Repositório', 'Sonar'].map(coluna => (
                  <TableCell key={coluna} className={classes.th}>
                    {coluna}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {doTime.map(aplicacao => (
                <TableRow key={aplicacao.ref} className={classes.row}>
                  <TableCell className={classes.td}>
                    <Link
                      to={linkDaEntidade(aplicacao)}
                      className={classes.appNome}
                    >
                      <span className={classes.appSigla}>
                        {iniciais(aplicacao.nome)}
                      </span>
                      {aplicacao.nome}
                    </Link>
                  </TableCell>
                  <TableCell className={classes.td}>
                    {selo(aplicacao.subtipo)}
                  </TableCell>
                  <TableCell className={classes.td}>
                    {aplicacao.repositorio ? (
                      <a
                        className={classes.pill}
                        href={`https://github.com/${aplicacao.repositorio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Repo ↗
                      </a>
                    ) : (
                      <span className={classes.muted}>—</span>
                    )}
                  </TableCell>
                  <TableCell className={classes.td}>
                    {aplicacao.sonar ? (
                      <a
                        className={classes.pill}
                        href={`https://sonarcloud.io/project/overview?id=${encodeURIComponent(
                          aplicacao.sonar,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Sonar ↗
                      </a>
                    ) : (
                      <span className={classes.muted}>—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </div>
      )}
    </section>
  );
}
