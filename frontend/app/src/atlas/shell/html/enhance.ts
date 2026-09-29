// O mesmo arquivo que a versão avulsa carrega por <script>. Ele se registra
// em `window.AtlasBehaviors`; aqui só damos tipo a isso.
import '../../assets/atlas-behaviors.js';

export type AtlasHooks = {
  setTheme?: (theme: 'light' | 'dark') => void;
  currentTheme?: () => 'light' | 'dark';
  signOut?: () => void;
};

type AtlasBehaviors = {
  enhance: (root: HTMLElement, hooks?: AtlasHooks) => () => void;
  openHash: (root: HTMLElement, hash: string) => void;
};

const behaviors = (): AtlasBehaviors =>
  (window as unknown as { AtlasBehaviors: AtlasBehaviors }).AtlasBehaviors;

/**
 * Liga busca, filtros, abas, diálogos, estrelas… numa tela HTML do portal.
 * A lógica e os atributos estão em `assets/atlas-behaviors.js`.
 * Devolve a função que desliga.
 */
export function enhance(root: HTMLElement, hooks?: AtlasHooks): () => void {
  return behaviors().enhance(root, hooks);
}

/** Abre a aba do #hash — para navegação dentro da mesma tela. */
export function openHash(root: HTMLElement, hash: string): void {
  behaviors().openHash(root, hash);
}
