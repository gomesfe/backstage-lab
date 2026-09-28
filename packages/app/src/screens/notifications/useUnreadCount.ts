import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';

const EVENT = 'atlas-notifications-changed';
const POLL_MS = 60_000;

/** Avise que lidas/não lidas mudaram (a tela de notificações chama isto). */
export function notifyStatusChanged() {
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Quantas notificações não lidas o usuário tem — para o contador do sino.
 *
 * Relê a cada minuto, ao voltar para a aba e quando a tela de notificações
 * avisa que algo mudou. Erro (ex.: backend fora) vira zero: o sino não deve
 * gritar por falha de rede.
 */
export function useUnreadCount(): number {
  const api = useApi(notificationsApiRef);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .getStatus()
        .then(status => alive && setCount(status.unread))
        .catch(() => alive && setCount(0));

    load();
    const timer = window.setInterval(load, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    window.addEventListener(EVENT, load);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener(EVENT, load);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [api]);

  return count;
}
