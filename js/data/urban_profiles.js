// Perfis territoriais e de vida cotidiana — D611–D642.
(() => {
  const profiles = {
    'centro': {
      perfilUrbano: 'Turismo, peregrinação e serviços urbanos caros',
      atividadesFortes: ['tavernas', 'guias', 'teatros', 'lembranças', 'documentação', 'advocacia', 'comércio excêntrico', 'serviços para aventureiros'],
      ritmoUrbano: 'intenso durante todo o dia; forte presença noturna em setores específicos'
    },
    'perimetro-palaciano': {
      perfilUrbano: 'Governo, corte e segurança institucional',
      atividadesFortes: ['fornecedores oficiais', 'serviço da corte', 'segurança', 'diplomacia', 'logística palaciana'],
      ritmoUrbano: 'controlado e institucional'
    },
    'recomeco': {
      perfilUrbano: 'Dinheiro antigo, residências aristocráticas e luxo tradicional',
      atividadesFortes: ['alfaiataria de luxo', 'joalheria', 'arte', 'criados', 'segurança privada', 'gastronomia cara', 'clubes'],
      ritmoUrbano: 'predominantemente diurno e vespertino; vida privada à noite'
    },
    'baixa-vila': {
      perfilUrbano: 'Cultura, boemia e vida noturna',
      atividadesFortes: ['tavernas', 'teatros', 'ateliês', 'bardos', 'música', 'comida noturna', 'hospedagem', 'entretenimento adulto'],
      ritmoUrbano: 'cresce ao entardecer e permanece intenso madrugada adentro'
    },
    'entrepassos': {
      perfilUrbano: 'Alta densidade e serviços cotidianos',
      atividadesFortes: ['alimentação', 'pequenos comércios', 'mensageiros', 'oficinas leves', 'pensões', 'lavanderias', 'clínicas', 'despachantes'],
      ritmoUrbano: 'constante do amanhecer ao começo da noite'
    },
    'cem-portas': {
      perfilUrbano: 'Especialização comercial e serviços de nicho',
      atividadesFortes: ['reparos', 'itens usados', 'penhores', 'peças raras', 'artesãos especializados', 'documentação', 'mercado cinza discreto'],
      ritmoUrbano: 'principalmente diurno; negócios discretos se prolongam à noite'
    },
    'os-solares': {
      perfilUrbano: 'Serviços privados e residenciais de classe média',
      atividadesFortes: ['pensões', 'escolas', 'tutores', 'clínicas', 'escritórios', 'clubes privados', 'casas de companhia discretas'],
      ritmoUrbano: 'diurno e vespertino; noite discreta e privada'
    },
    'mercado': {
      perfilUrbano: 'Comércio metropolitano de máxima variedade',
      atividadesFortes: ['lojas permanentes', 'tendas', 'equipamento de aventureiro', 'magia', 'alquimia', 'alimentação', 'finanças', 'serviços especializados'],
      ritmoUrbano: 'muito intenso durante o dia; segmentos específicos continuam à noite'
    },
    'cidade-praia': {
      perfilUrbano: 'Produção, oficinas e serviços incômodos',
      atividadesFortes: ['oficinas', 'estábulos', 'curtumes', 'consertos', 'reaproveitamento', 'armazenamento', 'comida popular', 'atividade cinza'],
      ritmoUrbano: 'começa cedo; atividade produtiva forte durante o dia'
    },
    'favela-goblins': {
      perfilUrbano: 'Economia comunitária, reaproveitamento e improvisação',
      atividadesFortes: ['sucata', 'reparos', 'invenções', 'alimentação comunitária', 'serviços informais', 'comércio subterrâneo'],
      ritmoUrbano: 'irregular e comunitário, sem separação rígida entre trabalho e moradia'
    },
    'nitamu-ra': {
      perfilUrbano: 'Comércio cultural e serviços especializados',
      atividadesFortes: ['mercadorias tamuranianas', 'artesanato', 'treinamento marcial', 'ensino', 'alimentação', 'jardins', 'hospedagem cultural'],
      ritmoUrbano: 'predominantemente diurno e sereno'
    },
    'refugio-felicidade': {
      perfilUrbano: 'Novos ricos, aventureiros enriquecidos e luxo ostensivo',
      atividadesFortes: ['decoração', 'serviços mágicos', 'segurança', 'clubes', 'joias', 'entretenimento privado', 'consultoria financeira'],
      ritmoUrbano: 'diurno para serviços; noite privada e social'
    },
    'corredor-verde': {
      perfilUrbano: 'Conhecimento, religião, saúde e lazer',
      atividadesFortes: ['livros', 'copistas', 'ensino', 'herbalismo', 'templos', 'curandeiros', 'jardins', 'atividades contemplativas'],
      ritmoUrbano: 'principalmente diurno'
    },
    'vila-elfica': {
      perfilUrbano: 'Enclave cultural misto e artesanal',
      atividadesFortes: ['artes', 'artesanato fino', 'herbalismo', 'alimentação', 'música', 'serviços culturais', 'comércio especializado'],
      ritmoUrbano: 'diurno e vespertino'
    },
    'ultimo-pavilhao': {
      perfilUrbano: 'Trabalhadores, residentes e viajantes',
      atividadesFortes: ['comida barata', 'hospedagem', 'banhos', 'lavanderias', 'oficinas', 'entretenimento popular', 'pequenos mercados'],
      ritmoUrbano: 'cedo pela manhã até tarde da noite'
    },
    'poco-velho': {
      perfilUrbano: 'Bairro tradicional absorvido pela metrópole',
      atividadesFortes: ['comércio familiar', 'comida local', 'artesãos antigos', 'pequenas hospedarias', 'serviços comunitários'],
      ritmoUrbano: 'predominantemente diurno'
    },
    'quatro-patios': {
      perfilUrbano: 'Expansão planejada de classe média',
      atividadesFortes: ['mercados de bairro', 'escolas', 'clínicas', 'alimentação', 'escritórios', 'serviços residenciais'],
      ritmoUrbano: 'diurno e começo da noite'
    },
    'cinturao-caravanas': {
      perfilUrbano: 'Economia de passagem e logística',
      atividadesFortes: ['hospedagem', 'comida', 'banhos', 'estábulos', 'depósitos', 'carroças', 'animais', 'reparos', 'jogos', 'câmbio', 'vida noturna', 'serviços adultos'],
      ritmoUrbano: 'quase contínuo, acompanhando chegadas e partidas'
    },
    'grande-acesso-sul': {
      perfilUrbano: 'Circulação metropolitana e serviços ligados à zona da Arena',
      atividadesFortes: ['hospedagem', 'tavernas', 'curandeiros', 'treinamento', 'apostas', 'animais', 'transporte'],
      ritmoUrbano: 'varia fortemente conforme eventos e fluxos de entrada'
    }
  };

  for (const feature of window.VALKARIA_FEATURES || []) {
    const profile = profiles[feature.id];
    if (profile) Object.assign(feature, profile);
  }
})();
