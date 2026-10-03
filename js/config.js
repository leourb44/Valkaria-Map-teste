window.VALKARIA_CONFIG = {
  mapWidth: 15000,
  mapHeight: 10000,
  baseImage: 'assets/mapa-valkaria-master-v1.0.png',
  referenceImage: 'assets/reference/mapa-mestre-v0.4-referencia-aproximada.png',
  minZoom: -4,
  maxZoom: 3,
  initialLayers: ['territorios', 'circulacao', 'instituicoes', 'economia', 'religiao', 'educacao', 'saude', 'magia', 'funerario', 'seguranca', 'abastecimento', 'campanha'],
  defaultStatusFilters: ['conceptual_approved', 'approximate', 'candidate', 'reserve', 'historical', 'confirmed', 'pending']
};

window.VALKARIA_LAYERS = {
  territorios:    { label: 'Territórios', visible: true },
  centralidades:  { label: 'Centralidades urbanas (análise)', visible: false },
  circulacao:     { label: 'Circulação estruturante', visible: true },
  estrutura_funcional: { label: 'Estrutura funcional (editorial)', visible: false },
  instituicoes:   { label: 'Instituições gerais', visible: true },
  economia:       { label: 'Comércio e vida urbana', visible: true },
  religiao:       { label: 'Religião', visible: true },
  educacao:       { label: 'Educação e conhecimento', visible: true },
  saude:          { label: 'Saúde e cuidado', visible: true },
  magia:          { label: 'Magia e serviços arcanos', visible: true },
  funerario:      { label: 'Funerário', visible: true },
  seguranca:      { label: 'Guarda e segurança', visible: true },
  infraestrutura:{ label: 'Infraestrutura', visible: true },
  hidrografia:    { label: 'Água e canais', visible: true },
  abastecimento:  { label: 'Abastecimento de água', visible: true },
  subterraneo:    { label: 'Subterrâneo e esgotos', visible: false },
  circulacao_elevada: { label: 'Circulação elevada', visible: false },
  historia:       { label: 'Valkaria Histórica', visible: false },
  campanha:       { label: 'Cânone da campanha', visible: true },
  faccoes:        { label: 'Facções e crime', visible: false },
  gm:             { label: 'Segredos do Mestre', visible: false, gmOnly: true }
};

window.VALKARIA_STATUS = {
  confirmed: { label: 'Confirmado', css: 'status-confirmed' },
  conceptual_approved: { label: 'Conceitual aprovado', css: 'status-approved' },
  approximate: { label: 'Aproximado', css: 'status-approximate' },
  candidate: { label: 'Candidato', css: 'status-candidate' },
  reserve: { label: 'Reserva', css: 'status-reserve' },
  historical: { label: 'Histórico', css: 'status-historical' },
  pending: { label: 'Sem coordenada', css: 'status-pending' }
};

window.VALKARIA_CANON = {
  canon_atual: '📘 CÂNONE OFICIAL ATUAL',
  canon_antigo: '📜 CÂNONE OFICIAL ANTIGO / A VERIFICAR',
  dragao_brasil: '🐉 DRAGÃO BRASIL',
  campanha: '✅ CÂNONE DA CAMPANHA',
  expansao_valkaria: '🟡 EXPANSÃO DE VALKARIA'
};

window.VALKARIA_CATEGORIES = {
  comercio: 'Comércio',
  alimentacao: 'Alimentação',
  hospedagem: 'Hospedagem',
  vida_noturna: 'Vida noturna',
  adulto: 'Adulto',
  jogos: 'Jogos',
  mercado_cinza: 'Mercado cinza',
  drogas: 'Drogas',
  trafico_pessoas: 'Tráfico de pessoas',
  submundo: 'Submundo',
  religiao: 'Religião',
  educacao: 'Educação',
  saude: 'Saúde',
  magia: 'Magia',
  funerario: 'Funerário',
  guarda: 'Guarda',
  governo: 'Governo',
  cultura: 'Cultura',
  transporte: 'Transporte',
  historico: 'Histórico',
  campanha: 'Campanha'
};

window.VALKARIA_GM_CATEGORIES = ['drogas', 'trafico_pessoas', 'submundo'];

window.VALKARIA_RELEVANCE = {
  metropolitana: 'Metropolitana',
  distrital: 'Distrital',
  local: 'Local'
};

window.VALKARIA_FEATURES = [];
