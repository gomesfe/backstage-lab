import { useMemo, useState } from 'react';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
  Content,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApiKeys } from '../apiKeys/hooks/useApiKeys';
import { useAtlasStyles } from '../shared/styles';
import { agruparPorDono, paradaHaUmMes } from './helpers';

type Aba = 'usuarios' | 'portal' | 'api';

const ABAS: [Aba, string][] = [
  ['usuarios', 'Usuários com chaves'],
  ['portal', 'Uso do portal'],
  ['api', 'Uso da API'],
];

/**
 * Administração: credenciais emitidas em todo o portal. Das três abas, só
 * "Usuários com chaves" tem fonte no lab (a lista de API keys). As outras
 * dependem de um log de auditoria que não existe e dizem isso, em vez de
 * mostrar número inventado.
 */
export function AdminPage() {
  const classes = useAtlasStyles();
  const { chaves, loading, error } = useApiKeys();
  const [aba, setAba] = useState<Aba>('usuarios');

  const usuarios = useMemo(() => agruparPorDono(chaves), [chaves]);
  const ativas = chaves.filter(chave => chave.status === 'active').length;
  const paradas = chaves.filter(chave => paradaHaUmMes(chave)).length;
  const valor = (numero: number) => (loading ? '—' : numero);

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Administração</span>
              <h1 className={classes.title}>Administração</h1>
              <p className={classes.subtitle}>
                Uso do portal, atividade das chaves de API e usuários com
                credenciais ativas.
              </p>
            </div>
            <span className={classes.badgePurple}>acesso admin</span>
          </div>

          {error ? (
            <ResponseErrorPanel error={error} />
          ) : (
            <>
              <div className={classes.metrics}>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Usuários com chaves</div>
                  <div className={classes.metricValue}>
                    {valor(usuarios.length)}
                  </div>
                  <div className={classes.metricSub}>
                    emitiram ao menos uma chave
                  </div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Chaves ativas</div>
                  <div className={classes.metricValue}>{valor(ativas)}</div>
                  <div className={classes.metricSub}>em todo o portal</div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Sem uso há 30 dias</div>
                  <div className={classes.metricValue}>{valor(paradas)}</div>
                  <div className={classes.metricSub}>
                    ativas e paradas — candidatas a revogação
                  </div>
                </div>
              </div>

              <section className={classes.card}>
                <div className={classes.toolbar}>
                  <h3 className={classes.toolbarTitle}>
                    Painel administrativo
                  </h3>
                  <div
                    className={classes.tabs}
                    role="tablist"
                    aria-label="Painel administrativo"
                  >
                    {ABAS.map(([id, rotulo]) => (
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
                      </button>
                    ))}
                  </div>
                </div>

                {aba === 'usuarios' && loading && <Progress />}
                {aba === 'usuarios' && !loading && usuarios.length === 0 && (
                  <div className={classes.empty}>
                    Nenhum usuário emitiu chaves ainda.
                  </div>
                )}
                {aba === 'usuarios' && !loading && usuarios.length > 0 && (
                  <div className={classes.tableWrap}>
                    <MuiTable
                      className={classes.table}
                      size="small"
                      aria-label="Usuários com chaves"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.th}>Usuário</TableCell>
                          <TableCell
                            className={`${classes.th} ${classes.right}`}
                          >
                            Chaves ativas
                          </TableCell>
                          <TableCell
                            className={`${classes.th} ${classes.right}`}
                          >
                            Total emitido
                          </TableCell>
                          <TableCell className={classes.th}>
                            Último uso
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usuarios.map(usuario => (
                          <TableRow
                            key={usuario.usuario}
                            className={classes.row}
                          >
                            <TableCell className={classes.td}>
                              <span className={classes.name}>
                                {usuario.usuario}
                              </span>
                            </TableCell>
                            <TableCell
                              className={`${classes.td} ${classes.right}`}
                            >
                              {usuario.ativas}
                            </TableCell>
                            <TableCell
                              className={`${classes.td} ${classes.right}`}
                            >
                              {usuario.total}
                            </TableCell>
                            <TableCell className={classes.td}>
                              {usuario.ultimoUsoMs === null
                                ? 'nunca'
                                : new Date(usuario.ultimoUsoMs).toLocaleString(
                                    'pt-BR',
                                    { dateStyle: 'short', timeStyle: 'short' },
                                  )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </MuiTable>
                  </div>
                )}

                {aba === 'portal' && (
                  <div
                    className={`${classes.alert} ${classes.alertWarn}`}
                    style={{ marginTop: 0 }}
                  >
                    <strong className={classes.alertTitle}>
                      Sem log de acessos no lab
                    </strong>
                    <p className={classes.heroSub}>
                      Esta aba mostraria quem acessou o portal e quando. O lab
                      não registra acessos: o backend loga requisições no
                      console, mas nada é persistido nem consultável.
                    </p>
                    <p className={classes.heroSub}>
                      O que faltaria: um plugin de auditoria que grave usuário,
                      rota e horário numa tabela própria, com retenção definida
                      — dado de acesso é dado pessoal e não pode ficar guardado
                      para sempre sem critério.
                    </p>
                  </div>
                )}

                {aba === 'api' && (
                  <div
                    className={`${classes.alert} ${classes.alertWarn}`}
                    style={{ marginTop: 0 }}
                  >
                    <strong className={classes.alertTitle}>
                      Sem log de requisições no lab
                    </strong>
                    <p className={classes.heroSub}>
                      Esta aba mostraria cada chamada autenticada por chave:
                      horário, método, rota e corpo. Hoje o plugin de API keys
                      grava apenas o carimbo do último uso de cada chave —
                      suficiente para achar chave esquecida, não para auditar
                      chamadas.
                    </p>
                    <p className={classes.heroSub}>
                      O que faltaria: registrar cada validação de chave numa
                      tabela de uso. O ponto de captura já existe em{' '}
                      <code>ApiKeyStore.validate</code>.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </Content>
    </Page>
  );
}
