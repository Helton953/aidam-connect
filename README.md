# AIDAM Connect

Prompt de Desenvolvimento — Website Institucional AIDAM

Contexto

Desenvolve o website institucional da AIDAM — Associação de Importadores e Distribuidores de Automóveis de Moçambique, uma associação de direito privado sem fins lucrativos, reconhecida como pessoa colectiva em 2011, que representa empresas ligadas à importação, distribuição e serviços pós-venda de veículos, máquinas agrícolas e equipamentos industriais em Moçambique.

O website deve transmitir seriedade institucional, credibilidade e profissionalismo, mantendo um visual moderno, limpo e sem poluição visual.

Identidade Visual

Logótipo: silhueta de automóvel a vermelho sobre o nome "AIDAM", com a designação completa por baixo a cinzento.

Paleta de cores (extraída do logótipo):

Vermelho principal: #E30613

Cinzento escuro (texto/títulos): #4A4A4A

Cinzento médio (elementos secundários): #8C8C8C

Branco: #FFFFFF

Preto suave para texto de apoio: #1A1A1A

Tipografia: Manrope (Google Fonts) em todos os pesos — usar pesos mais leves (300–400) para texto corrido e pesos mais fortes (600–800) para títulos e destaques.

Estilo geral: layout amplo, muito espaço em branco, grelha bem alinhada, sem excesso de elementos decorativos. Cartões (cards) com sombras subtis, cantos arredondados moderados e hierarquia tipográfica clara.

Micro-interacções: animações discretas de entrada em scroll (fade-in + leve translação vertical) para secções e cards, hover states suaves em botões e links (transição de cor/sombra), transições de página suaves. Evitar animações exageradas ou que distraiam da leitura.

Estrutura de Páginas

1. Home

Hero com o logótipo, uma frase de posicionamento institucional e CTA para "Conhecer a AIDAM" / "Contactar".

Bloco de apresentação resumida (Quem Somos).

Destaque para Missão, Visão e Valores em formato de cards.

Secção de números/indicadores do sector automóvel (ex.: ano de fundação — 2011, número de associados, principais marcas representadas) — dados dinâmicos geridos via painel admin.

Bloco com as últimas 3 notícias (puxadas automaticamente da página Notícias).

Secção "Áreas de Actuação" resumida com ícones.

Rodapé com morada (Avenida do Trabalho, 1856, CP 1153, Maputo), telefone, fax e redes sociais.

2. Sobre Nós

Quem Somos — descrição institucional completa.

A Nossa História — linha do tempo (timeline) com marcos: reconhecimento pelo Ministério da Justiça (Out. 2011), publicação dos Estatutos no Boletim da República (Fev. 2012), e a nova etapa de dinamização institucional iniciada em 2025.

Missão, Visão e Valores (Integridade e Ética, Transparência, Representatividade, Cooperação, Profissionalismo, Inovação, Sustentabilidade, Defesa da concorrência leal, Responsabilidade institucional).

Objectivos (conforme Estatutos).

Áreas de Actuação.

Serviços Prestados aos associados.

Iniciativas Estratégicas da actual Direcção.

Órgãos Sociais — apresentar Assembleia Geral, Direcção e Conselho Fiscal em formato de cards por pessoa/empresa representada, com nome, empresa e link para LinkedIn quando disponível.

3. Portfólio (Associados)

Grelha de logótipos dos associados/marcas representadas (Caetano, Entreposto, CFAO, Motorcare, Ronil, Técnica Industrial, Interauto, Intercar, entre outros geridos via admin).

Cada card de associado deve permitir: logótipo, nome da empresa, marca(s) representada(s) e link para o website oficial.

Filtro opcional por tipo de negócio (viaturas ligeiras, máquinas agrícolas, equipamento industrial).

4. Notícias

Listagem cronológica de notícias/artigos do sector automóvel e da própria Associação (comunicados, estudos de mercado, eventos).

Cada notícia com imagem de destaque, título, data, resumo e página individual de leitura.

Espaço reservado para publicação periódica de dados de mercado (Total Industry Volume, evolução do mercado, quotas de mercado, segmentação por categoria, tendências do sector, estudos económicos) — idealmente com gráficos simples.

Pesquisa e paginação.

5. Contactos

Formulário de contacto (nome, empresa, e-mail, assunto, mensagem).

Morada: Avenida do Trabalho, 1856, CP 1153 — Maputo.

Telefone: 21 225 400 | Fax: 21 400 954.

Mapa incorporado (Google Maps).

Links para redes sociais.

Painel de Administração (CMS)

Área reservada, acessível por login com autenticação segura (utilizador/palavra-passe, idealmente com opção de recuperação de senha e registo de sessões), que permita à equipa da AIDAM gerir o conteúdo sem intervenção técnica:

Gestão de Notícias: criar, editar, agendar publicação, apagar e arquivar notícias (título, imagem, texto formatado, categoria, data).

Gestão de Associados/Portfólio: adicionar, editar e remover logótipos, nomes e links dos associados.

Gestão de Órgãos Sociais: actualizar composição da Assembleia Geral, Direcção e Conselho Fiscal.

Gestão de conteúdo institucional: editar textos das secções Quem Somos, Missão, Visão, Valores, Objectivos, Áreas de Actuação e Serviços.

Gestão de indicadores/estatísticas: actualizar números de destaque da Home e dados de mercado.

Gestão de mensagens de contacto: visualizar e responder a submissões do formulário de contactos.

Controlo de utilizadores: permitir níveis de acesso (administrador / editor).

Interface do admin igualmente limpa, com Manrope e as cores da marca, mas focada em usabilidade e produtividade (tabelas, formulários simples, pré-visualização de conteúdo antes de publicar).

Requisitos Técnicos e Não-Funcionais

Responsivo, adaptado a desktop, tablet e telemóvel.

Performance: carregamento rápido, imagens optimizadas, lazy loading para imagens fora do ecrã.

SEO: estrutura semântica (HTML5), meta tags configuráveis por página/notícia, URLs amigáveis, sitemap.xml.

Acessibilidade: contraste adequado entre vermelho/cinzento e fundo branco, texto alternativo em imagens, navegação por teclado.

Segurança: protecção do painel admin, validação de formulários, protecção contra spam no formulário de contacto (ex.: captcha ou honeypot).

Multilíngue (opcional): preparar estrutura para futura versão em inglês, mesmo que o lançamento inicial seja apenas em português.

Stack sugerida: stack moderna à escolha da equipa de desenvolvimento (ex.: Next.js/React no frontend com CMS headless, ou WordPress personalizado), desde que garanta o painel administrativo dinâmico e o desempenho pretendido.

Tom e Linguagem

Todo o conteúdo textual deve manter um tom institucional, claro e directo, em português de Moçambique/Portugal, coerente com a informação e a terminologia já usada nos Estatutos da Associação. NOTA: SERÁ USADO UM BANCO DE DADOS MySQL e será usada uma hospedagem própria com o dominio aidam.co.mz.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9b6ec1b-2647-460f-9881-a8bd05405d7b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
