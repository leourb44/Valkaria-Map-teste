window.VALKARIA_FEATURES.push(
{
  "id": "perimetro-palaciano",
  "nome": "Perímetro Palaciano",
  "tipo": "zona_especial",
  "geometria": "polygon",
  "camada": "infraestrutura",
  "statusCanonico": "canon_atual",
  "statusCartografico": "conceptual_approved",
  "fronteira": "strong",
  "publico": true,
  "descricaoPublica": "Zona especial de segurança e monumentalidade associada ao Palácio Imperial.",
  "descricaoGM": "Contorno conceitual; deve permanecer contido no Centro ampliado. Geometria inicial reaplicada sobre a base v0.4; ajuste fino pendente. Macrogeometria incorporada a partir do checkpoint de calibração 01 da v0.4; refinamento fino ainda permitido.",
  "origem": "Atlas de Arton + reconstrução",
  "decisoes": [
    "U07",
    "D277",
    "D286",
    "D408",
    "D430",
    "D466"
  ],
  "worldcraftUrl": "",
  "points": [
    [
      9548,
      5804
    ],
    [
      9676,
      5344
    ],
    [
      10000,
      5060
    ],
    [
      10052,
      4752
    ],
    [
      8789,
      4287
    ],
    [
      8344,
      4584
    ],
    [
      7940,
      4588
    ],
    [
      7824,
      4992
    ],
    [
      8132,
      5264
    ],
    [
      8116,
      5688
    ],
    [
      8352,
      5792
    ]
  ]
},
{
  "id": "lago-marah",
  "nome": "Lago de Marah",
  "tipo": "corpo_dagua",
  "geometria": "polygon",
  "camada": "hidrografia",
  "statusCanonico": "canon_antigo",
  "statusCartografico": "candidate",
  "fronteira": "strong",
  "publico": true,
  "descricaoPublica": "Corpo d’água histórico associado ao Corredor Verde.",
  "descricaoGM": "Continuidade presumida e posição candidata. Geometria inicial reaplicada sobre a base v0.4; ajuste fino pendente. Macrogeometria incorporada a partir do checkpoint de calibração 01 da v0.4; refinamento fino ainda permitido.",
  "origem": "continuidade_presumida",
  "decisoes": [
    "D73-D81",
    "D295",
    "D417",
    "D475"
  ],
  "worldcraftUrl": "",
  "points": [
    [
      9668,
      3773
    ],
    [
      10301,
      3824
    ],
    [
      10624,
      3886
    ],
    [
      12434,
      2755
    ],
    [
      10522,
      2670
    ],
    [
      9962,
      3032
    ],
    [
      9481,
      3502
    ]
  ]
},
{
  "id": "muralha-atual",
  "nome": "Muralha Atual",
  "tipo": "fortificacao",
  "geometria": "polyline",
  "camada": "infraestrutura",
  "statusCanonico": "canon_atual",
  "statusCartografico": "conceptual_approved",
  "fronteira": "strong",
  "publico": true,
  "descricaoPublica": "Grande fortificação atual de Valkaria. A metrópole continua para além dela.",
  "descricaoGM": "Traçado aproximado derivado da imagem-base; precisa de calibração fina antes de congelamento. Geometria inicial reaplicada sobre a base v0.4; ajuste fino pendente. Macrogeometria incorporada a partir do checkpoint de calibração 01 da v0.4; refinamento fino ainda permitido.",
  "origem": "reconstrucao_cartografica",
  "decisoes": [
    "D82-D91",
    "D321",
    "D353",
    "D436",
    "D476"
  ],
  "worldcraftUrl": "",
  "points": [
    [
      4400,
      7776
    ],
    [
      5104,
      8336
    ],
    [
      6934,
      8389
    ],
    [
      8594,
      8535
    ],
    [
      10205,
      7998
    ],
    [
      11523,
      7461
    ],
    [
      13136,
      6800
    ],
    [
      14560,
      5024
    ],
    [
      14032,
      3664
    ],
    [
      13344,
      2848
    ],
    [
      11840,
      2656
    ],
    [
      10645,
      2627
    ],
    [
      9552,
      1969
    ],
    [
      7666,
      2041
    ],
    [
      6352,
      1856
    ],
    [
      4864,
      2768
    ],
    [
      3728,
      3120
    ],
    [
      2368,
      4000
    ],
    [
      1514,
      4873
    ],
    [
      1562,
      6045
    ],
    [
      3040,
      6560
    ],
    [
      3872,
      7152
    ],
    [
      4352,
      7776
    ]
  ]
}
,
{
  "id": "complexo-portao-norte",
  "nome": "Complexo do Grande Acesso Norte",
  "tipo": "complexo_portao",
  "geometria": "polygon",
  "camada": "infraestrutura",
  "statusCanonico": "expansao_valkaria",
  "statusCartografico": "approximate",
  "fronteira": "strong",
  "publico": true,
  "descricaoPublica": "Grande complexo de entrada associado ao principal corredor logístico setentrional de Valkaria.",
  "descricaoGM": "Implantação aproximada sobre o encontro do Grande Acesso Norte com a muralha. O complexo pode incluir pátios, fiscalização, guaritas, áreas de espera, comércio, estábulos e circulação de carga. D511, D515–D517.",
  "origem": "auditoria_valkaria",
  "decisoes": ["D511", "D515", "D516", "D517"],
  "points": [[7270,8570],[7970,8570],[8110,8390],[8000,8150],[7290,8150],[7160,8380]]
},
{
  "id": "complexo-portao-sul",
  "nome": "Complexo do Grande Acesso Sul",
  "tipo": "complexo_portao",
  "geometria": "polygon",
  "camada": "infraestrutura",
  "statusCanonico": "expansao_valkaria",
  "statusCartografico": "approximate",
  "fronteira": "strong",
  "publico": true,
  "descricaoPublica": "Grande complexo de entrada meridional de Valkaria, funcionalmente distinto do acesso norte.",
  "descricaoGM": "Implantação aproximada sobre o encontro do Grande Acesso Sul com a muralha. Não deve ser uma cópia funcional do complexo norte. D512, D515–D517.",
  "origem": "auditoria_valkaria",
  "decisoes": ["D512", "D515", "D516", "D517"],
  "points": [[7250,2250],[7970,2250],[8080,2050],[7970,1840],[7280,1840],[7160,2040]]
}


);
