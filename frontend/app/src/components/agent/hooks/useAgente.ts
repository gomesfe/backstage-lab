import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { AgenteClient, type Conversa } from '../api';
import { mensagemDeErro, type MensagemLocal, type Pendente } from '../helpers';

/**
 * Tudo o que a tela do agente faz com o backend `atlas-agent`: status,
 * histórico, abrir/apagar conversa e mandar mensagem com a resposta em
 * streaming. A conversa aberta fica na URL (`?c=<id>`), então o "voltar" do
 * navegador anda entre conversas.
 */
export function useAgente() {
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const cliente = useMemo(() => new AgenteClient(discovery, fetchApi), [discovery, fetchApi]);
  const [parametros, setParametros] = useSearchParams();
  const ativaId = parametros.get('c');

  const { value: status, loading: carregandoStatus } = useAsync(() => cliente.status(), [cliente]);
  const conversas = useAsyncRetry(() => cliente.listar(), [cliente]);
  const [mensagens, setMensagens] = useState<MensagemLocal[]>([]);
  const [carregandoConversa, setCarregandoConversa] = useState(false);
  const [pendente, setPendenteEstado] = useState<Pendente | null>(null);
  // Espelho do estado para ler o parcial fora do render (ao interromper).
  const pendenteRef = useRef<Pendente | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Enquanto a primeira mensagem de uma conversa nova está indo, não recarrega
  // a conversa pela URL (apagaria a mensagem otimista).
  const criandoRef = useRef(false);

  const setPendente = useCallback((mudanca: Pendente | null | ((atual: Pendente | null) => Pendente | null)) => {
    pendenteRef.current = typeof mudanca === 'function' ? mudanca(pendenteRef.current) : mudanca;
    setPendenteEstado(pendenteRef.current);
  }, []);

  const abrirConversa = useCallback(
    (id: string | null) => {
      const proximos = new URLSearchParams(parametros);
      proximos.delete('q');
      if (id) proximos.set('c', id);
      else proximos.delete('c');
      setParametros(proximos);
    },
    [parametros, setParametros],
  );

  // Carrega as mensagens da conversa escolhida.
  useEffect(() => {
    if (criandoRef.current) return undefined;
    abortRef.current?.abort();
    setPendente(null);
    if (!ativaId) {
      setMensagens([]);
      return undefined;
    }
    let vivo = true;
    setCarregandoConversa(true);
    cliente
      .abrir(ativaId)
      .then(resultado => vivo && setMensagens(resultado.messages))
      .catch(() => vivo && setMensagens([]))
      .finally(() => vivo && setCarregandoConversa(false));
    return () => {
      vivo = false;
    };
  }, [ativaId, cliente, setPendente]);

  const podeConversar = Boolean(status?.configured);
  const ocupado = Boolean(pendente);

  const enviar = useCallback(
    async (texto: string) => {
      const conteudo = texto.trim();
      if (!conteudo || ocupado || !podeConversar) return;

      let id = ativaId;
      if (!id) {
        criandoRef.current = true;
        id = (await cliente.criar()).id;
        abrirConversa(id);
      }

      setMensagens(atuais => [
        ...atuais,
        { id: `local-${Date.now()}`, role: 'user', content: conteudo, activity: [], createdAt: new Date().toISOString() },
      ]);
      setPendente({ texto: '', atividade: [] });

      const controle = new AbortController();
      abortRef.current = controle;
      let terminou = false;
      try {
        await cliente.enviar(
          id,
          conteudo,
          evento => {
            if (evento.type === 'delta') setPendente(atual => atual && { ...atual, texto: atual.texto + evento.text });
            if (evento.type === 'reset') setPendente(atual => atual && { ...atual, texto: '' });
            if (evento.type === 'activity') {
              setPendente(atual => atual && { ...atual, atividade: [...atual.atividade, { tool: '', label: evento.label }] });
            }
            if (evento.type === 'done') {
              terminou = true;
              setMensagens(atuais => [...atuais, evento.message]);
              setPendente(null);
            }
            if (evento.type === 'failed') {
              terminou = true;
              setMensagens(atuais => [...atuais, mensagemDeErro(evento.message)]);
              setPendente(null);
            }
          },
          controle.signal,
        );
      } catch (erro) {
        if (!controle.signal.aborted) {
          setMensagens(atuais => [...atuais, mensagemDeErro(erro instanceof Error ? erro.message : 'O agente não conseguiu responder.')]);
        }
      } finally {
        if (!terminou) {
          // Interrompido: mostra o que já tinha chegado, marcado como parcial.
          const parcial = pendenteRef.current;
          if (parcial?.texto) {
            setMensagens(atuais => [
              ...atuais,
              {
                id: `corte-${Date.now()}`,
                role: 'assistant',
                content: parcial.texto,
                activity: parcial.atividade,
                createdAt: new Date().toISOString(),
                interrompida: true,
              },
            ]);
          }
          setPendente(null);
        }
        abortRef.current = null;
        criandoRef.current = false;
        conversas.retry();
      }
    },
    // `conversas.retry` muda a cada render; o resto é o que importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ativaId, ocupado, podeConversar, cliente, abrirConversa, setPendente],
  );

  const parar = useCallback(() => abortRef.current?.abort(), []);

  const apagar = useCallback(
    async (conversa: Conversa) => {
      await cliente.apagar(conversa.id);
      if (conversa.id === ativaId) abrirConversa(null);
      conversas.retry();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cliente, ativaId, abrirConversa],
  );

  const lista = conversas.value ?? [];

  return {
    status,
    carregandoStatus,
    conversas: lista,
    carregandoConversas: conversas.loading && !lista.length,
    ativaId,
    ativa: lista.find(conversa => conversa.id === ativaId),
    abrirConversa,
    mensagens,
    carregandoConversa,
    pendente,
    ocupado,
    podeConversar,
    enviar,
    parar,
    apagar,
  };
}
