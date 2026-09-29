/**
 * Busca, filtro, abas e diálogos das telas HTML, dentro do portal.
 *
 * Mesma lógica e mesmos atributos de `assets/atlas.js` (que faz isso na
 * versão avulsa). Mudou um, mude o outro. Atributos documentados lá.
 *
 * Devolve a função que desliga os ouvintes.
 */
export function enhance(root: HTMLElement): () => void {
  const applyFilters = (targetId: string) => {
    const target = root.querySelector(`#${CSS.escape(targetId)}`);
    if (!target) return;
    const search = root.querySelector<HTMLInputElement>(`[data-atlas-search="${targetId}"]`);
    const needle = search?.value.trim().toLowerCase() ?? '';
    const filters = Array.from(
      root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[data-atlas-filter="${targetId}"]`),
    );
    let visible = 0;
    target.querySelectorAll<HTMLElement>('[data-atlas-row]').forEach(row => {
      let ok = !needle || (row.textContent ?? '').toLowerCase().includes(needle);
      for (const control of filters) {
        const key = control.getAttribute('data-atlas-filter-key');
        const value = control.value;
        if (value && value !== 'all' && row.getAttribute(`data-${key}`) !== value) ok = false;
      }
      row.hidden = !ok;
      if (ok) visible++;
    });
    const empty = root.querySelector<HTMLElement>(`[data-atlas-empty-for="${targetId}"]`);
    if (empty) empty.hidden = visible !== 0;
  };

  const onInput = (event: Event) => {
    const el = event.target as HTMLElement;
    const id = el.getAttribute?.('data-atlas-search') ?? el.getAttribute?.('data-atlas-filter');
    if (id) applyFilters(id);
  };

  const onClick = (event: MouseEvent) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-atlas-tab],[data-atlas-open],[data-atlas-close]',
    );
    if (!el) return;

    if (el.hasAttribute('data-atlas-tab')) {
      const group = el.getAttribute('data-atlas-tabs');
      const tab = el.getAttribute('data-atlas-tab');
      root.querySelectorAll<HTMLElement>(`[data-atlas-tabs="${group}"]`).forEach(node => {
        if (node.hasAttribute('data-atlas-tab')) {
          const on = node.getAttribute('data-atlas-tab') === tab;
          node.classList.toggle(node.getAttribute('data-atlas-active-class') ?? 'atlas-tabBtnActive', on);
          node.setAttribute('aria-selected', String(on));
        } else if (node.hasAttribute('data-atlas-panel')) {
          node.hidden = node.getAttribute('data-atlas-panel') !== tab;
        }
      });
    } else if (el.hasAttribute('data-atlas-open')) {
      // Botão que fecha um diálogo e abre outro (ex.: "Próxima etapa").
      if (el.hasAttribute('data-atlas-close')) el.closest('dialog')?.close();
      const dialog = root.querySelector<HTMLDialogElement>(`#${CSS.escape(el.getAttribute('data-atlas-open')!)}`);
      dialog?.showModal?.();
    } else {
      el.closest('dialog')?.close();
    }
  };

  root.addEventListener('input', onInput);
  root.addEventListener('change', onInput);
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('input', onInput);
    root.removeEventListener('change', onInput);
    root.removeEventListener('click', onClick);
  };
}
