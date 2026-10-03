import { useMemo, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import SyncIcon from '@material-ui/icons/Sync';
import { Content, Page } from '@backstage/core-components';
import { FilterSelect } from '../shared/FilterSelect';
import { Dialogs } from './Dialogs';
import { CardsTable, DraftsTable } from './Tables';
import { useAtlasJira } from './hooks/useAtlasJira';
import { filtrarCards, filtrarRascunhos, TIPOS } from './helpers';
import { useStyles } from './styles';
import type { Dialogo, Secao } from './types';

/**
 * Atlas × Jira: issues do GitHub abertas a partir do Atlas chegam como
 * rascunho; quem cuida da fila decide o que vira card no Jira.
 */
export function AtlasJiraPage() {
  const classes = useStyles();
  const jira = useAtlasJira();
  const [secao, setSecao] = useState<Secao>('rascunhos');
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const rascunhos = useMemo(
    () => filtrarRascunhos(jira.rascunhos, busca, tipo),
    [jira.rascunhos, busca, tipo],
  );
  const cards = useMemo(
    () => filtrarCards(jira.cards, busca, tipo),
    [jira.cards, busca, tipo],
  );

  const secoes: [Secao, string, number][] = [
    ['rascunhos', 'Rascunhos', jira.rascunhos.length],
    ['cards', 'Cards abertos', jira.cards.length],
  ];

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Integrações</span>
              <h1 className={classes.title}>Atlas × Jira</h1>
              <p className={classes.subtitle}>
                Issues abertas a partir do Atlas chegam como rascunho; você
                decide o que vira card no Jira.
              </p>
            </div>
            <button
              type="button"
              className={classes.button}
              disabled={jira.sincronizando}
              title="Importa as issues de novo. Rascunho que já virou card não volta."
              onClick={jira.sincronizar}
            >
              <SyncIcon style={{ fontSize: 16 }} />{' '}
              {jira.sincronizando ? 'Sincronizando…' : 'Sincronizar com GitHub'}
            </button>
          </div>

          <div className={classes.layout}>
            <nav
              className={`${classes.card} ${classes.menu}`}
              aria-label="Seções"
            >
              {secoes.map(([id, rotulo, total]) => (
                <button
                  key={id}
                  type="button"
                  aria-current={secao === id ? 'true' : undefined}
                  className={`${classes.item} ${
                    secao === id ? classes.itemAtivo : ''
                  }`}
                  onClick={() => setSecao(id)}
                >
                  {rotulo}
                  <span className={classes.count}>{total}</span>
                </button>
              ))}
            </nav>

            <section className={classes.card}>
              <div className={classes.filters}>
                <label className={classes.search}>
                  <SearchIcon style={{ fontSize: 18 }} />
                  <input
                    type="search"
                    placeholder="Buscar por título, origem ou solicitante"
                    aria-label="Buscar por título, origem ou solicitante"
                    value={busca}
                    onChange={evento => setBusca(evento.target.value)}
                  />
                </label>
                <FilterSelect
                  label="Tipo"
                  value={tipo}
                  options={TIPOS}
                  onChange={setTipo}
                />
              </div>

              {secao === 'rascunhos' &&
                (rascunhos.length ? (
                  <DraftsTable rascunhos={rascunhos} onAbrir={setDialogo} />
                ) : (
                  <div className={classes.empty}>
                    Nenhum rascunho com esses filtros.
                  </div>
                ))}
              {secao === 'cards' &&
                (cards.length ? (
                  <CardsTable cards={cards} onAbrir={setDialogo} />
                ) : (
                  <div className={classes.empty}>
                    Nenhum card aberto com esses filtros.
                  </div>
                ))}
            </section>
          </div>
        </div>
        <Dialogs
          dialogo={dialogo}
          onClose={() => setDialogo(null)}
          onOpen={setDialogo}
          onCriarCard={jira.criarCard}
          onDescartar={jira.descartar}
        />
      </Content>
    </Page>
  );
}
