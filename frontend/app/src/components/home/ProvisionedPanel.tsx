import { useMemo, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import SearchIcon from '@material-ui/icons/Search';
import { Link } from '@backstage/core-components';
import { setPref, usePref } from '../../atlas/shell/prefs/prefs';
import { AMBIENTES, type Ambiente } from '../shared/ambientes';
import { FilterSelect } from '../shared/FilterSelect';
import { contem } from '../shared/filtros';
import { useProvisioningMap } from '../provisioningMap/hooks/useProvisioningMap';
import { TIME_PADRAO } from './data';
import {
  iniciais,
  plural,
  projetosComRecursos,
  projetosComRepositorios,
  type Projeto,
} from './helpers';
import { useStyles } from './styles';

type Aba = 'recursos' | 'repositorios';

/**
 * "Provisionado no Atlas": por serviço Núclea, as ofertas em uso e quantos
 * recursos (ou repositórios) há — cada linha abre o mapa já filtrado. O
 * ambiente escolhido fica na preferência `env`.
 */
export function ProvisionedPanel() {
  const classes = useStyles();
  const { recursos, repositorios, servicos } = useProvisioningMap();
  const [aba, setAba] = useState<Aba>('recursos');
  const [busca, setBusca] = useState('');
  const ambientePref = usePref('env', 'all');
  const ambiente = (AMBIENTES as string[]).includes(ambientePref)
    ? (ambientePref as Ambiente)
    : '';
  const time = usePref('team', TIME_PADRAO);

  const comRecursos = useMemo(
    () => projetosComRecursos(recursos, servicos, ambiente),
    [recursos, servicos, ambiente],
  );
  const comRepositorios = useMemo(
    () => projetosComRepositorios(repositorios, servicos),
    [repositorios, servicos],
  );
  const projetos = (aba === 'recursos' ? comRecursos : comRepositorios).filter(
    projeto =>
      !busca.trim() ||
      contem(
        `${projeto.nome} ${projeto.sigla} ${projeto.ofertas.join(' ')}`,
        busca,
      ),
  );
  const totalRecursos = comRecursos.reduce(
    (soma, projeto) => soma + projeto.total,
    0,
  );

  const link = (projeto: Projeto) =>
    aba === 'recursos'
      ? `/provisioning-map?service=${projeto.sigla}`
      : `/provisioning-map?service=${projeto.sigla}#repositorios`;
  const rotuloLink = (projeto: Projeto) =>
    aba === 'recursos'
      ? `${plural(projeto.total, 'recurso', 'recursos')} →`
      : `${plural(projeto.total, 'repositório', 'repositórios')} →`;

  return (
    <section className={`${classes.card} ${classes.painel}`}>
      <div className={classes.painelTopo}>
        <div>
          <h2 className={classes.painelTitulo}>Provisionado no Atlas</h2>
          <p className={classes.painelSub}>
            Os projetos que você acompanha. Escolha um para abrir o mapa já
            filtrado.
          </p>
        </div>
        <div className={classes.painelFerramentas}>
          <div
            className={classes.tabs}
            role="tablist"
            aria-label="O que listar"
          >
            {(
              [
                ['recursos', 'Recursos', totalRecursos],
                ['repositorios', 'Repositórios', repositorios.length],
              ] as const
            ).map(([id, rotulo, total]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={aba === id}
                className={`${classes.tab} ${
                  aba === id ? classes.tabActive : ''
                }`}
                onClick={() => setAba(id)}
              >
                {rotulo}
                <span
                  className={`${classes.tabCount} ${
                    aba === id ? classes.tabCountActive : ''
                  }`}
                >
                  {total}
                </span>
              </button>
            ))}
          </div>
          <label className={classes.search}>
            <SearchIcon style={{ fontSize: 18 }} />
            <input
              type="search"
              placeholder="Buscar projeto"
              aria-label="Buscar projeto"
              value={busca}
              onChange={evento => setBusca(evento.target.value)}
            />
          </label>
        </div>
      </div>

      {aba === 'recursos' && (
        <div className={classes.painelFiltros}>
          <FilterSelect
            label="Ambiente"
            value={ambiente}
            options={AMBIENTES}
            onChange={valor => setPref('env', valor || null)}
          />
          <span className={classes.metricSub} style={{ paddingBottom: 10 }}>
            Conta só o que está provisionado no ambiente escolhido.
          </span>
        </div>
      )}

      {projetos.length === 0 ? (
        <div className={classes.empty}>Nenhum projeto encontrado.</div>
      ) : (
        <div className={`${classes.tableWrap} ${classes.rolagem}`}>
          <MuiTable
            className={classes.table}
            size="small"
            aria-label={
              aba === 'recursos'
                ? 'Projetos com recursos'
                : 'Projetos com repositórios'
            }
          >
            <TableHead>
              <TableRow>
                <TableCell className={classes.th}>Projeto</TableCell>
                <TableCell className={classes.th}>Ofertas em uso</TableCell>
                <TableCell className={`${classes.th} ${classes.center}`}>
                  Abrir no mapa
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projetos.map(projeto => (
                <TableRow key={projeto.sigla} className={classes.row}>
                  <TableCell className={classes.td}>
                    <span className={classes.projeto}>
                      <Avatar
                        variant="rounded"
                        className={classes.projetoAvatar}
                      >
                        {iniciais(projeto.nome)}
                      </Avatar>
                      <span>
                        <span className={classes.projetoNome}>
                          {projeto.nome}
                          {projeto.nome.toLowerCase() === time && (
                            <span className={classes.badgeLime}>seu time</span>
                          )}
                        </span>
                        <span className={classes.projetoSigla}>
                          {projeto.sigla}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className={`${classes.td} ${classes.muted}`}>
                    {projeto.ofertas.join(', ')}
                  </TableCell>
                  <TableCell className={`${classes.td} ${classes.center}`}>
                    <Link to={link(projeto)} className={classes.pill}>
                      {rotuloLink(projeto)}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </div>
      )}

      <div className={classes.rodapePainel}>
        <Link to="/provisioning-map" className={classes.button}>
          Abrir o mapa completo
        </Link>
      </div>
    </section>
  );
}
