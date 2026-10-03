import { useMemo, useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import {
  Content,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { CreateKeyDialog } from './CreateKeyDialog';
import { KeysTable } from './KeysTable';
import { useApiKeys } from './hooks/useApiKeys';
import { contar } from './helpers';
import { useStyles } from './styles';

/** API Keys: chaves para integrações e automações, pelo backend `api-keys`. */
export function ApiKeysPage() {
  const classes = useStyles();
  const { chaves, loading, error, recarregar, criar, revogar } = useApiKeys();
  const [aba, setAba] = useState<'ativas' | 'todas'>('ativas');
  const [criando, setCriando] = useState(false);

  const numeros = useMemo(() => contar(chaves), [chaves]);
  const linhas = useMemo(
    () => chaves.filter(chave => aba === 'todas' || chave.status === 'active'),
    [chaves, aba],
  );
  const valor = (numero: number) => (loading ? '—' : numero);

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Credenciais</span>
              <h1 className={classes.title}>API Keys</h1>
              <p className={classes.subtitle}>
                Crie e gerencie chaves de API para integrações e automações do
                seu squad.
              </p>
            </div>
            <button
              type="button"
              className={classes.buttonPrimary}
              onClick={() => setCriando(true)}
            >
              <AddIcon style={{ fontSize: 16 }} /> Nova chave
            </button>
          </div>

          {error ? (
            <ResponseErrorPanel error={error} />
          ) : (
            <>
              <div className={classes.metrics}>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Ativas</div>
                  <div className={classes.metricValue}>
                    {valor(numeros.ativas)}
                  </div>
                  <div className={classes.metricSub}>
                    podem autenticar agora
                  </div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Expiram em 7 dias</div>
                  <div
                    className={`${classes.metricValue} ${
                      numeros.emBreve ? classes.alerta : ''
                    }`}
                  >
                    {valor(numeros.emBreve)}
                  </div>
                  <div className={classes.metricSub}>
                    emita a substituta antes de a automação parar
                  </div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>
                    Revogadas ou expiradas
                  </div>
                  <div className={classes.metricValue}>
                    {valor(numeros.inativas)}
                  </div>
                  <div className={classes.metricSub}>mantidas no histórico</div>
                </div>
              </div>

              <section className={classes.card}>
                <div
                  className={classes.tabs}
                  role="tablist"
                  aria-label="Quais chaves"
                >
                  {(
                    [
                      ['ativas', `Ativas (${numeros.ativas})`],
                      ['todas', `Todas (${chaves.length})`],
                    ] as const
                  ).map(([id, rotulo]) => (
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
                {loading && <Progress />}
                {!loading && linhas.length > 0 && (
                  <KeysTable
                    chaves={linhas}
                    onRevogar={chave => revogar(chave.id)}
                  />
                )}
                {!loading && linhas.length === 0 && (
                  <div className={classes.empty}>
                    {chaves.length === 0
                      ? 'Nenhuma chave emitida ainda. Use “Nova chave” para criar a primeira.'
                      : 'Nenhuma chave ativa. Veja o histórico em “Todas”.'}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <CreateKeyDialog
          open={criando}
          onClose={() => {
            setCriando(false);
            recarregar();
          }}
          onCriar={criar}
        />
      </Content>
    </Page>
  );
}
