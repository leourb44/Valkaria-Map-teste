(() => {
  'use strict';

  const config = window.VALKARIA_CONFIG;
  const layerDefs = window.VALKARIA_LAYERS;
  const statusDefs = window.VALKARIA_STATUS;
  const canonDefs = window.VALKARIA_CANON;
  const categoryDefs = window.VALKARIA_CATEGORIES || {};
  const relevanceDefs = window.VALKARIA_RELEVANCE || {};
  const gmCategoryKeys = new Set(window.VALKARIA_GM_CATEGORIES || []);
  const features = window.VALKARIA_FEATURES || [];

  if (!window.L) {
    document.body.innerHTML = '<p style="padding:2rem">Leaflet não carregou. Verifique sua conexão com a internet.</p>';
    return;
  }

  const xy = (x, y) => L.latLng(y, x);
  const bounds = L.latLngBounds(xy(0, 0), xy(config.mapWidth, config.mapHeight));
  const STORAGE_KEY = 'valkaria-calibration-v0.6';

  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    maxBounds: bounds.pad(0.15),
    maxBoundsViscosity: 0.8,
    preferCanvas: true,
    zoomControl: false,
    attributionControl: false
  });

  map.createPane('referencePane');
  map.getPane('referencePane').style.zIndex = 250;
  map.getPane('referencePane').style.pointerEvents = 'none';

  L.imageOverlay(config.baseImage, bounds, {
    pane: 'tilePane',
    interactive: false,
    opacity: 1
  }).addTo(map);
  map.fitBounds(bounds);

  const referenceOverlay = L.imageOverlay(config.referenceImage, bounds, {
    pane: 'referencePane',
    interactive: false,
    opacity: 0.35
  });

  const groups = {};
  Object.entries(layerDefs).forEach(([key, def]) => {
    groups[key] = L.layerGroup();
    if (def.visible && !def.gmOnly) groups[key].addTo(map);
  });

  const editGroup = L.layerGroup().addTo(map);
  const rosetteGroup = L.layerGroup().addTo(map);
  const rosetteMemberIds = new Set();
  let rosetteRecords = [];

  const details = document.getElementById('details');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  const layerToggles = document.getElementById('layerToggles');
  const categoryFilters = document.getElementById('categoryFilters');
  const statusFilters = document.getElementById('statusFilters');
  const canonFilters = document.getElementById('canonFilters');
  const relevanceFilters = document.getElementById('relevanceFilters');
  const homeBtn = document.getElementById('homeBtn');
  const coordsBtn = document.getElementById('coordsBtn');
  const gmBtn = document.getElementById('gmBtn');
  const calibrationBtn = document.getElementById('calibrationBtn');
  const coordsReadout = document.getElementById('coordsReadout');
  const modeBadge = document.getElementById('modeBadge');

  const calibrationPanel = document.getElementById('calibrationPanel');
  const calibrationFeature = document.getElementById('calibrationFeature');
  const editGeometryBtn = document.getElementById('editGeometryBtn');
  const stopEditBtn = document.getElementById('stopEditBtn');
  const addVertexBtn = document.getElementById('addVertexBtn');
  const removeVertexBtn = document.getElementById('removeVertexBtn');
  const undoGeometryBtn = document.getElementById('undoGeometryBtn');
  const resetGeometryBtn = document.getElementById('resetGeometryBtn');
  const referenceToggle = document.getElementById('referenceToggle');
  const referenceOpacity = document.getElementById('referenceOpacity');
  const referenceOpacityValue = document.getElementById('referenceOpacityValue');
  const calibrationStatus = document.getElementById('calibrationStatus');
  const copyGeometryBtn = document.getElementById('copyGeometryBtn');
  const exportGeometryBtn = document.getElementById('exportGeometryBtn');

  const featureLayers = new Map();
  let gmMode = false;
  let coordsEnabled = false;
  let calibrationMode = false;
  const enabledStatuses = new Set(config.defaultStatusFilters);
  const enabledCategories = new Set(Object.keys(categoryDefs));
  const enabledCanons = new Set(Object.keys(canonDefs));
  const enabledRelevance = new Set(Object.keys(relevanceDefs));

  let editingFeature = null;
  let previewLayer = null;
  let vertexMarkers = [];
  let editorAction = null;
  let dragSnapshotTaken = false;
  let undoStack = [];
  const originalGeometries = new Map();
  const modifiedGeometries = new Map();

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function statusLabel(feature) {
    return statusDefs[feature.statusCartografico]?.label || feature.statusCartografico || '—';
  }

  function canonLabel(feature) {
    return canonDefs[feature.statusCanonico] || feature.statusCanonico || '—';
  }

  function featureCategories(feature) {
    const base = Array.isArray(feature.categorias) ? feature.categorias : [];
    const gm = gmMode && Array.isArray(feature.categoriasGM) ? feature.categoriasGM : [];
    return [...new Set([...base, ...gm])];
  }

  function passesFunctionalFilters(feature) {
    if (feature.statusCanonico && !enabledCanons.has(feature.statusCanonico)) return false;
    if (feature.relevancia && !enabledRelevance.has(feature.relevancia)) return false;
    const cats = featureCategories(feature);
    if (cats.length && !cats.some(cat => enabledCategories.has(cat))) return false;
    return true;
  }

  function zoomBand(zoom = map.getZoom()) {
    if (zoom < -0.85) return 'city';
    if (zoom < 0.15) return 'district';
    return 'local';
  }

  function visibleAtZoom(feature) {
    // v0.9.1: todos os pins permanecem disponíveis em qualquer nível de zoom.
    // A redução de poluição visual passa a ser responsabilidade da hierarquia
    // Monumental → Relevante → Local → Micro, não do desaparecimento dos pontos.
    return true;
  }

  function primaryCategory(feature) {
    const cats = featureCategories(feature);
    const order = ['campanha','governo','guarda','religiao','magia','saude','educacao','funerario','transporte','hospedagem','alimentacao','vida_noturna','adulto','jogos','cultura','comercio','historico'];
    return order.find(key => cats.includes(key)) || cats[0] || '';
  }

  function markerFamily(feature) {
    // Overrides de identidade para landmarks que precisam de leitura imediata.
    if (feature.id === 'estatua-valkaria' || feature.id === 'palacio-imperial') return 'government';
    if (feature.id === 'biblioteca-duas-deusas') return 'education';
    if (feature.id === 'a-casa') return 'guard';

    const cat = primaryCategory(feature);
    const mapFamily = {
      comercio:'commerce', alimentacao:'food', hospedagem:'lodging', vida_noturna:'night', adulto:'night', jogos:'night',
      religiao:'religion', educacao:'education', saude:'health', magia:'magic', funerario:'funerary',
      guarda:'guard', governo:'government', transporte:'transport', historico:'history', campanha:'campaign', cultura:'culture'
    };
    return mapFamily[cat] || (feature.camada === 'historia' ? 'history' : feature.camada === 'campanha' ? 'campaign' : 'default');
  }

  function markerTier(feature) {
    // Hierarquia visual oficial: Monumental → Relevante → Local → Micro.
    if (majorLandmarkIds.has(feature.id)) return 'monumental';
    if (feature.id === 'a-casa') return 'relevant';
    if (feature.tipo === 'guarita' || feature.tipo === 'guarita_portao') return 'micro';

    if (feature.camada === 'centralidades') {
      if (String(feature.tipo || '').includes('metropolitana')) return 'relevant';
      if (String(feature.tipo || '').includes('distrital')) return 'local';
      return 'micro';
    }

    if (feature.relevancia === 'metropolitana') return 'monumental';
    if (feature.relevancia === 'distrital') return 'relevant';
    if (feature.relevancia === 'local') return 'local';

    // Conteúdo legado sem relevância explícita: locais reais continuam legíveis;
    // infraestrutura cotidiana mínima vira Micro.
    if (feature.camada === 'economia') return 'local';
    if (feature.camada === 'instituicoes' || feature.camada === 'campanha') return 'relevant';
    return 'micro';
  }

  function markerGlyph(feature) {
    // Fallback textual para superfícies que ainda não renderizam SVG.
    const family = markerFamily(feature);
    const glyphs = {
      government:'▥', religion:'✦', commerce:'¤', food:'≋', lodging:'⌂', night:'☾',
      education:'▤', health:'✚', magic:'✧', funerary:'†', guard:'◇', transport:'⌁',
      history:'⌛', campaign:'◆', culture:'❧', default:'•'
    };
    return glyphs[family] || '•';
  }

  function markerIconSvg(feature) {
    const family = markerFamily(feature);
    const attrs = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const icons = {
      government: `<svg ${attrs} ${common}><path d="M4 9h16M6 9V7l6-3 6 3v2M7 10v7M11 10v7M15 10v7M19 10v7M4 19h16"/></svg>`,
      religion: `<svg ${attrs} ${common}><path d="M12 2.8l1.7 6.1L19.8 12l-6.1 3.1L12 21.2l-1.7-6.1L4.2 12l6.1-3.1L12 2.8z"/></svg>`,
      commerce: `<svg ${attrs} ${common}><path d="M9 5h6l-1.4 2.3c3.2 1.7 5.2 4.3 5.2 7.2 0 3.6-3 5.5-6.8 5.5s-6.8-1.9-6.8-5.5c0-2.9 2-5.5 5.2-7.2L9 5z"/><path d="M12 9v7M9.8 11.2c.8-.8 3.6-.8 4.4 0 .8.9-.2 1.7-2.2 1.9-2 .2-3 1-2.2 1.9.8.8 3.6.8 4.4 0"/></svg>`,
      food: `<svg ${attrs} ${common}><path d="M5 13h14c-.5 4-3.1 6-7 6s-6.5-2-7-6zM8 10c-1-1.5.7-2.2 0-3.8M12 10c-1-1.5.7-2.2 0-3.8M16 10c-1-1.5.7-2.2 0-3.8"/></svg>`,
      lodging: `<svg ${attrs} ${common}><path d="M5 9h10a3 3 0 0 1 3 3v4H5V9zM18 11h2v3a2 2 0 0 1-2 2M7 19h9"/></svg>`,
      night: `<svg ${attrs} ${common}><path d="M16.8 16.5A7 7 0 0 1 8 7.2a7.1 7.1 0 1 0 8.8 9.3z"/><path d="M17.5 5.5l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6.6-1.5z"/></svg>`,
      education: `<svg ${attrs} ${common}><path d="M4 6.5c3-.8 5.5-.4 8 1.2v11c-2.5-1.6-5-2-8-1.2v-11zM20 6.5c-3-.8-5.5-.4-8 1.2v11c2.5-1.6 5-2 8-1.2v-11z"/></svg>`,
      health: `<svg ${attrs} ${common}><path d="M9.5 4.5h5v5h5v5h-5v5h-5v-5h-5v-5h5v-5z"/></svg>`,
      magic: `<svg ${attrs} ${common}><path d="M12 2.8l1.4 5.8 5.8 1.4-5.8 1.4-1.4 5.8-1.4-5.8-5.8-1.4 5.8-1.4L12 2.8zM18.5 16l.7 2.2 2.1.8-2.1.7-.7 2.2-.8-2.2-2.1-.7 2.1-.8.8-2.2z"/></svg>`,
      funerary: `<svg ${attrs} ${common}><path d="M7 20V9a5 5 0 0 1 10 0v11M5 20h14M10 9h4M12 7v4"/></svg>`,
      guard: `<svg ${attrs} ${common}><path d="M12 3l7 3v5c0 4.6-2.6 7.6-7 10-4.4-2.4-7-5.4-7-10V6l7-3zM9 12l2 2 4-5"/></svg>`,
      transport: `<svg ${attrs} ${common}><path d="M12 3v14M9 6h6M6 12c0 4 2.4 7 6 8 3.6-1 6-4 6-8M4 12h4M16 12h4"/><circle cx="12" cy="5" r="2"/></svg>`,
      history: `<svg ${attrs} ${common}><path d="M7 4h10M7 20h10M8 5c0 4 2.2 5.1 4 7-1.8 1.9-4 3-4 7M16 5c0 4-2.2 5.1-4 7 1.8 1.9 4 3 4 7"/></svg>`,
      campaign: `<svg ${attrs} ${common}><path d="M12 3l7 7-7 11-7-11 7-7zM12 7v8M9 11h6"/></svg>`,
      culture: `<svg ${attrs} ${common}><path d="M5 19c4-1 7.5-4.5 9-9 1.3-3.9 3.4-5.4 5-5-1 4.7-4.1 8.8-9 11.5L5 19zM8 16l-3 4"/></svg>`,
      default: `<svg ${attrs} ${common}><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`
    };
    return icons[family] || icons.default;
  }

  function tooltipHtml(feature) {
    const cat = categoryDefs[primaryCategory(feature)] || layerDefs[feature.camada]?.label || feature.tipo || 'Local';
    const territory = feature.territorio ? ` · ${escapeHtml(feature.territorio)}` : '';
    return `<strong>${escapeHtml(feature.nome)}</strong><br><span>${escapeHtml(cat)}${territory}</span>`;
  }

  const majorLandmarkIds = new Set(['estatua-valkaria','palacio-imperial','biblioteca-duas-deusas','arena-imperial','catedral-valkaria','mercado','madame-meia-noite']);
  // Hierarquia editorial de rótulos territoriais. Na visão geral, só os territórios
  // de leitura metropolitana permanecem nomeados; os menores entram no zoom distrital.
  const cityTerritoryLabelIds = new Set([
    'centro','recomeco','baixa-vila','entrepassos','os-solares','favela-goblins',
    'refugio-felicidade','mercado','cidade-praia','bosque-allihanna','nitamu-ra'
  ]);
  function visualRelevance(feature) {
    if (majorLandmarkIds.has(feature.id)) return 'metropolitana';
    return feature.relevancia || (feature.tipo?.startsWith('centralidade_') ? 'distrital' : 'distrital');
  }

  function cloneGeometry(feature) {
    if (feature.geometria === 'point') {
      return { x: Number(feature.x), y: Number(feature.y) };
    }
    return { points: (feature.points || []).map(([x, y]) => [Number(x), Number(y)]) };
  }

  function applyGeometry(feature, geometry) {
    if (feature.geometria === 'point') {
      feature.x = Number(geometry.x);
      feature.y = Number(geometry.y);
    } else {
      feature.points = (geometry.points || []).map(([x, y]) => [Number(x), Number(y)]);
    }
  }

  function sameGeometry(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function persistModified() {
    const payload = {};
    modifiedGeometries.forEach((geometry, id) => { payload[id] = geometry; });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function restoreLocalChanges() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const saved = JSON.parse(raw);
      let count = 0;
      Object.entries(saved).forEach(([id, geometry]) => {
        const feature = features.find(item => item.id === id);
        if (!feature) return;
        if (!originalGeometries.has(id)) originalGeometries.set(id, cloneGeometry(feature));
        applyGeometry(feature, geometry);
        modifiedGeometries.set(id, cloneGeometry(feature));
        count += 1;
      });
      return count;
    } catch (_) {
      return 0;
    }
  }

  const restoredCount = restoreLocalChanges();

  function featureHtml(feature) {
    const link = feature.worldcraftUrl
      ? `<p><a href="${escapeHtml(feature.worldcraftUrl)}" target="_blank" rel="noopener noreferrer">Abrir no WorldCraft</a></p>`
      : '';

    const gm = gmMode && feature.descricaoGM
      ? `<div class="gm-note"><strong>🔒 Mestre</strong><p>${escapeHtml(feature.descricaoGM)}</p></div>`
      : '';

    const decisions = (feature.decisoes || []).length
      ? `<p><strong>Decisões:</strong> ${escapeHtml(feature.decisoes.join(', '))}</p>`
      : '';

    const coords = feature.geometria === 'point'
      ? `<span class="tag">X ${Math.round(feature.x)}</span><span class="tag">Y ${Math.round(feature.y)}</span>`
      : '';

    const activities = (feature.atividadesFortes || []).length
      ? `<div class="activity-block"><strong>Atividades fortes:</strong><div class="activity-tags">${feature.atividadesFortes.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></div>`
      : '';

    const urbanProfile = feature.perfilUrbano
      ? `<p><strong>Perfil urbano/econômico:</strong> ${escapeHtml(feature.perfilUrbano)}</p>`
      : '';

    const urbanRhythm = feature.ritmoUrbano
      ? `<p><strong>Ritmo urbano:</strong> ${escapeHtml(feature.ritmoUrbano)}</p>`
      : '';

    const origin = feature.origem
      ? `<p><strong>Origem:</strong> ${escapeHtml(feature.origem)}</p>`
      : '';

    const categories = featureCategories(feature);
    const categoryHtml = categories.length
      ? `<div class="activity-block"><strong>Categorias:</strong><div class="activity-tags">${categories.map(item => `<span class="tag">${escapeHtml(categoryDefs[item] || item)}</span>`).join('')}</div></div>`
      : '';
    const commonCommerce = (feature.comercioComum || []).length
      ? `<div class="activity-block"><strong>Comércio comum:</strong><div class="activity-tags">${feature.comercioComum.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></div>`
      : '';
    const specialties = (feature.especialidades || []).length
      ? `<div class="activity-block"><strong>Especialidades:</strong><div class="activity-tags">${feature.especialidades.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></div>`
      : '';
    const exclusives = (feature.raridadesExclusivas || []).length
      ? `<div class="activity-block"><strong>Raros / exclusivos:</strong><div class="activity-tags">${feature.raridadesExclusivas.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></div>`
      : '';
    const gray = (feature.economiaCinza || []).length
      ? `<div class="activity-block"><strong>Economia adulta/cinza:</strong><div class="activity-tags">${feature.economiaCinza.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div></div>`
      : '';
    const relevance = feature.relevancia ? `<p><strong>Relevância:</strong> ${escapeHtml(relevanceDefs[feature.relevancia] || feature.relevancia)}</p>` : '';
    const territory = feature.territorio ? `<p><strong>Território:</strong> ${escapeHtml(feature.territorio)}</p>` : '';
    const reach = feature.alcanceComercial ? `<p><strong>Alcance comercial:</strong> ${escapeHtml(feature.alcanceComercial.replaceAll('_',' '))}</p>` : '';
    const price = feature.faixaPreco ? `<p><strong>Faixa de preço:</strong> ${escapeHtml(feature.faixaPreco)}</p>` : '';
    const hours = feature.horario ? `<p><strong>Horário:</strong> ${escapeHtml(feature.horario)}</p>` : '';
    const legality = feature.legalidade ? `<p><strong>Legalidade:</strong> ${escapeHtml(feature.legalidade.replaceAll('_',' '))}</p>` : '';
    const guardCoverage = feature.coberturaGuarda ? `<p><strong>Cobertura da Guarda:</strong> ${escapeHtml(feature.coberturaGuarda.replaceAll('_',' '))}</p>` : '';
    const responsible = feature.responsavel ? `<p><strong>Responsável:</strong> ${escapeHtml(feature.responsavel)}</p>` : '';
    const visibility = `<p><strong>Visibilidade:</strong> ${feature.publico ? (feature.descricaoGM ? 'público + informação de Mestre' : 'público') : 'somente Mestre'}</p>`;

    return `
      <h3>${escapeHtml(feature.nome)}</h3>
      <div class="meta-row">
        <span class="tag">${escapeHtml(feature.tipo || 'elemento')}</span>
        <span class="tag">${escapeHtml(statusLabel(feature))}</span>
      </div>
      <p><strong>Camada:</strong> ${escapeHtml(layerDefs[feature.camada]?.label || feature.camada)}</p>
      <p><strong>Cânone:</strong> ${escapeHtml(canonLabel(feature))}</p>
      <p><strong>Geometria:</strong> ${escapeHtml(feature.geometria)}</p>
      ${feature.escala ? `<p><strong>Escala:</strong> ${escapeHtml(feature.escala)}</p>` : ''}
      ${territory}
      ${relevance}
      ${reach}
      ${price}
      ${hours}
      ${legality}
      ${guardCoverage}
      ${responsible}
      ${visibility}
      <p><strong>Fronteira:</strong> ${escapeHtml(feature.fronteira || '—')}</p>
      ${feature.descricaoPublica ? `<p>${escapeHtml(feature.descricaoPublica)}</p>` : ''}
      ${urbanProfile}
      ${activities}
      ${commonCommerce}
      ${specialties}
      ${exclusives}
      ${gray}
      ${categoryHtml}
      ${urbanRhythm}
      ${origin}
      ${decisions}
      ${coords}
      ${gm}
      ${link}`;
  }

  let selectedFeature = null;
  let selectedLeafletLayer = null;

  function clearSelectedVisual() {
    if (!selectedLeafletLayer || !selectedFeature) return;
    if (selectedFeature.geometria === 'point') {
      selectedLeafletLayer.getElement()?.classList.remove('is-selected');
    } else if (selectedLeafletLayer.setStyle) {
      selectedLeafletLayer.setStyle(styleFor(selectedFeature));
    }
  }

  function applySelectedVisual(feature, layer) {
    if (!layer) return;
    if (feature.geometria === 'point') {
      layer.getElement()?.classList.add('is-selected');
    } else if (layer.setStyle) {
      const base = styleFor(feature);
      layer.setStyle({
        ...base,
        color: '#a98645',
        weight: Math.max((base.weight || 2) + 1, 3),
        opacity: Math.max(base.opacity || 0.7, 0.92),
        fillOpacity: Math.max(base.fillOpacity || 0, feature.camada === 'territorios' ? 0.115 : 0.14)
      });
    }
  }

  function clearSelection() {
    clearSelectedVisual();
    selectedFeature = null;
    selectedLeafletLayer = null;
    document.dispatchEvent(new CustomEvent('valkaria:selection-cleared'));
  }

  function selectFeature(feature, leafletLayer, fly = false) {
    clearSelectedVisual();
    selectedFeature = feature;
    selectedLeafletLayer = leafletLayer || null;

    details.classList.remove('muted');
    details.innerHTML = featureHtml(feature);
    applySelectedVisual(feature, leafletLayer);

    if (fly) {
      if (feature.geometria === 'point') {
        map.flyTo(xy(feature.x, feature.y), Math.max(map.getZoom(), feature.zoom ?? 0.5), { duration: 0.45 });
      } else if (leafletLayer?.getBounds) {
        map.flyToBounds(leafletLayer.getBounds(), { duration: 0.45, padding: [42, 42] });
      }
    }

    document.dispatchEvent(new CustomEvent('valkaria:select', { detail: { feature, layer: leafletLayer } }));
  }

  function territoryTone(feature) {
    const tones = {
      'centro':'#9b8466','recomeco':'#ad9156','baixa-vila':'#8c5960','entrepassos':'#7b7180','os-solares':'#9a8066',
      'cem-portas':'#9b7655','mercado':'#a1834d','cidade-praia':'#708792','favela-goblins':'#8e664c','nitamu-ra':'#985f4f',
      'refugio-felicidade':'#9c7d60','corredor-verde':'#6d8068','vila-elfica':'#70806d','ultimo-pavilhao':'#8b735d',
      'poco-velho':'#82725e','quatro-patios':'#8d8064'
    };
    return tones[feature.id] || '#806d58';
  }

  function styleFor(feature) {
    const status = feature.statusCartografico;
    const geometry = feature.geometria;
    const styles = {
      confirmed: { weight: 1.7, opacity: 0.62, fillOpacity: 0.045 },
      conceptual_approved: { weight: 1.6, opacity: 0.58, fillOpacity: 0.04 },
      approximate: { weight: 1.5, opacity: 0.52, fillOpacity: 0.032, dashArray: '7 6' },
      candidate: { weight: 1.4, opacity: 0.46, fillOpacity: 0.025, dashArray: '9 7' },
      reserve: { weight: 1.2, opacity: 0.40, fillOpacity: 0.02, dashArray: '4 8' },
      historical: { weight: 1.25, opacity: 0.34, fillOpacity: 0.012, dashArray: '3 8' }
    };
    const style = { ...(styles[status] || styles.candidate) };

    if (feature.camada === 'territorios') {
      const tone = territoryTone(feature);
      return {
        ...style,
        color: '#544637',
        fillColor: tone,
        weight: feature.tipo === 'regiao_urbana' ? 1.85 : 1.45,
        opacity: 0.46,
        fillOpacity: 0.018,
        dashArray: undefined,
        lineJoin: 'round'
      };
    }

    // Eixos editoriais: relações funcionais, não ruas literais.
    if (feature.camada === 'estrutura_funcional') {
      style.fillOpacity = 0;
      style.opacity = 0.33;
      style.color = '#6e5d48';
      style.dashArray = '10 10';
      style.lineCap = 'round';
      style.weight = feature.tipo === 'eixo_metropolitano_editorial' ? 2.5 : feature.tipo === 'eixo_historico_editorial' ? 2.2 : 1.8;
      return style;
    }

    // Água: azul antigo, dessaturado, com leitura de gravura pela baixa opacidade.
    if (feature.camada === 'hidrografia' || feature.camada === 'abastecimento') {
      style.color = feature.camada === 'hidrografia' ? '#6f8998' : '#7797a1';
      style.fillColor = '#839cab';
      style.opacity = 0.68;
      style.fillOpacity = geometry === 'polygon' || geometry === 'reserve' ? 0.095 : 0;
      style.weight = geometry === 'polyline' || geometry === 'corridor' ? 2.4 : 1.55;
      return style;
    }

    // Fantasma cartográfico: histórico fica quase apagado no papel.
    if (feature.camada === 'historia') {
      style.color = '#80664f';
      style.fillColor = '#a58a6d';
      style.opacity = 0.32;
      style.fillOpacity = geometry === 'polygon' || geometry === 'reserve' ? 0.025 : 0;
      style.weight = 1.35;
      style.dashArray = '5 7';
      return style;
    }

    // Subterrâneo técnico: simples, tracejado e sem efeito dramático.
    if (feature.camada === 'subterraneo') {
      style.color = '#665e55';
      style.fillColor = '#80766b';
      style.opacity = 0.62;
      style.fillOpacity = 0.025;
      style.weight = 1.8;
      style.dashArray = '6 5';
      return style;
    }

    if (feature.tipo === 'fortificacao') {
      style.color = '#5b4937';
      style.fillColor = '#76604a';
      style.weight = 3.0;
      style.opacity = 0.74;
      style.fillOpacity = 0;
      style.dashArray = undefined;
      return style;
    }

    if (feature.tipo === 'complexo_portao') {
      style.color = '#7f603d';
      style.fillColor = '#aa8a5b';
      style.opacity = 0.72;
      style.fillOpacity = 0.07;
      style.weight = 2.1;
      style.dashArray = undefined;
      return style;
    }

    const polygonPalette = {
      instituicoes: { color: '#8c7042', fillColor: '#b39962' }, economia: { color: '#80674a', fillColor: '#aa8a62' },
      circulacao: { color: '#6c5b49', fillColor: '#8c755d' }, circulacao_elevada: { color: '#735f82', fillColor: '#9a84a7' },
      infraestrutura: { color: '#6f5c48', fillColor: '#95795c' }, religiao: { color: '#91763d', fillColor: '#b8a06b' },
      educacao: { color: '#5c6f80', fillColor: '#8394a1' }, saude: { color: '#657768', fillColor: '#8b9b8d' },
      magia: { color: '#70577e', fillColor: '#957ea2' }, funerario: { color: '#68656f', fillColor: '#8b8991' },
      seguranca: { color: '#5e6871', fillColor: '#858f96' }, gm: { color: '#6f2932', fillColor: '#8e5960' }, campanha: { color: '#6f2932', fillColor: '#9c666c' }
    };
    if (polygonPalette[feature.camada]) {
      style.color = polygonPalette[feature.camada].color;
      style.fillColor = polygonPalette[feature.camada].fillColor;
    }

    if (geometry === 'corridor') {
      style.fillOpacity = 0;
      style.lineCap = 'round';
      if (feature.tipo === 'eixo_metropolitano') { style.weight = 3.2; style.opacity = 0.55; }
      else if (feature.id === 'cem-portas') { style.weight = 2.1; style.opacity = 0.48; style.dashArray = '8 7'; }
      else if (feature.id === 'transicao-centro-baixa') { style.weight = 1.9; style.opacity = 0.42; style.dashArray = '5 7'; }
      else { style.weight = 2.3; style.opacity = 0.48; }
    }
    if (geometry === 'polyline') { style.weight = 2.35; style.opacity = 0.56; style.fillOpacity = 0; }
    return style;
  }

  function bindCommon(layer, feature) {
    layer.on('click', () => selectFeature(feature, layer, false));
    layer.bindTooltip(tooltipHtml(feature), { sticky: true, className: 'map-label', opacity: 1 });

    if (feature.camada === 'territorios' && layer.setStyle) {
      layer.on('mouseover', () => {
        if (selectedFeature?.id === feature.id) return;
        const base = styleFor(feature);
        layer.setStyle({ ...base, color: territoryTone(feature), opacity: 0.72, fillOpacity: 0.075, weight: (base.weight || 1.5) + 0.45 });
      });
      layer.on('mouseout', () => {
        if (selectedFeature?.id === feature.id) return;
        layer.setStyle(styleFor(feature));
      });
    }
    return layer;
  }

  function closeRosette() {
    rosetteRecords.forEach(({ layer, latlng, z }) => {
      try { layer.setLatLng(latlng); layer.setZIndexOffset(z || 0); } catch (_) {}
    });
    rosetteRecords = [];
    rosetteMemberIds.clear();
    rosetteGroup.clearLayers();
  }

  function maybeOpenRosette(feature, marker) {
    const center = map.latLngToContainerPoint(marker.getLatLng());
    const nearby = [];
    featureLayers.forEach(record => {
      if (record.feature.geometria !== 'point' || !record.layer?.getLatLng) return;
      const point = map.latLngToContainerPoint(record.layer.getLatLng());
      if (center.distanceTo(point) <= 25) nearby.push(record);
    });
    if (nearby.length < 2) return false;

    closeRosette();
    const radius = Math.max(38, Math.min(62, 30 + nearby.length * 3));
    nearby.forEach((record, index) => {
      const original = record.layer.getLatLng();
      const angle = -Math.PI / 2 + (Math.PI * 2 * index / nearby.length);
      const offset = L.point(Math.cos(angle) * radius, Math.sin(angle) * radius);
      const moved = map.containerPointToLatLng(center.add(offset));
      rosetteRecords.push({ layer: record.layer, latlng: original, z: 0 });
      rosetteMemberIds.add(record.feature.id);
      record.layer.setLatLng(moved);
      record.layer.setZIndexOffset(1200 + index);
      L.polyline([marker.getLatLng(), moved], {
        color: '#6d5a44', weight: 1, opacity: 0.5, dashArray: '2 4', interactive: false
      }).addTo(rosetteGroup);
    });
    return true;
  }

  function makePoint(feature) {
    const tier = markerTier(feature);
    const family = markerFamily(feature);
    const iconSvg = markerIconSvg(feature);
    const label = escapeHtml(feature.nome);
    const dimensions = {
      monumental: { w: 58, h: 66, ax: 29, ay: 62 },
      relevant:   { w: 48, h: 56, ax: 24, ay: 52 },
      local:      { w: 40, h: 48, ax: 20, ay: 44 },
      micro:      { w: 36, h: 42, ax: 18, ay: 38 }
    }[tier];

    const marker = L.marker(xy(feature.x, feature.y), {
      keyboard: true,
      bubblingMouseEvents: false,
      title: feature.nome,
      riseOnHover: true,
      riseOffset: 420,
      icon: L.divIcon({
        className: `poi-div-icon poi-marker tier-${tier} family-${family}`,
        html: `<div class="poi-wrap"><span class="poi-medallion"><span class="poi-icon">${iconSvg}</span></span><span class="poi-label">${label}</span></div>`,
        iconSize: [dimensions.w, dimensions.h],
        iconAnchor: [dimensions.ax, dimensions.ay],
        tooltipAnchor: [0, -Math.round(dimensions.h * 0.72)]
      })
    });

    marker.on('click', () => {
      if (rosetteMemberIds.has(feature.id)) {
        closeRosette();
        selectFeature(feature, marker, false);
        return;
      }
      if (maybeOpenRosette(feature, marker)) return;
      selectFeature(feature, marker, false);
    });
    marker.bindTooltip(tooltipHtml(feature), { direction: 'top', className: 'map-label', opacity: 1 });
    return marker;
  }

  function makePolygon(feature) {
    const points = (feature.points || []).map(([x, y]) => xy(x, y));
    const layer = bindCommon(L.polygon(points, styleFor(feature)), feature);
    if (feature.camada === 'territorios' || visualRelevance(feature) === 'metropolitana') {
      layer.unbindTooltip();
      const cityClass = feature.camada === 'territorios'
        ? (cityTerritoryLabelIds.has(feature.id) ? ' city-major' : ' city-secondary')
        : '';
      const safeId = String(feature.id || 'area').replace(/[^a-z0-9_-]/gi, '-');
      const labelClass = feature.camada === 'territorios'
        ? `territory-label territory-${safeId}${cityClass}`
        : `territory-label poi-area-label area-${safeId}`;
      layer.bindTooltip(escapeHtml(feature.nome), { permanent: true, direction: 'center', className: labelClass, opacity: 1 });
    }
    return layer;
  }

  function makeLine(feature) {
    const points = (feature.points || []).map(([x, y]) => xy(x, y));
    return bindCommon(L.polyline(points, styleFor(feature)), feature);
  }

  function createLayer(feature) {
    if (!feature.publico && !gmMode) return null;
    if (feature.geometria === 'point') return makePoint(feature);
    if (feature.geometria === 'polygon' || feature.geometria === 'reserve') return makePolygon(feature);
    if (feature.geometria === 'polyline' || feature.geometria === 'corridor') return makeLine(feature);
    return null;
  }

  function renderFeatures() {
    Object.values(groups).forEach(group => group.clearLayers());
    featureLayers.clear();

    features.forEach(feature => {
      if (!enabledStatuses.has(feature.statusCartografico)) return;
      if (!passesFunctionalFilters(feature)) return;
      if (!visibleAtZoom(feature)) return;
      if (!feature.publico && !gmMode) return;
      if (layerDefs[feature.camada]?.gmOnly && !gmMode) return;

      const layer = createLayer(feature);
      if (!layer || !groups[feature.camada]) return;

      layer.addTo(groups[feature.camada]);
      featureLayers.set(feature.id, { feature, layer });
    });

    if (selectedFeature) {
      const selectedRecord = featureLayers.get(selectedFeature.id);
      if (selectedRecord) {
        selectedLeafletLayer = selectedRecord.layer;
        applySelectedVisual(selectedFeature, selectedLeafletLayer);
      }
    }
  }

  function syncGroupsToMap() {
    Object.entries(layerDefs).forEach(([key, def]) => {
      const input = document.querySelector(`[data-layer="${key}"]`);
      const shouldShow = input?.checked && (!def.gmOnly || gmMode);
      if (shouldShow && !map.hasLayer(groups[key])) groups[key].addTo(map);
      if (!shouldShow && map.hasLayer(groups[key])) map.removeLayer(groups[key]);
    });
  }

  Object.entries(layerDefs).forEach(([key, def]) => {
    const label = document.createElement('label');
    label.className = `layer-toggle${def.gmOnly ? ' gm-layer' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.layer = key;
    checkbox.checked = Boolean(def.visible && !def.gmOnly);
    checkbox.disabled = Boolean(def.gmOnly && !gmMode);
    checkbox.addEventListener('change', syncGroupsToMap);

    const text = document.createElement('span');
    text.textContent = def.label;

    label.append(checkbox, text);
    layerToggles.appendChild(label);
  });

  Object.entries(categoryDefs).forEach(([key, labelText]) => {
    const label = document.createElement('label');
    label.className = `status-filter${gmCategoryKeys.has(key) ? ' gm-category' : ''}`;
    if (gmCategoryKeys.has(key)) label.hidden = !gmMode;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.disabled = gmCategoryKeys.has(key) && !gmMode;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) enabledCategories.add(key); else enabledCategories.delete(key);
      renderFeatures(); syncGroupsToMap();
    });
    const text = document.createElement('span'); text.textContent = labelText;
    label.append(checkbox, text); categoryFilters?.appendChild(label);
  });

  Object.entries(canonDefs).forEach(([key, labelText]) => {
    const label = document.createElement('label'); label.className = 'status-filter';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) enabledCanons.add(key); else enabledCanons.delete(key);
      renderFeatures(); syncGroupsToMap();
    });
    const text = document.createElement('span'); text.textContent = labelText;
    label.append(checkbox, text); canonFilters?.appendChild(label);
  });

  Object.entries(relevanceDefs).forEach(([key, labelText]) => {
    const label = document.createElement('label'); label.className = 'status-filter';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) enabledRelevance.add(key); else enabledRelevance.delete(key);
      renderFeatures(); syncGroupsToMap();
    });
    const text = document.createElement('span'); text.textContent = labelText;
    label.append(checkbox, text); relevanceFilters?.appendChild(label);
  });

  Object.entries(statusDefs).forEach(([key, def]) => {
    const label = document.createElement('label');
    label.className = 'status-filter';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = enabledStatuses.has(key);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) enabledStatuses.add(key);
      else enabledStatuses.delete(key);
      renderFeatures();
      syncGroupsToMap();
    });

    const text = document.createElement('span');
    text.textContent = def.label;
    label.append(checkbox, text);
    statusFilters.appendChild(label);
  });

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function searchable(feature) {
    if (!feature.publico && !gmMode) return false;
    const blob = [
      feature.nome, feature.tipo, feature.descricaoPublica, feature.perfilUrbano,
      (feature.atividadesFortes || []).join(' '), (feature.comercioComum || []).join(' '),
      (feature.especialidades || []).join(' '), (feature.raridadesExclusivas || []).join(' '),
      (feature.economiaCinza || []).join(' '), featureCategories(feature).join(' '),
      feature.territorio, feature.relevancia, feature.alcanceComercial, feature.responsavel,
      feature.legalidade, feature.horario, feature.coberturaGuarda, feature.ritmoUrbano, feature.origem,
      gmMode ? [feature.descricaoGM, ...(feature.categoriasGM || [])].join(' ') : '',
      canonLabel(feature), statusLabel(feature)
    ].join(' ');
    return normalize(blob);
  }

  function runSearch() {
    const query = normalize(searchInput.value);
    searchResults.innerHTML = '';
    searchResults.classList.remove('has-results');
    if (!query) return;

    const matches = features.filter(feature => searchable(feature).includes(query)).slice(0, 18);
    searchResults.classList.add('has-results');

    if (!matches.length) {
      searchResults.innerHTML = '<div class="muted" style="padding:.5rem">Nenhum resultado.</div>';
      return;
    }

    matches.forEach(feature => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result';
      btn.innerHTML = `${escapeHtml(feature.nome)}<small>${escapeHtml(statusLabel(feature))} · ${escapeHtml(layerDefs[feature.camada]?.label || feature.camada)}</small>`;
      btn.addEventListener('click', () => {
        const def = layerDefs[feature.camada];
        if (def?.gmOnly && !gmMode) return;

        const layerInput = document.querySelector(`[data-layer="${feature.camada}"]`);
        if (layerInput) layerInput.checked = true;
        syncGroupsToMap();

        let record = featureLayers.get(feature.id);
        if (!record && feature.geometria === 'point') {
          const targetZoom = Math.max(0.35, Number(feature.zoom ?? 0.5));
          map.setView(xy(feature.x, feature.y), targetZoom, { animate: false });
          renderFeatures();
          syncGroupsToMap();
          record = featureLayers.get(feature.id);
        }
        if (record) selectFeature(feature, record.layer, true);
        else {
          details.classList.remove('muted');
          details.innerHTML = featureHtml(feature);
          document.dispatchEvent(new CustomEvent('valkaria:select', { detail: { feature, layer: null } }));
        }
      });
      searchResults.appendChild(btn);
    });
  }

  searchBtn.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') runSearch();
    if (event.key === 'Escape') { searchResults.innerHTML = ''; searchResults.classList.remove('has-results'); searchInput.blur(); }
  });
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length >= 2) runSearch();
    else { searchResults.innerHTML = ''; searchResults.classList.remove('has-results'); }
  });

  homeBtn.addEventListener('click', () => map.fitBounds(bounds, { animate: true, duration: 0.45 }));

  coordsBtn.addEventListener('click', () => {
    coordsEnabled = !coordsEnabled;
    coordsBtn.setAttribute('aria-pressed', String(coordsEnabled));
    coordsReadout.hidden = !coordsEnabled;
    coordsBtn.textContent = coordsEnabled ? 'Ocultar coordenadas' : 'Mostrar coordenadas';
  });

  function updateModeBadge() {
    if (calibrationMode) {
      modeBadge.textContent = 'Modo Calibração';
      modeBadge.classList.add('calibration');
      modeBadge.classList.remove('gm');
    } else if (gmMode) {
      modeBadge.textContent = 'Modo Mestre';
      modeBadge.classList.add('gm');
      modeBadge.classList.remove('calibration');
    } else {
      modeBadge.textContent = 'Atlas público';
      modeBadge.classList.remove('gm', 'calibration');
    }
  }

  gmBtn.addEventListener('click', () => {
    gmMode = !gmMode;
    gmBtn.setAttribute('aria-pressed', String(gmMode));
    gmBtn.textContent = gmMode ? 'Desativar Modo Mestre' : 'Ativar Modo Mestre';
    document.body.classList.toggle('gm-mode', gmMode);
    updateModeBadge();

    document.querySelectorAll('.gm-layer input').forEach(input => {
      input.disabled = !gmMode;
      if (!gmMode) input.checked = false;
    });
    document.querySelectorAll('.gm-category').forEach(label => {
      label.hidden = !gmMode;
      const input = label.querySelector('input');
      if (input) input.disabled = !gmMode;
    });

    renderFeatures();
    syncGroupsToMap();
    if (!details.classList.contains('muted')) {
      details.innerHTML = '<span class="muted">Selecione novamente um elemento para atualizar os detalhes.</span>';
    }
  });

  // ---------- MODO CALIBRAÇÃO ----------

  function populateCalibrationSelect() {
    calibrationFeature.innerHTML = '';
    [...features]
      .filter(feature => ['point','polygon','reserve','polyline','corridor'].includes(feature.geometria))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .forEach(feature => {
        const option = document.createElement('option');
        option.value = feature.id;
        option.textContent = `${feature.nome} — ${feature.geometria}`;
        calibrationFeature.appendChild(option);
      });
  }

  populateCalibrationSelect();

  function setCalibrationStatus(text, strong = false) {
    calibrationStatus.innerHTML = strong ? `<strong>${escapeHtml(text)}</strong>` : escapeHtml(text);
  }

  function updateEditorButtons() {
    const active = Boolean(editingFeature);
    stopEditBtn.disabled = !active;
    undoGeometryBtn.disabled = !active || undoStack.length === 0;
    resetGeometryBtn.disabled = !active;
    copyGeometryBtn.disabled = !active;
    const vertices = active && editingFeature.geometria !== 'point';
    addVertexBtn.disabled = !vertices;
    removeVertexBtn.disabled = !vertices;
  }

  function editorIcon(point = false, removeReady = false) {
    const cls = point ? 'point-handle' : `vertex-handle${removeReady ? ' remove-ready' : ''}`;
    const size = point ? 20 : 16;
    return L.divIcon({
      className: '',
      html: `<div class="${cls}"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function pushUndoSnapshot() {
    if (!editingFeature) return;
    undoStack.push(cloneGeometry(editingFeature));
    if (undoStack.length > 50) undoStack.shift();
    updateEditorButtons();
  }

  function markModified() {
    if (!editingFeature) return;
    const current = cloneGeometry(editingFeature);
    const original = originalGeometries.get(editingFeature.id);
    if (original && sameGeometry(current, original)) {
      modifiedGeometries.delete(editingFeature.id);
    } else {
      modifiedGeometries.set(editingFeature.id, current);
    }
    persistModified();
    updateEditorButtons();
    setCalibrationStatus(`${editingFeature.nome}: geometria alterada nesta sessão. ${modifiedGeometries.size} elemento(s) com alterações salvas localmente.`);
  }

  function updateUnderlyingFeatureLayer() {
    if (!editingFeature) return;
    const record = featureLayers.get(editingFeature.id);
    if (!record) return;
    if (editingFeature.geometria === 'point') {
      if (record.layer.setLatLng) record.layer.setLatLng(xy(editingFeature.x, editingFeature.y));
    } else if (record.layer.setLatLngs) {
      record.layer.setLatLngs((editingFeature.points || []).map(([x, y]) => xy(x, y)));
    }
  }

  function clearEditorGraphics() {
    editGroup.clearLayers();
    previewLayer = null;
    vertexMarkers = [];
  }

  function rebuildEditorGraphics() {
    clearEditorGraphics();
    if (!editingFeature) return;

    if (editingFeature.geometria === 'point') {
      const marker = L.marker(xy(editingFeature.x, editingFeature.y), {
        draggable: true,
        icon: editorIcon(true),
        zIndexOffset: 2000
      }).addTo(editGroup);

      marker.on('dragstart', () => {
        dragSnapshotTaken = true;
        pushUndoSnapshot();
      });
      marker.on('drag', event => {
        const pos = event.target.getLatLng();
        editingFeature.x = Math.round(pos.lng);
        editingFeature.y = Math.round(pos.lat);
        updateUnderlyingFeatureLayer();
        setCalibrationStatus(`${editingFeature.nome}: X ${editingFeature.x} · Y ${editingFeature.y}`);
      });
      marker.on('dragend', () => {
        dragSnapshotTaken = false;
        markModified();
      });
      vertexMarkers.push(marker);
      return;
    }

    const latlngs = (editingFeature.points || []).map(([x, y]) => xy(x, y));
    const previewStyle = {
      color: '#f0b95e',
      weight: editingFeature.geometria === 'corridor' ? 9 : 4,
      opacity: 1,
      fillOpacity: (editingFeature.geometria === 'polygon' || editingFeature.geometria === 'reserve') ? 0.10 : 0,
      dashArray: null,
      className: 'calibration-preview'
    };

    previewLayer = (editingFeature.geometria === 'polygon' || editingFeature.geometria === 'reserve')
      ? L.polygon(latlngs, previewStyle).addTo(editGroup)
      : L.polyline(latlngs, previewStyle).addTo(editGroup);

    (editingFeature.points || []).forEach(([x, y], index) => {
      const marker = L.marker(xy(x, y), {
        draggable: true,
        icon: editorIcon(false, editorAction === 'remove'),
        zIndexOffset: 2000
      }).addTo(editGroup);

      marker.on('dragstart', () => {
        dragSnapshotTaken = true;
        pushUndoSnapshot();
      });
      marker.on('drag', event => {
        const pos = event.target.getLatLng();
        editingFeature.points[index] = [Math.round(pos.lng), Math.round(pos.lat)];
        const updated = editingFeature.points.map(([px, py]) => xy(px, py));
        previewLayer.setLatLngs(updated);
        updateUnderlyingFeatureLayer();
        setCalibrationStatus(`${editingFeature.nome}: vértice ${index + 1} → X ${Math.round(pos.lng)} · Y ${Math.round(pos.lat)}`);
      });
      marker.on('dragend', () => {
        dragSnapshotTaken = false;
        markModified();
      });
      marker.on('click', event => {
        L.DomEvent.stopPropagation(event);
        if (editorAction !== 'remove') return;
        const min = (editingFeature.geometria === 'polygon' || editingFeature.geometria === 'reserve') ? 3 : 2;
        if (editingFeature.points.length <= min) {
          setCalibrationStatus(`Não é possível remover: ${editingFeature.nome} precisa manter pelo menos ${min} vértices.`);
          return;
        }
        pushUndoSnapshot();
        editingFeature.points.splice(index, 1);
        markModified();
        rebuildEditorGraphics();
      });
      vertexMarkers.push(marker);
    });
  }

  function featureBounds(feature) {
    if (feature.geometria === 'point') {
      return L.latLngBounds(xy(feature.x - 250, feature.y - 250), xy(feature.x + 250, feature.y + 250));
    }
    const pts = (feature.points || []).map(([x, y]) => xy(x, y));
    return pts.length ? L.latLngBounds(pts) : bounds;
  }

  function startEditing() {
    const feature = features.find(item => item.id === calibrationFeature.value);
    if (!feature) return;
    if (editingFeature && editingFeature.id !== feature.id) stopEditing();

    editingFeature = feature;
    if (!originalGeometries.has(feature.id)) originalGeometries.set(feature.id, cloneGeometry(feature));
    undoStack = [];
    editorAction = null;
    addVertexBtn.setAttribute('aria-pressed', 'false');
    removeVertexBtn.setAttribute('aria-pressed', 'false');
    rebuildEditorGraphics();
    updateEditorButtons();
    map.fitBounds(featureBounds(feature), { padding: [60, 60], maxZoom: 1.5 });
    selectFeature(feature, featureLayers.get(feature.id)?.layer || null, false);
    setCalibrationStatus(`${feature.nome}: edição ativa. Arraste os pontos claros para ajustar a geometria.`, true);
  }

  function stopEditing() {
    if (editingFeature) markModified();
    editingFeature = null;
    undoStack = [];
    editorAction = null;
    addVertexBtn.setAttribute('aria-pressed', 'false');
    removeVertexBtn.setAttribute('aria-pressed', 'false');
    clearEditorGraphics();
    updateEditorButtons();
    setCalibrationStatus(`Edição encerrada. ${modifiedGeometries.size} elemento(s) com alterações salvas localmente.`);
  }

  function squaredDistanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    if (dx === 0 && dy === 0) return (px - ax) ** 2 + (py - ay) ** 2;
    let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const x = ax + t * dx;
    const y = ay + t * dy;
    return (px - x) ** 2 + (py - y) ** 2;
  }

  function insertNearestVertex(x, y) {
    if (!editingFeature || editingFeature.geometria === 'point') return;
    const pts = editingFeature.points || [];
    if (pts.length < 2) return;
    const closed = editingFeature.geometria === 'polygon' || editingFeature.geometria === 'reserve';
    let bestDistance = Infinity;
    let bestIndex = pts.length;
    const segmentCount = closed ? pts.length : pts.length - 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const distance = squaredDistanceToSegment(x, y, a[0], a[1], b[0], b[1]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i + 1;
      }
    }

    pushUndoSnapshot();
    pts.splice(bestIndex, 0, [Math.round(x), Math.round(y)]);
    markModified();
    rebuildEditorGraphics();
  }

  calibrationBtn.addEventListener('click', () => {
    calibrationMode = !calibrationMode;
    calibrationBtn.setAttribute('aria-pressed', String(calibrationMode));
    calibrationBtn.textContent = calibrationMode ? 'Sair da Calibração' : 'Modo Calibração';
    calibrationPanel.hidden = !calibrationMode;
    updateModeBadge();
    if (!calibrationMode) {
      stopEditing();
      referenceToggle.checked = false;
      if (map.hasLayer(referenceOverlay)) map.removeLayer(referenceOverlay);
    } else {
      setCalibrationStatus(restoredCount
        ? `${restoredCount} alteração(ões) local(is) foram restauradas do navegador.`
        : 'Escolha um elemento e clique em “Editar geometria”.');
    }
  });

  editGeometryBtn.addEventListener('click', startEditing);
  stopEditBtn.addEventListener('click', stopEditing);

  calibrationFeature.addEventListener('change', () => {
    if (editingFeature) startEditing();
  });

  addVertexBtn.addEventListener('click', () => {
    if (!editingFeature || editingFeature.geometria === 'point') return;
    editorAction = editorAction === 'add' ? null : 'add';
    addVertexBtn.setAttribute('aria-pressed', String(editorAction === 'add'));
    removeVertexBtn.setAttribute('aria-pressed', 'false');
    rebuildEditorGraphics();
    setCalibrationStatus(editorAction === 'add'
      ? 'Adicionar vértice: clique no mapa próximo ao trecho onde deseja criar um novo ponto.'
      : `${editingFeature.nome}: modo de adicionar vértice desativado.`);
  });

  removeVertexBtn.addEventListener('click', () => {
    if (!editingFeature || editingFeature.geometria === 'point') return;
    editorAction = editorAction === 'remove' ? null : 'remove';
    removeVertexBtn.setAttribute('aria-pressed', String(editorAction === 'remove'));
    addVertexBtn.setAttribute('aria-pressed', 'false');
    rebuildEditorGraphics();
    setCalibrationStatus(editorAction === 'remove'
      ? 'Remover vértice: clique em um dos pontos vermelhos.'
      : `${editingFeature.nome}: modo de remover vértice desativado.`);
  });

  undoGeometryBtn.addEventListener('click', () => {
    if (!editingFeature || !undoStack.length) return;
    const geometry = undoStack.pop();
    applyGeometry(editingFeature, geometry);
    markModified();
    updateUnderlyingFeatureLayer();
    rebuildEditorGraphics();
    updateEditorButtons();
    setCalibrationStatus(`${editingFeature.nome}: última alteração desfeita.`);
  });

  resetGeometryBtn.addEventListener('click', () => {
    if (!editingFeature) return;
    const original = originalGeometries.get(editingFeature.id);
    if (!original) return;
    pushUndoSnapshot();
    applyGeometry(editingFeature, original);
    modifiedGeometries.delete(editingFeature.id);
    persistModified();
    updateUnderlyingFeatureLayer();
    rebuildEditorGraphics();
    updateEditorButtons();
    setCalibrationStatus(`${editingFeature.nome}: restaurado para a geometria original desta versão.`);
  });

  referenceToggle.addEventListener('change', () => {
    if (referenceToggle.checked) {
      referenceOverlay.setOpacity(Number(referenceOpacity.value) / 100);
      referenceOverlay.addTo(map);
    } else if (map.hasLayer(referenceOverlay)) {
      map.removeLayer(referenceOverlay);
    }
  });

  referenceOpacity.addEventListener('input', () => {
    const value = Number(referenceOpacity.value);
    referenceOpacityValue.textContent = `${value}%`;
    referenceOverlay.setOpacity(value / 100);
  });

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  copyGeometryBtn.addEventListener('click', async () => {
    if (!editingFeature) return;
    const geometry = cloneGeometry(editingFeature);
    const payload = editingFeature.geometria === 'point'
      ? { id: editingFeature.id, x: geometry.x, y: geometry.y }
      : { id: editingFeature.id, points: geometry.points };
    try {
      await copyText(JSON.stringify(payload, null, 2));
      setCalibrationStatus(`${editingFeature.nome}: geometria copiada para a área de transferência.`);
    } catch (_) {
      setCalibrationStatus('Não foi possível copiar automaticamente. Use “Exportar alterações”.');
    }
  });

  exportGeometryBtn.addEventListener('click', () => {
    const changes = [];
    modifiedGeometries.forEach((geometry, id) => {
      const feature = features.find(item => item.id === id);
      if (!feature) return;
      changes.push({
        id,
        nome: feature.nome,
        geometria: feature.geometria,
        ...geometry
      });
    });

    const payload = {
      atlas: 'Valkaria',
      version: 'v0.5-calibration',
      base: config.baseImage,
      reference: config.referenceImage,
      exportedAt: new Date().toISOString(),
      changes
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'valkaria-calibracao-v0.7.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setCalibrationStatus(changes.length
      ? `${changes.length} geometria(s) exportada(s). Guarde o arquivo JSON e me envie quando terminarmos um bloco.`
      : 'Nenhuma geometria foi alterada ainda; o arquivo exportado está vazio.');
  });

  map.on('zoomstart', closeRosette);

  map.on('mousemove', event => {
    if (!coordsEnabled) return;
    coordsReadout.textContent = `X ${event.latlng.lng.toFixed(0)} · Y ${event.latlng.lat.toFixed(0)} · zoom ${map.getZoom().toFixed(2)}`;
  });

  map.on('click', event => {
    if (rosetteRecords.length) closeRosette();
    if (calibrationMode && editingFeature && editorAction === 'add') {
      insertNearestVertex(event.latlng.lng, event.latlng.lat);
      return;
    }
    if (!coordsEnabled) return;
    coordsReadout.textContent = `Selecionado: X ${event.latlng.lng.toFixed(0)} · Y ${event.latlng.lat.toFixed(0)}`;
  });

  function announceZoomBand() {
    document.body.classList.remove('zoom-city', 'zoom-district', 'zoom-local');
    document.body.classList.add(`zoom-${zoomBand()}`);
    document.dispatchEvent(new CustomEvent('valkaria:zoom', { detail: { zoom: map.getZoom(), band: zoomBand() } }));
  }

  map.on('zoomend', () => {
    announceZoomBand();
    renderFeatures();
    syncGroupsToMap();
  });

  window.VALKARIA_APP = {
    map, bounds, xy, features, groups, featureLayers,
    get selectedFeature() { return selectedFeature; },
    get selectedLayer() { return selectedLeafletLayer; },
    get gmMode() { return gmMode; },
    selectFeature, clearSelection, renderFeatures, syncGroupsToMap, featureHtml, styleFor,
    zoomBand, markerGlyph, markerFamily, markerTier, markerIconSvg, primaryCategory, canonLabel, statusLabel
  };

  renderFeatures();
  syncGroupsToMap();
  updateEditorButtons();
  updateModeBadge();
  announceZoomBand();
})();
