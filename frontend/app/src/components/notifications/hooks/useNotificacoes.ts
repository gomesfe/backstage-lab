import { useCallback, useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useDebounce from 'react-use/lib/useDebounce';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';
import type { NotificationSeverity } from '@backstage/plugin-notifications-common';
import { POR_PAGINA, type Visao } from '../helpers';
import { notifyStatusChanged } from './useUnreadCount';

export type FiltrosNotificacoes = {
  visao: Visao;
  busca: string;
  severidade: NotificationSeverity | '';
  topico: string;
};

/**
 * Caixa de notificações pelo plugin de notificações do Backstage: lista
 * filtrada, contagem de não lidas, tópicos e as ações de marcar/salvar.
 */
export function useNotificacoes(filtros: FiltrosNotificacoes) {
  const api = useApi(notificationsApiRef);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [ocupado, setOcupado] = useState<string | null>(null);

  useDebounce(() => setBuscaAplicada(filtros.busca.trim()), 300, [
    filtros.busca,
  ]);
  useEffect(
    () => setLimite(POR_PAGINA),
    [filtros.visao, buscaAplicada, filtros.severidade, filtros.topico],
  );

  const status = useAsyncRetry(() => api.getStatus(), [api]);
  const { value: topicos } = useAsync(
    async () => (await api.getTopics()).topics,
    [api],
  );

  const lista = useAsyncRetry(
    () =>
      api.getNotifications({
        limit: limite,
        offset: 0,
        sort: 'created',
        sortOrder: 'desc',
        search: buscaAplicada || undefined,
        read: filtros.visao === 'naoLidas' ? false : undefined,
        saved: filtros.visao === 'salvas' ? true : undefined,
        minimumSeverity: filtros.severidade || undefined,
        topic: filtros.topico || undefined,
      }),
    [
      api,
      limite,
      buscaAplicada,
      filtros.visao,
      filtros.severidade,
      filtros.topico,
    ],
  );

  const recarregar = useCallback(() => {
    lista.retry();
    status.retry();
    notifyStatusChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.retry, status.retry]);

  const atualizar = useCallback(
    async (ids: string[], mudanca: { read?: boolean; saved?: boolean }) => {
      setOcupado(ids.length === 1 ? ids[0] : 'todas');
      try {
        await api.updateNotifications({ ids, ...mudanca });
      } finally {
        setOcupado(null);
        recarregar();
      }
    },
    [api, recarregar],
  );

  const marcarTodasLidas = useCallback(async () => {
    // A API marca por id; busca todas as não lidas, não só a página atual.
    const naoLidas = await api.getNotifications({ read: false, limit: 1000 });
    const ids = naoLidas.notifications.map(notificacao => notificacao.id);
    if (ids.length) await atualizar(ids, { read: true });
  }, [api, atualizar]);

  const notificacoes = useMemo(
    () => lista.value?.notifications ?? [],
    [lista.value],
  );

  return {
    notificacoes,
    total: lista.value?.totalCount ?? 0,
    loading: lista.loading,
    error: lista.error,
    naoLidas: status.value?.unread ?? 0,
    topicos: topicos ?? [],
    filtrando: Boolean(buscaAplicada || filtros.severidade || filtros.topico),
    ocupado,
    atualizar,
    marcarTodasLidas,
    carregarMais: () => setLimite(atual => atual + POR_PAGINA),
  };
}
