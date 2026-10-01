/*
 * Atlas — script das telas HTML estáticas.
 *
 * Só roda quando a tela é aberta sozinha (arquivo .html no navegador ou num
 * servidor qualquer): desenha a barra de navegação com o menu Toolkit e
 * cuida do tema claro/escuro. A interação da tela (busca, filtros, abas,
 * diálogos, estrelas…) é do assets/atlas-behaviors.js, carregado antes deste.
 *
 * Dentro do Backstage este arquivo NÃO é carregado: a barra é a do portal
 * (shell/nav), que tem a mesma lista de telas e o mesmo Toolkit.
 */
(function () {
  'use strict';

  /* --------------------------------------------------------- navegação --- */

  // Mesma ordem do portal (shell/nav/AtlasTopNav.tsx). ['-', 'Atlas'] é o
  // rótulo da seção do time do Atlas; nas telas avulsas ela aparece sempre.
  var NAV = [
    ['home', 'Home'],
    ['create', 'Ofertas'],
    ['skills', 'Skills'],
    ['approvals', 'Aprovações'],
    ['provisioning-map', 'Mapa de provisionamento'],
    ['learning-paths', 'Trilhas'],
    ['docs', 'Docs'],
    ['agent', 'Agente'],
    ['break-glass', 'Break Glass'],
    ['status', 'Status'],
    ['-', 'Atlas'],
    ['catalog', 'Catálogo'],
    ['apis', 'APIs'],
    ['atlas-jira', 'Atlas × Jira'],
    ['api-keys', 'API Keys'],
    ['admin', 'Administração'],
  ];

  // Mesma lista do menu Toolkit do portal (screens/home/toolkit.tsx).
  var TOOLKIT = [
    ['Release Notes', 'https://github.com/gomesfe/backstage-lab/releases', '', 'doc'],
    ['GitHub', 'https://github.com', '', 'github'],
    ['AWS', 'https://console.aws.amazon.com', '#ff9900', 'cloud'],
    ['SonarQube', 'https://sonarcloud.io', 'var(--info)', 'chartBox'],
    ['Veracode', 'https://analysiscenter.veracode.com', 'var(--info)', 'shield'],
    ['Indicadores DevOps', 'https://dora.dev', 'var(--danger)', 'line'],
  ];

  var ICON = {
    doc: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>',
    github: '<path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 0 1 .64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 0 1 0-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 0 1 0 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0 0 12 1.27"/>',
    cloud: '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>',
    chartBox: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
    shield: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
    line: '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>',
    search: '<path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
    people: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    apps: '<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>',
    bell: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>',
    sun: '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>',
    moon: '<path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/>',
    gear: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
  };

  function svg(name, color) {
    return (
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"' +
      (color ? ' style="color:' + color + '"' : '') +
      '>' + ICON[name] + '</svg>'
    );
  }

  function screenHref(slug) {
    return '../' + slug + '/index.html';
  }

  function renderNav() {
    var header = document.querySelector('[data-atlas-nav]');
    if (!header) return;
    var current = document.body.getAttribute('data-screen');

    var pills = NAV.map(function (item) {
      if (item[0] === '-') return '<span class="atlas-navSection" aria-hidden="true">' + item[1] + '</span>';
      var active = item[0] === current;
      return (
        '<a class="atlas-navPill' + (active ? ' atlas-navPillActive' : '') + '" href="' +
        screenHref(item[0]) + '"' + (active ? ' aria-current="page"' : '') + '>' + item[1] + '</a>'
      );
    }).join('');

    var tools = TOOLKIT.map(function (tool) {
      return (
        '<a class="atlas-appDockItem" role="menuitem" href="' + tool[1] +
        '" target="_blank" rel="noreferrer noopener">' +
        '<span class="atlas-appDockIcon"' + (tool[2] ? ' style="color:' + tool[2] + '"' : '') + '>' +
        svg(tool[3]) + '</span><span class="atlas-appDockName">' + tool[0] + '</span></a>'
      );
    }).join('');

    header.className = 'atlas-topNav atlas-topNav--fixed';
    header.innerHTML =
      '<div class="atlas-navLeft">' +
      '<a class="atlas-brandLogo" href="' + screenHref('home') + '" aria-label="Atlas — ir para a Home">' +
      '<img class="atlas-logoDark" src="../../assets/brand/atlas-horizontal-escuro.svg" alt="" height="26">' +
      '<img class="atlas-logoLight" src="../../assets/brand/atlas-horizontal-claro.svg" alt="" height="26">' +
      '</a>' +
      '<div class="atlas-navPillsWrapper"><nav class="atlas-navPills" aria-label="Navegação principal">' + pills + '</nav></div>' +
      '</div>' +
      '<div class="atlas-navRight">' +
      '<a class="atlas-navActionBtn" href="' + screenHref('search') + '" aria-label="Buscar" title="Buscar">' + svg('search') + '</a>' +
      '<div class="atlas-navDropdownWrapper">' +
      '<button type="button" class="atlas-navActionBtn" aria-label="Toolkit" title="Toolkit" aria-haspopup="true" aria-expanded="false" data-atlas-toolkit>' + svg('apps') + '</button>' +
      '<div class="atlas-navDropdownMenu" role="menu" aria-label="Toolkit" hidden style="width:min(360px,calc(100vw - 32px));padding:8px 0 14px">' +
      '<div class="atlas-dropdownHeader">Toolkit</div>' +
      '<div class="atlas-appDockGridCompact" style="grid-template-columns:repeat(3,1fr);padding:8px 14px 0">' + tools + '</div>' +
      '</div></div>' +
      '<a class="atlas-navActionBtn" href="' + screenHref('my-groups') + '" aria-label="Meus grupos" title="Meus grupos">' + svg('people') + '</a>' +
      '<a class="atlas-navActionBtn" href="' + screenHref('notifications') + '" aria-label="Notificações" title="Notificações">' + svg('bell') + '</a>' +
      '<button type="button" class="atlas-navActionBtn" aria-label="Alternar tema" data-atlas-theme-toggle></button>' +
      '<a class="atlas-navActionBtn" href="' + screenHref('settings') + '" aria-label="Configurações" title="Configurações">' + svg('gear') + '</a>' +
      '</div>';

    // A pílula da tela atual fica visível mesmo quando a barra não cabe.
    var activePill = header.querySelector('.atlas-navPillActive');
    if (activePill) {
      var strip = activePill.parentNode;
      strip.scrollLeft = activePill.offsetLeft - (strip.clientWidth - activePill.offsetWidth) / 2;
    }

    // Toolkit: abre/fecha no botão, fecha com clique fora ou Esc.
    var toggle = header.querySelector('[data-atlas-toolkit]');
    var menu = toggle.nextElementSibling;
    function setOpen(open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', function () { setOpen(menu.hidden); });
    document.addEventListener('pointerdown', function (event) {
      if (!toggle.parentNode.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
  }

  /* -------------------------------------------------------------- tema --- */

  function initTheme() {
    var button = document.querySelector('[data-atlas-theme-toggle]');
    function current() {
      return document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
    function paint() {
      if (!button) return;
      var dark = current() === 'dark';
      button.innerHTML = svg(dark ? 'sun' : 'moon');
      button.title = dark ? 'Tema claro' : 'Tema escuro';
    }
    function set(theme) {
      document.body.setAttribute('data-theme', theme);
      try { localStorage.setItem('atlas-theme', theme); } catch (e) { /* sem storage */ }
      paint();
    }

    var saved = null;
    try { saved = localStorage.getItem('atlas-theme'); } catch (e) { /* sem storage */ }
    if (saved === 'light' || saved === 'dark') document.body.setAttribute('data-theme', saved);
    paint();
    if (button) {
      button.addEventListener('click', function () { set(current() === 'light' ? 'dark' : 'light'); });
    }
    return { set: set, current: current };
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderNav();
    var theme = initTheme();
    // Busca, filtros, abas, diálogos, estrelas… — assets/atlas-behaviors.js.
    if (window.AtlasBehaviors) {
      window.AtlasBehaviors.enhance(document.querySelector('[data-atlas-screen]') || document.body, {
        setTheme: theme.set,
        currentTheme: theme.current,
      });
    }
  });
})();
