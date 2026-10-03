import { useSyncExternalStore } from 'react';

/**
 * Preferências do usuário guardadas no navegador (`localStorage`, chave
 * `atlas.<nome>`). `setPref` avisa com o evento `atlas:prefs`; quem usa
 * `usePref` se atualiza na hora, em qualquer tela.
 *
 * - `nav`: `top` (padrão) ou `side` — posição do menu.
 * - `navIcons`: `1` (padrão) ou `0` — ícones nas pílulas do menu.
 * - `team`: time escolhido na Home (padrão `plataforma`).
 * - `env`: ambiente do painel "Provisionado no Atlas" da Home.
 */
const EVENT = 'atlas:prefs';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(`atlas.${key}`);
  } catch {
    return null;
  }
}

export function setPref(key: string, value: string | null) {
  try {
    if (value === null || value === '') window.localStorage.removeItem(`atlas.${key}`);
    else window.localStorage.setItem(`atlas.${key}`, value);
  } catch {
    // sem armazenamento (janela privada): a escolha vale só até recarregar
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function usePref(key: string, fallback: string): string {
  return useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback,
  );
}
