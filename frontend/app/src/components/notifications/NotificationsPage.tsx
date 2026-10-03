import { useMemo, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import MarkReadIcon from '@material-ui/icons/Drafts';
import { Content, Page, ResponseErrorPanel } from '@backstage/core-components';
import type {
  Notification,
  NotificationSeverity,
} from '@backstage/plugin-notifications-common';
import { FilterSelect } from '../shared/FilterSelect';
import { NotificationItem } from './NotificationItem';
import {
  useNotificacoes,
  type FiltrosNotificacoes,
} from './hooks/useNotificacoes';
import {
  grupoDoDia,
  ROTULO_SEVERIDADE,
  SEVERIDADES,
  type Visao,
} from './helpers';
import { useStyles } from './styles';

/** Severidade pelo rótulo mostrado no seletor ("Alta" → high). */
function severidadeDoRotulo(rotulo: string): NotificationSeverity | '' {
  return (
    SEVERIDADES.find(severidade => ROTULO_SEVERIDADE[severidade] === rotulo) ??
    ''
  );
}

/**
 * Notificações: avisos do portal (ofertas que terminaram, aprovações,
 * comunicados), pelo plugin de notificações do Backstage.
 */
export function NotificationsPage() {
  const classes = useStyles();
  const [filtros, setFiltros] = useState<FiltrosNotificacoes>({
    visao: 'naoLidas',
    busca: '',
    severidade: '',
    topico: '',
  });
  const caixa = useNotificacoes(filtros);

  const grupos = useMemo(() => {
    const porDia = new Map<string, Notification[]>();
    for (const notificacao of caixa.notificacoes) {
      const dia = grupoDoDia(new Date(notificacao.created));
      porDia.set(dia, [...(porDia.get(dia) ?? []), notificacao]);
    }
    return [...porDia.entries()];
  }, [caixa.notificacoes]);

  const visoes: [Visao, string][] = [
    ['naoLidas', `Não lidas${caixa.naoLidas ? ` (${caixa.naoLidas})` : ''}`],
    ['todas', 'Todas'],
    ['salvas', 'Salvas'],
  ];

  let vazio =
    'Nenhuma notificação ainda. Elas chegam, por exemplo, quando uma oferta termina de executar.';
  if (caixa.filtrando) vazio = 'Nenhuma notificação com esses filtros.';
  else if (filtros.visao === 'naoLidas')
    vazio = 'Tudo em dia. Nenhuma notificação não lida.';
  else if (filtros.visao === 'salvas')
    vazio =
      'Nenhuma notificação salva. Use o marcador numa notificação para guardá-la aqui.';

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Caixa de entrada</span>
              <h1 className={classes.title}>Notificações</h1>
              <p className={classes.subtitle}>
                Avisos do portal: ofertas que terminaram de executar, aprovações
                e comunicados.
              </p>
            </div>
            {caixa.naoLidas > 0 && (
              <button
                type="button"
                className={classes.button}
                onClick={caixa.marcarTodasLidas}
                disabled={caixa.ocupado === 'todas'}
              >
                <MarkReadIcon style={{ fontSize: 16 }} />{' '}
                {caixa.ocupado === 'todas'
                  ? 'Marcando…'
                  : 'Marcar todas como lidas'}
              </button>
            )}
          </div>

          <section className={classes.card}>
            <div className={classes.filters}>
              <div
                className={classes.tabs}
                role="tablist"
                aria-label="Quais notificações"
              >
                {visoes.map(([id, rotulo]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={filtros.visao === id}
                    className={`${classes.tab} ${
                      filtros.visao === id ? classes.tabActive : ''
                    }`}
                    onClick={() => setFiltros({ ...filtros, visao: id })}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
              <label className={classes.search}>
                <SearchIcon style={{ fontSize: 18 }} />
                <input
                  type="search"
                  placeholder="Buscar no título ou na descrição"
                  aria-label="Buscar notificações"
                  value={filtros.busca}
                  onChange={evento =>
                    setFiltros({ ...filtros, busca: evento.target.value })
                  }
                />
              </label>
              <FilterSelect
                label="Severidade mínima"
                value={
                  filtros.severidade
                    ? ROTULO_SEVERIDADE[filtros.severidade]
                    : ''
                }
                options={SEVERIDADES.map(
                  severidade => ROTULO_SEVERIDADE[severidade],
                )}
                allLabel="Todas"
                onChange={rotulo =>
                  setFiltros({
                    ...filtros,
                    severidade: severidadeDoRotulo(rotulo),
                  })
                }
              />
              <FilterSelect
                label="Tópico"
                value={filtros.topico}
                options={caixa.topicos}
                onChange={topico => setFiltros({ ...filtros, topico })}
              />
            </div>

            {caixa.error && <ResponseErrorPanel error={caixa.error} />}
            {!caixa.error &&
              caixa.loading &&
              caixa.notificacoes.length === 0 && (
                <div className={classes.lista} aria-hidden>
                  {[1, 2, 3, 4].map(item => (
                    <div key={item} className={classes.item}>
                      <span className={classes.icone} />
                      <span className={classes.corpo}>
                        <span
                          className={classes.esqueleto}
                          style={{ width: '45%' }}
                        />
                        <span
                          className={classes.esqueleto}
                          style={{ width: '80%' }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            {!caixa.error &&
              !caixa.loading &&
              caixa.notificacoes.length === 0 && (
                <div className={classes.empty}>{vazio}</div>
              )}
            {!caixa.error && caixa.notificacoes.length > 0 && (
              <>
                {grupos.map(([dia, itens]) => (
                  <div key={dia} className={classes.grupo}>
                    <div className={classes.grupoRotulo}>{dia}</div>
                    <div className={classes.lista}>
                      {itens.map(notificacao => (
                        <NotificationItem
                          key={notificacao.id}
                          notificacao={notificacao}
                          ocupado={caixa.ocupado === notificacao.id}
                          onAtualizar={mudanca =>
                            caixa.atualizar([notificacao.id], mudanca)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className={classes.rodape}>
                  <span className={classes.metricSub}>
                    {caixa.notificacoes.length} de {caixa.total}
                  </span>
                  {caixa.notificacoes.length < caixa.total && (
                    <button
                      type="button"
                      className={classes.button}
                      disabled={caixa.loading}
                      onClick={caixa.carregarMais}
                    >
                      {caixa.loading ? 'Carregando…' : 'Carregar mais'}
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </Content>
    </Page>
  );
}
