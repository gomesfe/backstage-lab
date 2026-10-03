import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { Content, Page } from '@backstage/core-components';
import type { Conversa } from './api';
import { ChatMessages } from './ChatMessages';
import { Composer } from './Composer';
import { ConversationList } from './ConversationList';
import { useAgente } from './hooks/useAgente';
import { iniciais } from './helpers';
import { useStyles } from './styles';

/**
 * Agente do Atlas: chat com histórico, pelo backend `atlas-agent`. O agente
 * consulta o catálogo com as permissões de quem conversa e não altera nada.
 */
export function AgentPage() {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const [parametros] = useSearchParams();
  const agente = useAgente();
  const { value: perfil } = useAsync(() => identityApi.getProfileInfo(), [identityApi]);

  // `?q=` (caixa "Pergunte ao Atlas" da Home) já chega escrito no campo.
  const [texto, setTexto] = useState(() => parametros.get('q') ?? '');
  const [focarEm, setFocarEm] = useState(0);
  const [paraApagar, setParaApagar] = useState<Conversa | null>(null);
  const rolagemRef = useRef<HTMLDivElement>(null);

  // Rola para o fim quando chega texto novo.
  useEffect(() => {
    const area = rolagemRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [agente.mensagens, agente.pendente]);

  const enviar = (mensagem: string) => {
    if (!mensagem.trim() || agente.ocupado || !agente.podeConversar) return;
    setTexto('');
    agente.enviar(mensagem);
  };

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Assistente</span>
              <h1 className={classes.title}>Agente do Atlas</h1>
              <p className={classes.subtitle}>
                Pergunte sobre serviços, APIs, ofertas e telas do portal. As conversas ficam salvas no seu histórico.
              </p>
            </div>
          </div>

          {!agente.carregandoStatus && agente.status && !agente.status.configured && (
            <div className={`${classes.alert} ${classes.alertWarn}`} role="status" style={{ marginTop: 0 }}>
              <strong className={classes.alertTitle}>Agente ainda não configurado</strong>
              Falta a credencial da Anthropic no backend ({agente.status.reason}). Defina{' '}
              <code className={classes.codigo}>ANTHROPIC_API_KEY</code> no <code className={classes.codigo}>.env</code> do portal e
              reinicie o backend. O histórico continua disponível para leitura.
            </div>
          )}

          <div className={classes.layout}>
            <ConversationList
              conversas={agente.conversas}
              carregando={agente.carregandoConversas}
              ativaId={agente.ativaId}
              onNova={() => {
                agente.abrirConversa(null);
                setFocarEm(Date.now());
              }}
              onAbrir={agente.abrirConversa}
              onApagar={setParaApagar}
            />

            <section className={`${classes.card} ${classes.chat}`} aria-label="Conversa">
              <div className={classes.chatHead}>
                <span className={classes.chatTitulo}>{agente.ativa?.title ?? 'Nova conversa'}</span>
                {agente.status?.configured && <span className={classes.meta}>{agente.status.model}</span>}
              </div>
              <ChatMessages
                ref={rolagemRef}
                mensagens={agente.mensagens}
                pendente={agente.pendente}
                carregando={agente.carregandoConversa}
                podeConversar={agente.podeConversar}
                iniciaisVoce={iniciais(perfil?.displayName ?? 'Você')}
                onSugestao={enviar}
              />
              <Composer
                texto={texto}
                podeConversar={agente.podeConversar}
                ocupado={agente.ocupado}
                focarEm={focarEm}
                onTexto={setTexto}
                onEnviar={() => enviar(texto)}
                onParar={agente.parar}
              />
            </section>
          </div>
        </div>

        <Dialog open={Boolean(paraApagar)} onClose={() => setParaApagar(null)} maxWidth="xs" fullWidth PaperProps={{ className: classes.dialogPaper }}>
          <div className={classes.dialogHead}>
            <span className={classes.dialogEyebrow}>Agente</span>
            <h3 className={classes.dialogTitle}>Apagar conversa</h3>
          </div>
          <DialogContent>
            <p className={classes.heroSub}>
              Apagar <strong>{paraApagar?.title}</strong> e todas as mensagens dela? Não dá para desfazer.
            </p>
          </DialogContent>
          <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
            <span className={classes.dialogButtons}>
              <button type="button" className={classes.button} onClick={() => setParaApagar(null)}>
                Voltar
              </button>
              <button
                type="button"
                className={classes.buttonDanger}
                onClick={async () => {
                  if (paraApagar) await agente.apagar(paraApagar);
                  setParaApagar(null);
                }}
              >
                Apagar
              </button>
            </span>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
}
