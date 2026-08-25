# Website Institucional AIDAM — Fase 1 (Frontend)

Site institucional completo em português, com identidade visual da AIDAM, conteúdo real embutido em ficheiros de dados editáveis, e estrutura preparada para ligar ao CMS/base de dados numa segunda fase.

## Identidade visual

- Paleta: vermelho #E30613 (primário), cinzento escuro #4A4A4A (títulos/texto), cinzento médio #8C8C8C (secundário), branco #FFFFFF, preto suave #1A1A1A. Todas as cores registadas como tokens semânticos (oklch) no design system.
- Tipografia Manrope (Google Fonts) — 300/400 para texto corrido, 600/800 para títulos.
- Layout amplo, muito espaço em branco, grelha alinhada, cards com cantos arredondados moderados e sombras subtis.
- Micro-interacções: fade-in + translação vertical suave ao scroll, hover states discretos em botões/links, transições de página suaves.
- Logótipo: fica um marcador temporário no cabeçalho e rodapé; substituo pelo ficheiro oficial assim que o carregar.

## Páginas

1. **Home** — hero com logótipo, frase de posicionamento e CTAs ("Conhecer a AIDAM" / "Contactar"); resumo Quem Somos; cards de Missão, Visão e Valores; faixa de indicadores (fundação 2011, nº de associados, marcas representadas); últimas 3 notícias; Áreas de Actuação com ícones.
2. **Sobre Nós** — Quem Somos; linha do tempo (reconhecimento pelo Ministério da Justiça em Out. 2011, Estatutos no Boletim da República em Fev. 2012, dinamização institucional em 2025); Missão/Visão/Valores; Objectivos; Áreas de Actuação; Serviços aos associados; Iniciativas Estratégicas; Órgãos Sociais (Assembleia Geral, Direcção, Conselho Fiscal) em cards com nome, empresa e LinkedIn.
3. **Portfólio (Associados)** — grelha de cards com logótipo, empresa, marcas representadas e link para o site oficial; filtro por tipo de negócio (viaturas ligeiras, máquinas agrícolas, equipamento industrial).
4. **Notícias** — listagem cronológica com pesquisa e paginação; página individual por notícia (imagem de destaque, data, categoria, corpo do artigo); secção "Dados de Mercado" com gráficos de exemplo (Total Industry Volume, evolução mensal, quotas de mercado, segmentação por categoria).
5. **Contactos** — formulário (nome, empresa, e-mail, assunto, mensagem) com validação e honeypot anti-spam; morada Avenida do Trabalho, 1856, CP 1153 — Maputo; telefone 21 225 400, fax 21 400 954; mapa Google Maps incorporado; redes sociais.

Rodapé partilhado com morada, contactos, navegação e redes sociais; cabeçalho fixo com menu responsivo (hambúrguer em telemóvel).

## Qualidade e SEO

- Responsivo (desktop, tablet, telemóvel), HTML semântico, navegação por teclado, alt text, contraste verificado.
- Meta tags próprias por página (title, description, Open Graph, Twitter), URLs amigáveis, robots.txt e sitemap.
- Lazy loading de imagens e imagens optimizadas.
- Textos em tom institucional, coerentes com os Estatutos.

## Detalhes técnicos

- TanStack Start + React + Tailwind (stack do projecto). Rotas: `/`, `/sobre`, `/associados`, `/noticias`, `/noticias/$slug`, `/contactos`.
- Conteúdo em módulos de dados tipados (`src/data/`: notícias, associados, órgãos sociais, indicadores, dados de mercado, textos institucionais) com o mesmo formato que a futura API devolverá — assim a Fase 2 só troca a origem dos dados.
- Camada de acesso a dados isolada (`src/lib/content.ts`) para facilitar a substituição por chamadas ao backend.
- Gráficos com Recharts.
- Formulário de contacto sem envio real nesta fase (validação + estado de sucesso); a submissão fica ligada na Fase 2.
- Estrutura de textos preparada para futura versão em inglês (chaves de conteúdo centralizadas).

## Fora do âmbito desta fase

Painel de administração, autenticação, base de dados MySQL e API própria — planeados para a Fase 2, quando definirmos como o site fala com a hospedagem em aidam.co.mz.
