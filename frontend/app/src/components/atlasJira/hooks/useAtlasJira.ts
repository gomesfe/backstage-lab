import { useCallback, useRef, useState } from 'react';
import { CARDS, RASCUNHOS } from '../data';
import { agoraFormatado, proximaChave } from '../helpers';
import type { Card, Rascunho } from '../types';

/**
 * Rascunhos (issues do GitHub) e cards do Jira. Hoje vêm de `data.ts` e as
 * ações só mudam a sessão. Com a integração, troque por chamadas ao GitHub e
 * ao Jira mantendo o mesmo retorno.
 */
export function useAtlasJira() {
  const [rascunhos, setRascunhos] = useState<Rascunho[]>(RASCUNHOS);
  const [cards, setCards] = useState<Card[]>(CARDS);
  const [sincronizando, setSincronizando] = useState(false);
  // Rascunho que virou card ou foi descartado não volta ao sincronizar.
  const resolvidos = useRef(new Set<string>());

  const criarCard = useCallback((rascunho: Rascunho) => {
    resolvidos.current.add(rascunho.id);
    setRascunhos(atuais => atuais.filter(item => item.id !== rascunho.id));
    // O card nasce em "A fazer", sem responsável, apontando para a issue.
    setCards(atuais => [
      {
        chave: proximaChave(atuais),
        titulo: rascunho.titulo,
        tipo: rascunho.tipo,
        status: 'A fazer',
        responsavel: '—',
        origem: rascunho.origem,
        criadoEm: agoraFormatado(),
      },
      ...atuais,
    ]);
  }, []);

  const descartar = useCallback((rascunho: Rascunho) => {
    resolvidos.current.add(rascunho.id);
    setRascunhos(atuais => atuais.filter(item => item.id !== rascunho.id));
  }, []);

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    // Sem GitHub do outro lado no lab: relê os exemplos.
    await new Promise(resolve => setTimeout(resolve, 700));
    setRascunhos(
      RASCUNHOS.filter(rascunho => !resolvidos.current.has(rascunho.id)),
    );
    setSincronizando(false);
  }, []);

  return { rascunhos, cards, sincronizando, criarCard, descartar, sincronizar };
}
