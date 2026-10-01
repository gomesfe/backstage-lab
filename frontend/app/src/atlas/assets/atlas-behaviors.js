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
 * FILTRO POR COLUNA (automático)
 *   Toda tabela cujo <tbody id> tem linhas [data-atlas-row] ganha um funil ao
 *   lado de cada título; ele abre um campo que filtra a coluna pelo texto
 *   (soma com a busca e os filtros da lista). Ficam de fora as colunas
 *   "Ações" e "Detalhes", ou qualquer <th data-atlas-nofilter>. A tabela
 *   inteira sai com <table data-atlas-nocolfilters>. "Limpar filtros" limpa também.
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
 * PREFERÊNCIAS (guardadas no navegador, `localStorage` chave atlas.<nome>)
 *   <button data-atlas-pref="nav:side">           cartão de opção: grava nav=side e marca o cartão
 *     data-atlas-pref-default no cartão que vale quando nada foi escolhido.
 *   <button data-atlas-pref-switch="internal">    interruptor: liga/desliga (internal=1)
 *   <button data-atlas-if-pref="internal">        só aparece com internal=1 (aba, bloco…).
 *     Se era a aba aberta e some, a primeira aba visível abre no lugar.
 *   Quem grava avisa o portal com o evento "atlas:prefs" na janela (o menu lateral
 *   do portal escuta o mesmo).
 *
 *   <select data-atlas-pref-select="team" data-atlas-pref-default="plataforma">  lista que grava a preferência.
 *   <span|a data-atlas-by-pref="team" data-v-pagamentos="6" data-h-pagamentos="/x">  muda o texto (data-v-<valor>)
 *   e/ou o link (data-h-<valor>) conforme a preferência: números e links "do meu time".
 *
 * SAUDAÇÃO E PERGUNTA (home)
 *   <h1 data-atlas-greeting>Bem-vindo ao Atlas</h1>   vira "Bom dia, Ana" conforme a hora;
 *   o nome vem de data-atlas-user na raiz (o portal preenche com o perfil de login).
 *   <input data-atlas-ask-input> + <a data-atlas-ask-go href="../agent/index.html">:
 *   ao clicar (ou Enter), o texto vai na ?q= do link. <textarea data-atlas-prefill="q">
 *   na tela de destino recebe esse q.
 *
 * TEMPO DECORRIDO
 *   <time datetime="2026-09-29T11:00" data-atlas-ago>29/09/26 11:00</time>
 *   vira "há 3 h" (e se atualiza ao abrir um diálogo). O HTML fica estático;
 *   o "há quanto tempo" nunca envelhece.
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

  // "há 5 min", "há 3 h", "há 2 dias" — a partir do datetime.
  function ago(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    var minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
    if (minutes < 1) return 'agora há pouco';
    if (minutes < 60) return 'há ' + minutes + ' min';
    var hours = Math.round(minutes / 60);
    if (hours < 24) return 'há ' + hours + ' h';
    var days = Math.round(hours / 24);
    return days === 1 ? 'há 1 dia' : 'há ' + days + ' dias';
  }

  function updateAgo(root) {
    all(root, '[data-atlas-ago]').forEach(function (el) {
      var text = ago(el.getAttribute('datetime'));
      if (text) el.textContent = text;
    });
  }

  function getPref(key) {
    try { return global.localStorage.getItem('atlas.' + key); } catch (e) { return null; }
  }

  function setPref(key, value) {
    try {
      if (!value) global.localStorage.removeItem('atlas.' + key);
      else global.localStorage.setItem('atlas.' + key, value);
    } catch (e) { /* sem armazenamento: vale até recarregar */ }
    global.dispatchEvent(new Event('atlas:prefs'));
  }

  function syncPrefs(root) {
    all(root, '[data-atlas-pref]').forEach(function (btn) {
      var kv = btn.getAttribute('data-atlas-pref').split(':');
      var current = getPref(kv[0]);
      var on = current ? current === kv[1] : btn.hasAttribute('data-atlas-pref-default');
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('atlas-modalActionOptionChecked', on);
    });
    all(root, '[data-atlas-pref-select]').forEach(function (sel) {
      var cur = getPref(sel.getAttribute('data-atlas-pref-select')) || sel.getAttribute('data-atlas-pref-default');
      if (cur && sel.value !== cur) sel.value = cur;
    });
    all(root, '[data-atlas-by-pref]').forEach(function (el) {
      var key = el.getAttribute('data-atlas-by-pref');
      var sel = root.querySelector('[data-atlas-pref-select="' + key + '"]');
      var cur = getPref(key) || (sel && sel.getAttribute('data-atlas-pref-default'));
      if (!cur) return;
      var text = el.getAttribute('data-v-' + cur);
      var href = el.getAttribute('data-h-' + cur);
      if (text !== null) el.textContent = text;
      if (href !== null) el.setAttribute('href', href);
    });
    all(root, '[data-atlas-pref-switch]').forEach(function (btn) {
      var on = getPref(btn.getAttribute('data-atlas-pref-switch')) === '1';
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('atlas-switchOn', on);
    });
    all(root, '[data-atlas-if-pref]').forEach(function (el) {
      var show = getPref(el.getAttribute('data-atlas-if-pref')) === '1';
      el.hidden = !show;
      if (!show && el.getAttribute('aria-selected') === 'true') {
        var group = el.getAttribute('data-atlas-tabs');
        var first = all(root, '[data-atlas-tabs="' + group + '"][data-atlas-tab]').filter(function (b) { return !b.hidden; })[0];
        if (first) { openTab(root, group, first.getAttribute('data-atlas-tab')); }
      }
    });
  }

  function greet(root) {
    var user = (root.getAttribute('data-atlas-user') || '').trim();
    var hour = new Date().getHours();
    var period = hour < 5 ? 'Boa noite' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    all(root, '[data-atlas-greeting]').forEach(function (el) {
      if (user) el.textContent = period + ', ' + user;
    });
  }

  function filterValue(control) {
    if (control.tagName === 'SELECT' || control.tagName === 'INPUT') return control.value;
    var active = control.querySelector('[data-atlas-value][aria-pressed="true"]');
    return active ? active.getAttribute('data-atlas-value') : 'all';
  }

  function targetsOf(control, attr) {
    return (control.getAttribute(attr) || '').split(/\s+/).filter(Boolean);
  }

  var FUNNEL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/></svg>';
  var NO_FILTER_TITLES = ['', 'ações', 'acoes', 'detalhes'];

  function rowPassesColumns(row) {
    var table = row.closest('table');
    var cols = table && table.__atlasCols;
    if (!cols) return true;
    return Object.keys(cols).every(function (idx) {
      var needle = cols[idx];
      var cell = row.cells[idx];
      return !needle || (cell && cell.textContent.toLowerCase().indexOf(needle) !== -1);
    });
  }

  function closePopovers(root) {
    all(root, '.atlas-popover[data-atlas-colpopover]').forEach(function (pop) { pop.parentNode.removeChild(pop); });
  }

  function setupColumnFilters(root) {
    all(root, 'table').forEach(function (table) {
      var body = table.querySelector('tbody[id]');
      if (table.hasAttribute('data-atlas-nocolfilters') || table.hasAttribute('data-atlas-colfilters-ready')) return;
      if (!body || !body.querySelector('[data-atlas-row]')) return;
      table.setAttribute('data-atlas-colfilters-ready', '');
      all(table, 'thead th').forEach(function (th) {
        var title = th.textContent.trim();
        if (th.hasAttribute('data-atlas-nofilter') || NO_FILTER_TITLES.indexOf(title.toLowerCase()) !== -1) return;
        var wrap = document.createElement('span');
        wrap.className = 'atlas-thFilter';
        while (th.firstChild) wrap.appendChild(th.firstChild);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'atlas-colFilterBtn';
        btn.setAttribute('data-atlas-colfilter', String(th.cellIndex));
        btn.setAttribute('aria-label', 'Filtrar por ' + title);
        btn.setAttribute('title', 'Filtrar por ' + title);
        btn.innerHTML = FUNNEL;
        wrap.appendChild(btn);
        th.appendChild(wrap);
      });
    });
  }

  function openColumnPopover(root, btn) {
    var same = btn.parentNode.querySelector('.atlas-popover[data-atlas-colpopover]');
    closePopovers(root);
    if (same) return;
    var table = btn.closest('table');
    var idx = btn.getAttribute('data-atlas-colfilter');
    var title = btn.getAttribute('aria-label');
    var pop = document.createElement('div');
    pop.className = 'atlas-popover';
    pop.setAttribute('data-atlas-colpopover', '');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', title);
    pop.innerHTML =
      '<input class="atlas-filterInput" type="search" data-atlas-colinput placeholder="' + title + '" aria-label="' + title + '">' +
      '<div class="atlas-popoverActions"><button type="button" class="atlas-btnPill" data-atlas-colclear>Limpar</button>' +
      '<button type="button" class="atlas-btnPill" data-atlas-colclose>Fechar</button></div>';
    var input = pop.querySelector('input');
    input.value = (table.__atlasCols && table.__atlasCols[idx]) || '';
    var rect = btn.getBoundingClientRect();
    pop.style.top = Math.round(rect.bottom + 6) + 'px';
    pop.style.left = Math.max(8, Math.min(Math.round(rect.left), global.innerWidth - 268)) + 'px';
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Enter') { closePopovers(root); btn.focus(); }
    });
    btn.parentNode.appendChild(pop);
    input.focus();
  }

  function setColumnFilter(root, btn, value) {
    var table = btn.closest('table');
    table.__atlasCols = table.__atlasCols || {};
    table.__atlasCols[btn.getAttribute('data-atlas-colfilter')] = value.trim().toLowerCase();
    btn.classList.toggle('atlas-colFilterBtnActive', !!value.trim());
    var body = table.querySelector('tbody[id]');
    if (body) applyFilters(root, body.id);
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
      var ok = (!needle || row.textContent.toLowerCase().indexOf(needle) !== -1) && rowPassesColumns(row);
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
      all(root, '[data-atlas-prefill="q"]').forEach(function (el) { el.value = params.q; });
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
      if (el.hasAttribute('data-atlas-pref-select')) setPref(el.getAttribute('data-atlas-pref-select'), el.value);
      if (el.hasAttribute('data-atlas-colinput')) {
        var owner = el.parentNode.parentNode.querySelector('[data-atlas-colfilter]');
        if (owner) setColumnFilter(root, owner, el.value);
      } else if (el.hasAttribute('data-atlas-search')) refilter(root, el, 'data-atlas-search');
      else if (el.hasAttribute('data-atlas-filter')) refilter(root, el, 'data-atlas-filter');
    }

    function onClick(event) {
      if (!(event.target.closest && event.target.closest('.atlas-thFilter'))) closePopovers(root);
      var go = event.target.closest && event.target.closest('[data-atlas-ask-go]');
      if (go && root.contains(go)) {
        var box = root.querySelector('[data-atlas-ask-input]');
        var base = (go.getAttribute('data-atlas-ask-base') || go.getAttribute('href') || '').split('?')[0];
        go.setAttribute('data-atlas-ask-base', base);
        var text = box ? box.value.trim() : '';
        go.setAttribute('href', text ? base + '?q=' + encodeURIComponent(text) : base);
        return;
      }
      var el = event.target.closest && event.target.closest(
        '[data-atlas-pref],[data-atlas-pref-switch],[data-atlas-colfilter],[data-atlas-colclear],[data-atlas-colclose],[data-atlas-value],[data-atlas-tab],[data-atlas-open],[data-atlas-close],[data-atlas-toggle],[data-atlas-reset],[data-atlas-set-theme],[data-atlas-signout]',
      );
      if (!el || !root.contains(el)) return;

      if (el.hasAttribute('data-atlas-pref')) {
        var kv = el.getAttribute('data-atlas-pref').split(':');
        setPref(kv[0], kv[1]);
      } else if (el.hasAttribute('data-atlas-pref-switch')) {
        var key = el.getAttribute('data-atlas-pref-switch');
        setPref(key, getPref(key) === '1' ? '' : '1');
      } else if (el.hasAttribute('data-atlas-colfilter')) {
        openColumnPopover(root, el);
      } else if (el.hasAttribute('data-atlas-colclear')) {
        var wrap = el.closest('.atlas-thFilter');
        var opener = wrap.querySelector('[data-atlas-colfilter]');
        wrap.querySelector('[data-atlas-colinput]').value = '';
        setColumnFilter(root, opener, '');
        opener.focus();
        closePopovers(root);
      } else if (el.hasAttribute('data-atlas-colclose')) {
        closePopovers(root);
      } else if (el.hasAttribute('data-atlas-value')) {
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
        updateAgo(root);
        if (dialog && dialog.showModal && !dialog.open) dialog.showModal();
      } else if (el.hasAttribute('data-atlas-close')) {
        var parent = el.closest('dialog');
        if (parent) parent.close();
      } else if (el.hasAttribute('data-atlas-toggle')) {
        toggle(root, el);
      } else if (el.hasAttribute('data-atlas-reset')) {
        targetsOf(el, 'data-atlas-reset').forEach(function (id) {
          all(root, '[data-atlas-search="' + id + '"]').forEach(function (s) { s.value = ''; });
          var resetBody = root.querySelector('#' + id);
          var resetTable = resetBody && resetBody.closest('table');
          if (resetTable) {
            resetTable.__atlasCols = {};
            all(resetTable, '.atlas-colFilterBtnActive').forEach(function (b) { b.classList.remove('atlas-colFilterBtnActive'); });
          }
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

    setupColumnFilters(root);
    function onAskKey(event) {
      if (event.key !== 'Enter' || !event.target.hasAttribute || !event.target.hasAttribute('data-atlas-ask-input')) return;
      event.preventDefault();
      var go = root.querySelector('[data-atlas-ask-go]');
      if (go) go.click();
    }
    root.addEventListener('keydown', onAskKey);
    root.addEventListener('atlas:user', function () { greet(root); });
    var onPrefs = function () { syncPrefs(root); };
    global.addEventListener('atlas:prefs', onPrefs);
    syncPrefs(root);
    greet(root);
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
    updateAgo(root);
    function onHash() { openHash(root, global.location.hash); }
    onHash();
    global.addEventListener('hashchange', onHash);

    return function () {
      root.removeEventListener('input', onInput);
      root.removeEventListener('change', onInput);
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onAskKey);
      global.removeEventListener('atlas:prefs', onPrefs);
      global.removeEventListener('hashchange', onHash);
    };
  }

  global.AtlasBehaviors = { enhance: enhance, openHash: openHash };
})(typeof window !== 'undefined' ? window : this);
