import { forwardRef, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { MarkdownContent } from '@backstage/core-components';
import { AtlasLogo } from '../../atlas/components';
import type { Atividade } from './api';
import { SUGESTOES, type MensagemLocal, type Pendente } from './helpers';
import { useStyles } from './styles';

type Props = {
  mensagens: MensagemLocal[];
  pendente: Pendente | null;
  carregando: boolean;
  podeConversar: boolean;
  iniciaisVoce: string;
  onSugestao: (texto: string) => void;
};

function Consultas({ atividade }: { atividade: Atividade[] }) {
  const classes = useStyles();
  if (!atividade.length) return null;
  return (
    <div className={classes.consultas}>
      {atividade.map((item, indice) => (
        // As consultas não têm id e podem se repetir; a ordem é estável.
        // eslint-disable-next-line react/no-array-index-key
        <span key={indice} className={classes.consulta}>
          <SearchIcon style={{ fontSize: 13 }} /> {item.label}
        </span>
      ))}
    </div>
  );
}

function AvatarAgente() {
  const classes = useStyles();
  return (
    <span className={classes.avatarAgente}>
      <AtlasLogo variant="symbol" title="" />
    </span>
  );
}

/** As mensagens da conversa (ou a conversa vazia com sugestões). */
export const ChatMessages = forwardRef<HTMLDivElement, Props>(function MensagensDaConversa(
  { mensagens, pendente, carregando, podeConversar, iniciaisVoce, onSugestao },
  ref,
) {
  const classes = useStyles();
  const navigate = useNavigate();

  // Links internos do Markdown navegam dentro do portal, sem recarregar.
  const aoClicar = (evento: MouseEvent<HTMLDivElement>) => {
    // O link do MarkdownContent pode já ter navegado sozinho; navegar de novo
    // duplicaria a entrada no histórico e o "voltar" não sairia do lugar.
    if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;
    const href = (evento.target as HTMLElement).closest('a')?.getAttribute('href');
    if (href && href.startsWith('/')) {
      evento.preventDefault();
      navigate(href);
    }
  };

  let conteudo;
  if (carregando) {
    conteudo = (
      <>
        <div className={classes.esqueleto} style={{ width: '40%', alignSelf: 'flex-end' }} />
        <div className={classes.esqueleto} style={{ width: '70%' }} />
      </>
    );
  } else if (mensagens.length === 0 && !pendente) {
    conteudo = (
      <div className={classes.vazio}>
        <span className={classes.avatarAgente} style={{ width: 48, height: 48, borderRadius: 14 }}>
          <AtlasLogo variant="symbol" title="" />
        </span>
        <div>
          <div className={classes.toolbarTitle} style={{ justifyContent: 'center' }}>
            Como posso ajudar?
          </div>
          <p className={classes.heroSub} style={{ marginTop: 4 }}>
            Eu consulto o catálogo com as suas permissões e indico a tela certa. Não provisiono nem aprovo nada.
          </p>
        </div>
        <div className={classes.sugestoes}>
          {SUGESTOES.map(sugestao => (
            <button key={sugestao} type="button" className={classes.sugestao} disabled={!podeConversar} onClick={() => onSugestao(sugestao)}>
              {sugestao}
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    conteudo = (
      <>
        {mensagens.map(mensagem =>
          mensagem.role === 'user' ? (
            <div key={mensagem.id} className={`${classes.linha} ${classes.linhaVoce}`}>
              <span className={classes.avatar}>{iniciaisVoce}</span>
              <div className={classes.pilha}>
                <div className={`${classes.balao} ${classes.balaoVoce}`}>{mensagem.content}</div>
              </div>
            </div>
          ) : (
            <div key={mensagem.id} className={classes.linha}>
              <AvatarAgente />
              <div className={classes.pilha}>
                <Consultas atividade={mensagem.activity} />
                <div className={`${classes.balao} ${classes.balaoAgente} ${mensagem.erro ? classes.balaoErro : ''}`}>
                  {mensagem.erro ? mensagem.content : <MarkdownContent content={mensagem.content} dialect="gfm" />}
                </div>
                {mensagem.interrompida && <span className={classes.meta}>Interrompida — esta parte não foi salva.</span>}
              </div>
            </div>
          ),
        )}
        {pendente && (
          <div className={classes.linha}>
            <AvatarAgente />
            <div className={classes.pilha}>
              <Consultas atividade={pendente.atividade} />
              <div className={`${classes.balao} ${classes.balaoAgente}`}>
                {pendente.texto ? (
                  <MarkdownContent content={pendente.texto} dialect="gfm" />
                ) : (
                  <span className={classes.digitando} aria-label="O agente está respondendo">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    // O clique só intercepta links do Markdown; o teclado segue nos próprios links.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={classes.mensagens} ref={ref} onClick={aoClicar} aria-live="polite">
      {conteudo}
    </div>
  );
});
