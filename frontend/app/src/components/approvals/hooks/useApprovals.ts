import { useCallback, useState } from 'react';
import { SOLICITACOES } from '../data';
import { aprovar, cancelar, rejeitar } from '../helpers';
import type { Solicitacao } from '../types';

type Resultado = {
  solicitacoes: Solicitacao[];
  loading: boolean;
  aprovar: (id: string) => void;
  rejeitar: (id: string, motivo: string) => void;
  cancelar: (id: string, motivo: string) => void;
};

/**
 * Solicitações de aprovação. Hoje vêm de `data.ts` e as ações só mudam a
 * sessão. Com o serviço de aprovações, troque o estado por
 * `useApi(approvalsApiRef)` + `useAsync` e faça cada ação chamar a API,
 * mantendo o mesmo retorno.
 */
export function useApprovals(): Resultado {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(SOLICITACOES);

  const mudar = useCallback(
    (id: string, mudanca: (solicitacao: Solicitacao) => Solicitacao) => {
      setSolicitacoes(atuais =>
        atuais.map(item => (item.id === id ? mudanca(item) : item)),
      );
    },
    [],
  );

  return {
    solicitacoes,
    loading: false,
    aprovar: useCallback(
      (id: string) => mudar(id, item => aprovar(item)),
      [mudar],
    ),
    rejeitar: useCallback(
      (id: string, motivo: string) => mudar(id, item => rejeitar(item, motivo)),
      [mudar],
    ),
    cancelar: useCallback(
      (id: string, motivo: string) => mudar(id, item => cancelar(item, motivo)),
      [mudar],
    ),
  };
}
