/*
 * Atlas — interação das telas HTML, declarada por atributo.
 *
 * Um arquivo só para os dois lugares: a versão avulsa carrega com
 * <script src="../../assets/atlas-behaviors.js">, e o portal importa este
 * mesmo arquivo (shell/html/enhance.ts). Nada aqui grava dado: é para as
 * telas mostrarem o visual e reagirem ao clique.
 *
 * FILTRO DE LISTA
 *   <tbody id="t">…<tr data-atlas-row data-type="x">       linha filtrável
 *   <input data-atlas-search="t">                            busca por texto
 *   <select data-atlas-filter="t" data-atlas-filter-key="type">
 *   <div data-atlas-filter="t" data-atlas-filter-key="type"> grupo de botões
 *     <button data-atlas-value="all">Todos</button>          (pílulas, abas)
 *     <button data-atlas-value="x">X</button>
 *   valor "chave:valor" num botão filtra por outra chave (ex.: "saved:1").
 *   data-atlas-toggle-off no grupo: clicar no botão ativo desliga (= all).
 *   data-atlas-filter="t1 t2" filtra mais de uma lista.
 *   <div data-atlas-empty-for="t" hidden>                    aparece se nada sobra
 *   <button data-atlas-reset="t">                            limpa busca e filtros
 *
 * ABAS
 *   <button data-atlas-tabs="g" data-atlas-tab="a">  <div data-atlas-tabs="g" data-atlas-panel="a">
 *   A aba ativa ganha atlas-tabBtnActive (ou a classe em data-atlas-active-class).
 *   Se o endereço tem #a e existe a aba "a", ela abre sozinha.
 *
 * DIÁLOGOS
 *   <button data-atlas-open="d">  abre <dialog id="d">; com data-atlas-close,
 *   fecha o diálogo atual antes.   <button data-atlas-close> fecha.
 *
 * LIGA/DESLIGA (estrela, lido, salvar, copiar, mostrar filtros…)
 *   <button data-atlas-toggle aria-pressed="false">
 *     <span class="atlas-whenOn">★</span><span class="atlas-whenOff">☆</span>
 *   data-atlas-toggle-class="c"       alterna a classe c no próprio botão
 *   data-atlas-toggle-row-class="c"   alterna c na linha (data-atlas-row) em volta
 *   data-atlas-toggle-attr="fav"      grava data-fav="1|0" na linha (on/off em
 *                                     data-atlas-on / data-atlas-off)
 *   data-atlas-toggle-target="id"     mostra/esconde #id
 *
 * NAVEGAÇÃO ENTRE TELAS
 *   ../catalog/index.html?owner=pagamentos&q=pix   chega com os filtros aplicados:
 *   q preenche a busca; cada outro parâmetro escolhe o filtro de mesma chave
 *   (data-atlas-filter-key). ../entity/index.html#payments-api abre a aba
 *   "payments-api" (links para a mesma tela também, sem recarregar).
 *
 * TEMA E SESSÃO
 *   <button data-atlas-set-theme="light|dark">   troca o tema
 *   <button data-atlas-signout>                   sair (só faz algo no portal)
 */
(function (global) {
  'use strict';

  function all(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function filterValue(control) {
    if (control.tagName === 'SELECT' || control.tagName === 'INPUT') return control.value;
    var active = control.querySelector('[data-atlas-value][aria-pressed="true"]');
    return active ? active.getAttribute('data-atlas-value') : 'all';
  }

  function targetsOf(control, attr) {
    return (control.getAttribute(attr) || '').split(/\s+/).filter(Boolean);
  }

  function applyFilters(root, targetId) {
    var target = root.querySelector('#' + targetId);
    if (!target) return;
    var search = all(root, '[data-atlas-search]').filter(function (el) {
      return targetsOf(el, 'data-atlas-search').indexOf(targetId) !== -1;
    })[0];
    var needle = search ? search.value.trim().toLowerCase() : '';
    var filters = all(root, '[data-atlas-filter]').filter(function (el) {
      return targetsOf(el, 'data-atlas-filter').indexOf(targetId) !== -1;
    });
    var visible = 0;
    all(target, '[data-atlas-row]').forEach(function (row) {
      var ok = !needle || row.textContent.toLowerCase().indexOf(needle) !== -1;
      filters.forEach(function (control) {
        var key = control.getAttribute('data-atlas-filter-key');
        var value = filterValue(control);
        if (value && value.indexOf(':') !== -1) {
          key = value.split(':')[0];
          value = value.split(':')[1];
        }
        if (value && value !== 'all' && row.getAttribute('data-' + key) !== value) ok = false;
      });
      row.hidden = !ok;
      if (ok) visible++;
    });
    all(root, '[data-atlas-empty-for="' + targetId + '"]').forEach(function (empty) {
      empty.hidden = visible !== 0;
    });
  }

  function refilter(root, control, attr) {
    targetsOf(control, attr).forEach(function (id) { applyFilters(root, id); });
  }

  function pressGroupButton(group, button) {
    var cls = group.getAttribute('data-atlas-active-class') || 'atlas-tabBtnActive';
    var turnOff = group.hasAttribute('data-atlas-toggle-off') && button.getAttribute('aria-pressed') === 'true';
    all(group, '[data-atlas-value]').forEach(function (b) {
      var on = !turnOff && b === button;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle(cls, on);
    });
  }

  function openTab(root, group, tab) {
    all(root, '[data-atlas-tabs="' + group + '"]').forEach(function (node) {
      if (node.hasAttribute('data-atlas-tab')) {
        var on = node.getAttribute('data-atlas-tab') === tab;
        node.classList.toggle(node.getAttribute('data-atlas-active-class') || 'atlas-tabBtnActive', on);
        node.setAttribute('aria-selected', String(on));
      } else if (node.hasAttribute('data-atlas-panel')) {
        node.hidden = node.getAttribute('data-atlas-panel') !== tab;
      }
    });
  }

  function toggle(root, el) {
    var on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    var cls = el.getAttribute('data-atlas-toggle-class');
    if (cls) el.classList.toggle(cls, on);
    var row = el.closest('[data-atlas-row]');
    var rowCls = el.getAttribute('data-atlas-toggle-row-class');
    if (rowCls && row) row.classList.toggle(rowCls);
    var attr = el.getAttribute('data-atlas-toggle-attr');
    if (attr && row) {
      row.setAttribute('data-' + attr, on ? (el.getAttribute('data-atlas-on') || '1') : (el.getAttribute('data-atlas-off') || '0'));
    }
    var targetId = el.getAttribute('data-atlas-toggle-target');
    if (targetId) {
      var target = root.querySelector('#' + targetId);
      if (target) target.hidden = !on;
    }
    // Uma linha mudou de estado: reaplica os filtros da lista dela.
    var list = row && row.parentNode && row.parentNode.closest('[id]');
    if (list) applyFilters(root, list.id);
  }

  function markThemeOptions(root, theme) {
    all(root, '[data-atlas-set-theme]').forEach(function (option) {
      var on = option.getAttribute('data-atlas-set-theme') === theme;
      option.classList.toggle(option.getAttribute('data-atlas-active-class') || 'atlas-modalActionOptionChecked', on);
      option.setAttribute('aria-pressed', String(on));
    });
  }

  /** Abre a aba do #hash (se existir) e rola até ela ou até o elemento com esse id. */
  function openHash(root, hash) {
    var id = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!id) return;
    // A aba pode não ter botão (ex.: uma entidade por aba): basta o painel.
    var tab = root.querySelector('[data-atlas-tab="' + id + '"]') || root.querySelector('[data-atlas-panel="' + id + '"]');
    var target = root.querySelector('[data-atlas-panel="' + id + '"]') || root.querySelector('[id="' + id + '"]');
    if (tab) openTab(root, tab.getAttribute('data-atlas-tabs'), id);
    else if (target) {
      // Âncora dentro de uma aba fechada (ex.: #…-docs): abre a aba dela.
      var panel = target.closest('[data-atlas-panel]');
      if (panel) openTab(root, panel.getAttribute('data-atlas-tabs'), panel.getAttribute('data-atlas-panel'));
    }
    // Aba inteira: volta ao topo da tela. Âncora dentro dela: rola até ela.
    if (target && target.hasAttribute('data-atlas-panel')) global.scrollTo(0, 0);
    else if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start' });
  }

  /** Filtro preenchido pelo endereço dentro de um painel de filtros fechado: abre o painel. */
  function reveal(root, control) {
    var closed = control.closest('[hidden][id]');
    if (!closed) return;
    closed.hidden = false;
    var button = root.querySelector('[data-atlas-toggle-target="' + closed.id + '"]');
    if (button) {
      button.setAttribute('aria-pressed', 'true');
      var cls = button.getAttribute('data-atlas-toggle-class');
      if (cls) button.classList.add(cls);
    }
  }

  /** ?q=…&chave=valor → busca e filtros da tela. */
  function applyQuery(root, search) {
    var params = {};
    (search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    });
    if (params.q !== undefined) {
      all(root, '[data-atlas-search]').forEach(function (s) { s.value = params.q; reveal(root, s); });
    }
    all(root, '[data-atlas-filter]').forEach(function (control) {
      var key = control.getAttribute('data-atlas-filter-key');
      if (!key || params[key] === undefined) return;
      reveal(root, control);
      if (control.tagName === 'SELECT') {
        control.value = params[key];
        if (control.value !== params[key]) control.selectedIndex = 0;
      } else {
        var button = control.querySelector('[data-atlas-value="' + params[key] + '"]');
        if (button) pressGroupButton(control, button);
      }
    });
  }

  /**
   * Liga tudo dentro de `root`. `hooks` (opcional): setTheme(theme),
   * currentTheme(), signOut(). Devolve a função que desliga.
   */
  function enhance(root, hooks) {
    hooks = hooks || {};

    function onInput(event) {
      var el = event.target;
      if (!el.getAttribute) return;
      if (el.hasAttribute('data-atlas-search')) refilter(root, el, 'data-atlas-search');
      else if (el.hasAttribute('data-atlas-filter')) refilter(root, el, 'data-atlas-filter');
    }

    function onClick(event) {
      var el = event.target.closest && event.target.closest(
        '[data-atlas-value],[data-atlas-tab],[data-atlas-open],[data-atlas-close],[data-atlas-toggle],[data-atlas-reset],[data-atlas-set-theme],[data-atlas-signout]',
      );
      if (!el || !root.contains(el)) return;

      if (el.hasAttribute('data-atlas-value')) {
        var group = el.closest('[data-atlas-filter]');
        if (group) {
          pressGroupButton(group, el);
          refilter(root, group, 'data-atlas-filter');
        }
      } else if (el.hasAttribute('data-atlas-tab')) {
        openTab(root, el.getAttribute('data-atlas-tabs'), el.getAttribute('data-atlas-tab'));
      } else if (el.hasAttribute('data-atlas-open')) {
        if (el.hasAttribute('data-atlas-close') && el.closest('dialog')) el.closest('dialog').close();
        var dialog = root.querySelector('#' + el.getAttribute('data-atlas-open'));
        if (dialog && dialog.showModal && !dialog.open) dialog.showModal();
      } else if (el.hasAttribute('data-atlas-close')) {
        var parent = el.closest('dialog');
        if (parent) parent.close();
      } else if (el.hasAttribute('data-atlas-toggle')) {
        toggle(root, el);
      } else if (el.hasAttribute('data-atlas-reset')) {
        targetsOf(el, 'data-atlas-reset').forEach(function (id) {
          all(root, '[data-atlas-search="' + id + '"]').forEach(function (s) { s.value = ''; });
          all(root, '[data-atlas-filter]').forEach(function (control) {
            if (targetsOf(control, 'data-atlas-filter').indexOf(id) === -1) return;
            if (control.tagName === 'SELECT') control.selectedIndex = 0;
            else {
              var first = control.querySelector('[data-atlas-value]');
              if (control.hasAttribute('data-atlas-toggle-off')) {
                all(control, '[data-atlas-value]').forEach(function (b) {
                  b.setAttribute('aria-pressed', 'false');
                  b.classList.remove(control.getAttribute('data-atlas-active-class') || 'atlas-tabBtnActive');
                });
              } else if (first) pressGroupButton(control, first);
            }
          });
          applyFilters(root, id);
        });
      } else if (el.hasAttribute('data-atlas-set-theme')) {
        var theme = el.getAttribute('data-atlas-set-theme');
        if (hooks.setTheme) hooks.setTheme(theme);
        markThemeOptions(root, theme);
      } else if (el.hasAttribute('data-atlas-signout') && hooks.signOut) {
        hooks.signOut();
      }
    }

    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    root.addEventListener('click', onClick);

    // Estado inicial: filtros do endereço (?q=&owner=…), tema marcado, aba do #hash.
    applyQuery(root, global.location ? global.location.search : '');
    var ids = {};
    all(root, '[data-atlas-filter],[data-atlas-search]').forEach(function (c) {
      targetsOf(c, c.hasAttribute('data-atlas-filter') ? 'data-atlas-filter' : 'data-atlas-search').forEach(function (id) { ids[id] = true; });
    });
    Object.keys(ids).forEach(function (id) { applyFilters(root, id); });
    if (hooks.currentTheme) markThemeOptions(root, hooks.currentTheme());
    function onHash() { openHash(root, global.location.hash); }
    onHash();
    global.addEventListener('hashchange', onHash);

    return function () {
      root.removeEventListener('input', onInput);
      root.removeEventListener('change', onInput);
      root.removeEventListener('click', onClick);
      global.removeEventListener('hashchange', onHash);
    };
  }

  global.AtlasBehaviors = { enhance: enhance, openHash: openHash };
})(typeof window !== 'undefined' ? window : this);
