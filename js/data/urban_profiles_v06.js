// Valkaria Viva I — assinaturas comerciais e metadados — D611–D642, D763–D800, D819–D836.
(() => {
  const p = {
    'centro': {
      comercioComum: ['padarias','cozinhas','tavernas','hospedagem','alfaiates','escribas','mensageiros','boticários','câmbio'],
      especialidades: ['artigos para peregrinos','guias urbanos','serviços jurídicos','escribas multilíngues','restauração documental','lembranças monumentais'],
      raridadesExclusivas: ['credenciais de peregrinação','cartografia por referências','memorialismo de viagem'],
      economiaCinza: ['golpes contra visitantes','intermediação discreta','turismo adulto caro'],
      coberturaGuarda: 'forte'
    },
    'recomeco': {
      comercioComum: ['alimentação','serviços domésticos','transporte','lavanderia','saúde privada'],
      especialidades: ['alta alfaiataria','joalheria','restauração de arte','genealogia','segurança privada','paisagismo'],
      raridadesExclusivas: ['autenticação de linhagens','restauração patrimonial','fontes arcanas ornamentais','seleção de criadagem'],
      economiaCinza: ['favores discretos','serviços adultos por indicação','intermediação patrimonial opaca'],
      coberturaGuarda: 'forte'
    },
    'baixa-vila': {
      comercioComum: ['alimentação','pensões','roupas','banhos','reparos'],
      especialidades: ['instrumentos','figurinos','cenografia','maquiagem','tatuagem','cafés','teatros','casas de companhia'],
      raridadesExclusivas: ['costureiros de palco','arquivistas de canções','cenários portáteis'],
      economiaCinza: ['sexo','festas','drogas no varejo','jogos clandestinos'],
      coberturaGuarda: 'regular'
    },
    'entrepassos': {
      comercioComum: ['comida pronta','lavanderias','pensões','reparos','pequenos mercados'],
      especialidades: ['mensageria','carregadores','manutenção predial','serviços para edifícios verticais'],
      raridadesExclusivas: ['guias verticais','mudanceiros de altura','correios de janela'],
      economiaCinza: ['documentos discretos','pequenos intermediários'],
      coberturaGuarda: 'regular'
    },
    'os-solares': {
      comercioComum: ['alimentação','pensões','vestuário','saúde','serviços domésticos'],
      especialidades: ['tutores','clínicas privadas','escritórios','contabilidade','antiquários menores'],
      raridadesExclusivas: ['administradores de residências divididas','inventariantes'],
      economiaCinza: ['clubes privados','companhia discreta'],
      coberturaGuarda: 'regular'
    },
    'mercado': {
      comercioComum: ['praticamente todas as categorias legais de varejo'],
      especialidades: ['variedade','disponibilidade','competição','atacado','corretagem'],
      raridadesExclusivas: ['leilões instantâneos','ruas de produto variável','corretores de qualquer mercadoria legal'],
      economiaCinza: ['transações escondidas em comércio legítimo','contrabando por rede'],
      coberturaGuarda: 'forte'
    },
    'cidade-praia': {
      comercioComum: ['mercados','comida','roupa','tavernas','pensões','boticários'],
      especialidades: ['metalurgia','carroças','estábulos','curtumes','armazenamento','reparo pesado','cordoaria','canais'],
      raridadesExclusivas: ['veículos especiais','couros monstruosos','oficinas de canal','recuperação industrial'],
      economiaCinza: ['depósitos clandestinos','redistribuição','mercadorias sem origem clara'],
      coberturaGuarda: 'regular_tensa'
    },
    'favela-goblins': {
      comercioComum: ['comida','roupas','mercados pequenos','medicamentos','serviços comunitários'],
      especialidades: ['sucata','reaproveitamento','reparo barato','invenções','peças improvisadas'],
      raridadesExclusivas: ['transformadores de objetos','peças inexistentes','protótipos experimentais'],
      economiaCinza: ['comércio informal forte; não implica criminalidade dos moradores'],
      coberturaGuarda: 'irregular'
    },
    'nitamu-ra': {
      comercioComum: ['mercearias','refeições','vestuário','oficinas','saúde','hospedagem'],
      especialidades: ['chá','gastronomia tamuraniana','caligrafia','papel','cerâmica','vestuário','treinamento marcial'],
      raridadesExclusivas: ['restauro de objetos pré-Tormenta','caligrafia cerimonial','equipamentos marciais por escola','casas de memória familiar'],
      coberturaGuarda: 'regular'
    },
    'refugio-felicidade': {
      comercioComum: ['alimentação','serviços residenciais','segurança','joias'],
      especialidades: ['decoração','magia doméstica','festas','arquitetura','paisagismo','assessoria financeira'],
      raridadesExclusivas: ['decoradores de ascensão','cofres para aventureiros','festas de retorno'],
      economiaCinza: ['favores e serviços clandestinos de luxo por indicação'],
      coberturaGuarda: 'forte'
    },
    'corredor-verde': {
      comercioComum: ['alimentação','livros','saúde','serviços para estudantes e religiosos'],
      especialidades: ['copistas','herbalismo','instrumentos científicos','cartografia','restauração de manuscritos'],
      raridadesExclusivas: ['encadernação de tomos perigosos','jardinagem litúrgica','preparação acadêmica de expedições']
    },
    'vila-elfica': {
      comercioComum: ['alimentação','serviços residenciais','artesanato'],
      especialidades: ['marcenaria fina','escultura','instrumentos','tecidos','herbalismo','arte'],
      raridadesExclusivas: ['luthiers élficos','madeira viva','restauro de arte de Lenórienn','artesanato de memória élfica']
    },
    'ultimo-pavilhao': {
      comercioComum: ['comida','hospedagem','roupas','banhos','reparos','mercados'],
      especialidades: ['estruturas desmontáveis','barracas','móveis dobráveis','utensílios baratos','refeições coletivas'],
      raridadesExclusivas: ['casas provisórias permanentes','mercadoria civil derivada de logística militar'],
      coberturaGuarda: 'local_regular'
    },
    'poco-velho': {
      comercioComum: ['comércio familiar','alimentos','pequenos artesãos','hospedagem'],
      especialidades: ['ferramentas rurais adaptadas','produtos tradicionais','ofícios de aldeia'],
      raridadesExclusivas: ['ofícios que a metrópole esqueceu','receitas do assentamento antigo','oficinas hereditárias']
    },
    'quatro-patios': {
      comercioComum: ['mercados','escolas','clínicas','alimentação','serviços residenciais'],
      especialidades: ['serviços familiares','móveis modulares','administração residencial','comércio infantil'],
      raridadesExclusivas: ['mobiliário de pátio','cooperativas de vizinhança']
    },
    'cinturao-caravanas': {
      comercioComum: ['hospedagem','comida','banhos','estábulos','câmbio','reparo'],
      especialidades: ['armazenagem','cocheiros','ferradores','carga','animais','serviços para viajantes'],
      raridadesExclusivas: ['despachantes de caravana','certificação de carga','hospedagem para criaturas grandes','armazéns temporários','corretores de escolta'],
      economiaCinza: ['contrabando','prostituição de passagem','entrada clandestina de mercadorias'],
      coberturaGuarda: 'regular'
    },
    'grande-acesso-sul': {
      comercioComum: ['tavernas','pensões','comida','banhos','transporte'],
      especialidades: ['equipamento esportivo','treinamento','curandeiros','apostas','empresários','alojamento de equipes'],
      raridadesExclusivas: ['treinadores de monstros de espetáculo','armas de combate não letal','empresários de gladiadores','cenografia de Arena'],
      coberturaGuarda: 'forte'
    }
  };
  for (const feature of window.VALKARIA_FEATURES || []) {
    if (p[feature.id]) Object.assign(feature, p[feature.id]);
  }

  const patch = (id, values) => {
    const feature = (window.VALKARIA_FEATURES || []).find(x => x.id === id);
    if (feature) Object.assign(feature, values);
  };

  // POIs oficiais enriquecidos para a v0.6.
  patch('catedral-valkaria', { camada:'religiao', categorias:['religiao','funerario'], relevancia:'metropolitana', territorio:'Centro', decisoes:['D556','D557','D558','D895'] });
  patch('biblioteca-duas-deusas', { camada:'educacao', categorias:['educacao','religiao','cultura'], relevancia:'metropolitana', territorio:'Corredor Verde', decisoes:['D897','D915'] });
  patch('banco-tibar', { categorias:['comercio','religiao'], relevancia:'metropolitana', territorio:'Centro–Mercado', subtipoReligioso:'Capela do Primeiro Tibar integrada', decisoes:['D562','D563','D858'] });
  patch('casa-millicent', { camada:'saude', categorias:['saude'], relevancia:'metropolitana', territorio:'Setor leste intramuros', decisoes:['D570','D571','D923'] });
  patch('sassafras-artigos-alquimicos', { categorias:['comercio','magia'], relevancia:'distrital', territorio:'Mercado', decisoes:['D537','D873','D931'] });
  patch('gazeta-reinado', { categorias:['cultura','comercio'], relevancia:'metropolitana', territorio:'Entrepassos' });
  patch('arena-imperial', { categorias:['cultura','vida_noturna'], relevancia:'metropolitana', territorio:'Grande Acesso Sul' });
  patch('palacio-imperial', { categorias:['governo'], relevancia:'metropolitana', territorio:'Perímetro Palaciano' });
  patch('a-casa', { categorias:['campanha'], relevancia:'distrital', territorio:'Centro–Baixa' });
  patch('favela-goblins', { coberturaGuarda:'irregular' });
})();
