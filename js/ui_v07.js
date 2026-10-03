(() => {
  'use strict';

  const app = window.VALKARIA_APP;
  if (!app || !window.L) return;

  const $ = id => document.getElementById(id);
  const intro = $('atlasIntro');
  const openAtlasBtn = $('openAtlasBtn');
  const toolsTab = $('toolsTab');
  const toolsPanel = $('toolsPanel');
  const toolsCloseBtn = $('toolsCloseBtn');
  const detailsDrawer = $('detailsDrawer');
  const detailsCloseBtn = $('detailsCloseBtn');
  const details = $('details');
  const detailsTitle = $('detailsTitle');
  const titlePlaque = $('titlePlaque');
  const zoomInBtn = $('zoomInBtn');
  const zoomOutBtn = $('zoomOutBtn');
  const zoomLevelLabel = $('zoomLevelLabel');
  const relativeScaleLabel = $('relativeScaleLabel');
  const resetAtlasBtn = $('resetAtlasBtn');
  const legendItems = $('legendItems');
  const legendFull = $('legendFull');
  const legendModal = $('legendModal');
  const legendExpandBtn = $('legendExpandBtn');
  const legendIndexBtn = $('legendIndexBtn');
  const legendModalClose = $('legendModalClose');
  const sessionType = $('sessionMarkerType');
  const sessionNote = $('sessionMarkerNote');
  const applySessionMarkerBtn = $('applySessionMarkerBtn');
  const clearSessionMarkersBtn = $('clearSessionMarkersBtn');
  const searchInput = $('searchInput');
  const searchResults = $('searchResults');

  const sessionLayer = L.layerGroup().addTo(app.map);
  const sessionMarks = new Map();

  const ESC = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const sessionDefs = {
    important: { glyph: '★', label: 'Importante' },
    visit: { glyph: '◇', label: 'Visitar' },
    danger: { glyph: '⚠', label: 'Perigo' },
    npc: { glyph: '♟', label: 'NPC' },
    clue: { glyph: '?', label: 'Pista' }
  };

  function openTools() {
    toolsPanel.classList.add('is-open');
    toolsPanel.setAttribute('aria-hidden', 'false');
    toolsTab.setAttribute('aria-expanded', 'true');
  }

  function closeTools() {
    toolsPanel.classList.remove('is-open');
    toolsPanel.setAttribute('aria-hidden', 'true');
    toolsTab.setAttribute('aria-expanded', 'false');
  }

  function openDetails() {
    detailsDrawer.classList.add('is-open');
    detailsDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDetails() {
    detailsDrawer.classList.remove('is-open');
    detailsDrawer.setAttribute('aria-hidden', 'true');
  }

  function citySummary() {
    detailsTitle.textContent = 'Valkaria';
    details.classList.remove('muted');
    details.innerHTML = `
      <h3>Valkaria</h3>
      <div class="meta-row"><span class="tag">Capital de Deheon</span><span class="tag">Metrópole</span></div>
      <p>Centro político e urbano do Reinado, Valkaria cresce muito além de seus monumentos: bairros antigos e recentes, muralhas sucessivas, comércio cotidiano, instituições, templos, passarelas, canais e comunidades extramuros formam uma cidade viva em várias escalas.</p>
      <p><strong>Como explorar:</strong> aproxime o mapa para revelar gradualmente instituições e estabelecimentos. Clique em um território para consultar seu perfil urbano ou em um medalhão para abrir a ficha do local.</p>
      <p><strong>Ferramentas:</strong> a aba à esquerda controla camadas, categorias, marcas temporárias, Modo Mestre e cartografia técnica.</p>`;
    openDetails();
  }

  toolsTab?.addEventListener('click', () => toolsPanel.classList.contains('is-open') ? closeTools() : openTools());
  toolsCloseBtn?.addEventListener('click', closeTools);
  detailsCloseBtn?.addEventListener('click', closeDetails);
  titlePlaque?.addEventListener('click', citySummary);

  document.querySelectorAll('.tool-section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.nextElementSibling;
      if (body) body.hidden = expanded;
    });
  });

  // Abertura do livro: visual forte, uso cotidiano rápido e silencioso.
  openAtlasBtn?.addEventListener('click', () => {
    intro.classList.add('is-opening');
    window.setTimeout(() => {
      intro.hidden = true;
      app.map.invalidateSize(false);
      app.map.fitBounds(app.bounds, { animate: false });
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 10 : 720);
  });

  function updateZoomUI(detail = {}) {
    const zoom = Number.isFinite(detail.zoom) ? detail.zoom : app.map.getZoom();
    const band = detail.band || app.zoomBand(zoom);
    const labels = { city: 'Visão da Cidade', district: 'Visão Distrital', local: 'Visão Local' };
    if (zoomLevelLabel) zoomLevelLabel.textContent = labels[band] || 'Visão do Atlas';
    if (relativeScaleLabel) {
      const relative = Math.max(1, Math.pow(2, zoom + 2));
      relativeScaleLabel.textContent = `escala relativa ${relative < 10 ? relative.toFixed(1) : Math.round(relative)}×`;
    }
  }

  zoomInBtn?.addEventListener('click', () => app.map.zoomIn(0.5));
  zoomOutBtn?.addEventListener('click', () => app.map.zoomOut(0.5));
  document.addEventListener('valkaria:zoom', event => updateZoomUI(event.detail));
  updateZoomUI();

  function appendSessionNote(feature) {
    const mark = sessionMarks.get(feature.id);
    if (!mark) return;
    const def = sessionDefs[mark.type];
    details.querySelector('.session-note')?.remove();
    details.insertAdjacentHTML('beforeend', `<div class="session-note"><strong>${ESC(def.glyph)} ${ESC(def.label)}</strong>${mark.note ? `<br>${ESC(mark.note)}` : ''}</div>`);
  }

  function markerPosition(feature, layer) {
    if (feature.geometria === 'point') return app.xy(feature.x, feature.y);
    if (layer?.getBounds) return layer.getBounds().getCenter();
    return null;
  }

  function makeSessionIcon(mark) {
    const def = sessionDefs[mark.type];
    return L.divIcon({
      className: 'poi-div-icon',
      html: `<div class="poi-wrap"><span class="session-mark">${ESC(def.glyph)}</span></div>`,
      iconSize: [24, 24], iconAnchor: [12, 12]
    });
  }

  function renderSessionMark(feature, layer, type, note) {
    const position = markerPosition(feature, layer);
    if (!position) return;
    const existing = sessionMarks.get(feature.id);
    if (existing?.marker) sessionLayer.removeLayer(existing.marker);

    const mark = { type, note: note.trim(), marker: null };
    const marker = L.marker(position, { icon: makeSessionIcon(mark), interactive: true, zIndexOffset: 1000 });
    const def = sessionDefs[type];
    marker.bindTooltip(`${def.glyph} ${def.label}${mark.note ? `<br>${ESC(mark.note)}` : ''}`, { className: 'map-label', direction: 'top' });
    marker.on('click', () => {
      const record = app.featureLayers.get(feature.id);
      app.selectFeature(feature, record?.layer || layer, false);
    });
    marker.addTo(sessionLayer);
    mark.marker = marker;
    sessionMarks.set(feature.id, mark);
    appendSessionNote(feature);
  }

  applySessionMarkerBtn?.addEventListener('click', () => {
    const feature = app.selectedFeature;
    if (!feature) return;
    renderSessionMark(feature, app.selectedLayer, sessionType.value, sessionNote.value);
    sessionNote.value = '';
  });

  clearSessionMarkersBtn?.addEventListener('click', () => {
    sessionLayer.clearLayers();
    sessionMarks.clear();
    if (app.selectedFeature) {
      details.innerHTML = app.featureHtml(app.selectedFeature);
    }
  });

  document.addEventListener('valkaria:select', event => {
    const { feature } = event.detail;
    if (detailsTitle) detailsTitle.textContent = feature.nome;
    if (applySessionMarkerBtn) applySessionMarkerBtn.disabled = false;
    appendSessionNote(feature);
    openDetails();
    searchResults?.classList.remove('has-results');
  });

  document.addEventListener('valkaria:selection-cleared', () => {
    if (applySessionMarkerBtn) applySessionMarkerBtn.disabled = true;
  });

  // Legenda contextual e índice completo.
  const categoryDefs = window.VALKARIA_CATEGORIES || {};
  const categoryOrder = ['comercio','alimentacao','hospedagem','vida_noturna','adulto','jogos','mercado_cinza','religiao','educacao','saude','magia','funerario','guarda','governo','cultura','transporte','historico','campanha','drogas','trafico_pessoas','submundo'];

  function iconData(category) {
    const dummy = { categorias: [category], camada: category === 'historico' ? 'historia' : category === 'campanha' ? 'campanha' : 'economia' };
    return { glyph: app.markerIconSvg ? app.markerIconSvg(dummy) : app.markerGlyph(dummy), family: app.markerFamily(dummy) };
  }

  function legendMedallion(category) {
    const { glyph, family } = iconData(category);
    return `<span class="legend-medallion family-${ESC(family)}">${glyph}</span>`;
  }

  function activeCategories() {
    const boxes = [...document.querySelectorAll('#categoryFilters input')];
    const labels = [...document.querySelectorAll('#categoryFilters .status-filter')];
    const active = [];
    boxes.forEach((box, index) => {
      if (box.checked && !box.disabled && !labels[index]?.hidden) {
        const text = labels[index]?.querySelector('span')?.textContent;
        const key = Object.keys(categoryDefs).find(k => categoryDefs[k] === text);
        if (key) active.push(key);
      }
    });
    return active;
  }

  function refreshContextLegend() {
    if (!legendItems) return;
    const active = new Set(activeCategories());
    const visible = categoryOrder.filter(key => active.has(key)).slice(0, 8);
    legendItems.innerHTML = visible.map(key => `<div class="legend-item">${legendMedallion(key)}<span>${ESC(categoryDefs[key])}</span></div>`).join('');
    if (!visible.length) legendItems.innerHTML = '<span class="muted" style="font-size:.68rem">Nenhuma categoria ativa.</span>';
  }

  function buildFullLegend() {
    if (!legendFull) return;
    legendFull.innerHTML = categoryOrder.filter(key => categoryDefs[key]).map(key => `
      <div class="legend-card">${legendMedallion(key)}<div><strong>${ESC(categoryDefs[key])}</strong><br><span class="muted">Selo cartográfico</span></div></div>`).join('');
  }

  document.querySelectorAll('#categoryFilters input').forEach(input => input.addEventListener('change', refreshContextLegend));
  buildFullLegend();
  refreshContextLegend();

  function openLegend() { legendModal.hidden = false; }
  function closeLegend() { legendModal.hidden = true; }
  legendExpandBtn?.addEventListener('click', openLegend);
  legendIndexBtn?.addEventListener('click', openLegend);
  legendModalClose?.addEventListener('click', closeLegend);
  legendModal?.addEventListener('click', event => { if (event.target === legendModal) closeLegend(); });

  // Reset V59: mantém filtros e conteúdo; limpa apenas navegação/seleção/marcas temporárias.
  resetAtlasBtn?.addEventListener('click', () => {
    app.clearSelection();
    sessionLayer.clearLayers();
    sessionMarks.clear();
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.remove('has-results');
    closeDetails();
    closeTools();
    app.map.fitBounds(app.bounds, { animate: true, duration: .45 });
  });

  // Fechar resultados ao clicar fora da busca.
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('#mapSearch')) searchResults?.classList.remove('has-results');
  });

  // Atalhos V57.
  document.addEventListener('keydown', event => {
    const target = event.target;
    const typing = target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName);
    if (event.key === 'Escape') {
      closeLegend();
      searchResults?.classList.remove('has-results');
      if (detailsDrawer.classList.contains('is-open')) closeDetails();
      else closeTools();
      return;
    }
    if (typing) return;
    if (event.key === '/') { event.preventDefault(); searchInput?.focus(); }
    if (event.key.toLowerCase() === 'f') { toolsPanel.classList.contains('is-open') ? closeTools() : openTools(); }
    if (event.key.toLowerCase() === 'm') {
      openTools();
      const masterToggle = [...document.querySelectorAll('.tool-section-toggle')].find(el => el.textContent.trim() === 'Mestre');
      if (masterToggle && masterToggle.getAttribute('aria-expanded') !== 'true') masterToggle.click();
      $('gmBtn')?.focus();
    }
  });

  // Garante que a legenda acompanhe a revelação do modo Mestre.
  $('gmBtn')?.addEventListener('click', () => window.setTimeout(refreshContextLegend, 0));
})();
