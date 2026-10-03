# Atlas Interativo de Valkaria — v0.9.1 · Refinamento Visual e Experiência de Entrada

## Mudanças da v0.9.1
- pins 42 / 34 / 28 / 22 px, sem marcador público microscópico;
- área clicável ampliada especialmente para Local e Micro;
- escala progressiva por zoom preservando mínimo visual de ~20 px;
- Micro volta a exibir ícone interno;
- nova entrada em livro físico sobre mesa de cartógrafo, com texturas locais leves;
- transição de abertura ~720 ms e suporte a `prefers-reduced-motion`;
- Madame Meia-Noite auditada: registro único, público, Baixa Vila, agora renderizada como pin Monumental;
- footprint original da Madame preservado em `areaPointsOriginal`;
- geometrias territoriais e MASTER cartográfico não foram alterados.

---

# Atlas Interativo de Valkaria — v0.9 · Sistema Oficial de Pins

Esta versão implementa a ✅ **REFERÊNCIA VISUAL OFICIAL — SISTEMA DE PINS DO ATLAS DE VALKARIA**.

## Mudanças da v0.9
- quatro níveis visuais: **Monumental, Relevante, Local e Micro**;
- todos os pins públicos de camadas de POI ficam disponíveis em todas as escalas, reduzidos progressivamente em vez de desaparecerem;
- pins em formato de **selo cartográfico**, com aro envelhecido e ponta ancorada na coordenada;
- ícones internos em SVG monocromático, nítidos em qualquer zoom;
- famílias cromáticas discretas para governo, religião, comércio, hospedagem, transporte, guarda, educação, saúde, magia e demais categorias;
- estados Normal / Hover / Selecionado alinhados à prancha oficial;
- rótulos permanentes continuam conservadores: nenhum na visão geral, Monumentais na visão distrital e Monumentais + Relevantes na visão local;
- camadas públicas de educação, magia, funerário, segurança e abastecimento passam a iniciar visíveis para que os POIs menores também componham o atlas;
- centralidades analíticas e camadas de Mestre continuam opcionais;
- nenhuma geometria cartográfica congelada foi alterada.

A prancha oficial usada como referência está em `assets/checkpoints/REFERENCIA_VISUAL_OFICIAL_PINS_VALKARIA.png`.

---

Esta versão aplica a **Calibração Cartográfica MASTER v1.0** sobre o **MASTER VISUAL OFICIAL — ATLAS DE VALKARIA v1.0**.

## Mudanças da v0.8.1

### Refinamento 0.8.1 — hierarquia visual
- visão geral: POIs metropolitanos permanecem como medalhões, mas sem rótulos permanentes;
- territórios menores deixam de disputar espaço na escala da cidade;
- visão distrital revela nomes metropolitanos;
- visão local revela também nomes distritais;
- nenhum conteúdo, coordenada ou geometria congelada foi alterado.

- nova arte-base oficial;
- 40+ geometrias estruturais consolidadas por patch não destrutivo;
- muralha, territórios principais, sistema verde, acessos, eixos e landmarks recalibrados;
- Grande Acesso Norte corrigido para a muralha da arte final;
- Rocha Cinzenta e canais mantidos como `approximate`, sem falsa precisão;
- conteúdo da v0.7 preservado;
- `js/calibration_v1.js` aplica a calibração após carregar os dados e antes de inicializar o mapa.

**Observação de resolução:** a imagem presente neste pacote é a cópia recebida na conversa. Uma cópia de maior resolução com o mesmo enquadramento pode substituir `assets/mapa-valkaria-master-v1.0.png` sem alterar as coordenadas.

---

# Valkaria — Atlas Interativo da Capital do Mundo — v0.7

Campanha **Sob o Céu Escarlate**.

Esta versão é o marco de **Acabamento Visual / UX** sobre a base de conteúdo aprovada da v0.6. Nenhuma expansão significativa de conteúdo foi feita nesta etapa: territórios, POIs, instituições, comércio, religião, saúde, segurança, história, infraestrutura e dados da campanha foram preservados.

## Como abrir

1. Abra a pasta no VS Code.
2. Inicie `index.html` com **Live Server**.
3. Clique na capa do livro para abrir o atlas.

> A distribuição mantém o Leaflet 1.9.4 via CDN, como nas versões anteriores; portanto, a primeira carga da biblioteca exige conexão com a internet.

## Direção visual aprovada — V01–V60

- Identidade: 10% Atlas Real + 50% Atlas de Aventureiro + 40% Atlas Arcano.
- Paleta: pergaminho, carvão/sépia, ouro envelhecido, couro, púrpura arcano e vinho no Modo Mestre.
- Textura de uso: 50% usada, sempre subordinada à legibilidade.
- Tipografia: manuscrito controlado para identidade/rótulos; leitura longa preserva alta legibilidade.
- Abertura: livro de couro com gravação de campanha; clique abre o atlas.
- Interface em repouso: mapa domina a tela; controles permanecem discretos.
- Busca: superior esquerda, direta.
- Ferramentas: aba vertical estreita na lateral esquerda.
- Ficha: gaveta do atlas à direita no desktop; gaveta inferior no celular.
- Pins: selos heráldicos em pequenos medalhões de tinta e pergaminho, com cor muito discreta por família.
- Territórios: quase neutros em repouso; família cromática suave aparece em hover/seleção; borda contínua de pena.
- Zoom: revelação progressiva equilibrada puxada para conservadora.
- Rótulos: manuscrito orgânico; nomes de POIs obedecem à hierarquia de relevância/zoom.
- Modo Mestre: vinho + anotações/revelações discretas, sem transformar o atlas em UI moderna.
- Camada histórica: fantasma cartográfico.
- Subterrâneo: camada técnica simples e tracejada.
- Água: azul antigo dessaturado com leitura cartográfica.
- Navegação: rosa dos ventos, zoom e retorno à cidade no canto inferior esquerdo.
- Legenda: contextual compacta + índice completo.
- Marcadores de sessão: ★ Importante, ◇ Visitar, ⚠ Perigo, ♟ NPC e ? Pista, com nota opcional. São temporários e somem ao recarregar.
- Som: nenhum.

## Comportamentos principais

### Zoom inteligente

- **Visão da Cidade:** marcos metropolitanos e estrutura macro.
- **Visão Distrital:** instituições e POIs distritais passam a aparecer.
- **Visão Local:** estabelecimentos e POIs locais são revelados.

A busca ignora essa limitação quando necessário: ao selecionar um resultado local, o atlas aproxima o mapa e revela o POI.

### Seleção

POIs recebem destaque dourado discreto. Territórios aumentam contraste e abrem a ficha urbana na gaveta.

### Modo Mestre

Ativado dentro de **Ferramentas do Cartógrafo → Mestre**. Elementos e categorias GM continuam obedecendo às regras da v0.6.

### Atalhos

- `/` — focar busca
- `F` — abrir/fechar Ferramentas do Cartógrafo
- `M` — abrir ferramentas na seção Mestre
- `Esc` — fechar resultados, gavetas ou índice

## Estrutura

- `index.html` — composição final da interface.
- `css/styles.css` — direção visual v0.7.
- `js/app.js` — motor cartográfico + renderização/zoom inteligente.
- `js/ui_v07.js` — capa, gavetas, ferramentas, legenda, atalhos e marcas temporárias.
- `js/data/` — dados preservados da v0.6.
- `assets/mapa-valkaria-v0.4.png` — mapa-base aprovado.
- `assets/checkpoints/fase5-v01-v60.json` — decisões visuais consolidadas.
- `assets/checkpoints/validation-v0.7.json` — validação estrutural da versão.

## Observação sobre a capa

A v0.7 utiliza uma **gravação tipográfica de “Sob o Céu Escarlate”** na capa, porque o pacote v0.6 não contém um arquivo gráfico separado da logo da campanha. Quando a arte oficial da logo for adicionada aos assets, ela pode substituir essa gravação sem alterar a estrutura da abertura.

## Próximo marco

**v0.8 — Revisão Final:** inspeção visual em uso real, correções de sobreposição, legibilidade, busca, responsividade, performance e pequenos ajustes de posição/escala. Depois disso, a primeira versão congelada será **v1.0 — Atlas Interativo de Valkaria**.
