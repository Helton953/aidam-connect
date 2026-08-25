export type Noticia = {
  slug: string;
  titulo: string;
  data: string; // ISO
  categoria: "Associação" | "Mercado" | "Sector" | "Eventos";
  resumo: string;
  imagem: string;
  imagemAlt: string;
  corpo: string[];
  destaqueMercado?: boolean;
};

import imgMercado from "@/assets/noticia-mercado.jpg";
import imgFrota from "@/assets/noticia-frota.jpg";
import imgAgricola from "@/assets/noticia-agricola.jpg";
import imgInstitucional from "@/assets/noticia-institucional.jpg";

export const noticias: Noticia[] = [
  {
    slug: "aidam-inicia-nova-etapa-de-dinamizacao-institucional",
    titulo: "AIDAM inicia nova etapa de dinamização institucional",
    data: "2026-07-14",
    categoria: "Associação",
    resumo:
      "A Associação lança um novo ciclo de actividade, com reforço da representatividade do sector e um plano de acção centrado no diálogo público-privado.",
    imagem: imgInstitucional,
    imagemAlt: "Reunião institucional entre representantes do sector automóvel",
    corpo: [
      "A AIDAM deu início a uma nova etapa da sua actividade institucional, orientada para o reforço da representatividade das empresas do sector da importação, distribuição e assistência pós-venda de veículos, máquinas agrícolas e equipamento industrial em Moçambique.",
      "O plano de acção aprovado pela Direcção assenta em quatro eixos: representação junto das entidades públicas, produção de informação estatística fiável, formação técnica dos quadros das empresas associadas e promoção da concorrência leal no mercado.",
      "Nos próximos meses, a Associação irá constituir grupos de trabalho temáticos e estabelecer uma mesa permanente de diálogo com o Governo sobre matérias fiscais, aduaneiras e de homologação técnica de veículos.",
    ],
  },
  {
    slug: "mercado-automovel-nacional-cresce-em-2025",
    titulo: "Mercado automóvel nacional regista crescimento em 2025",
    data: "2026-06-02",
    categoria: "Mercado",
    resumo:
      "O Total Industry Volume do mercado formal atingiu novo máximo, impulsionado pelos segmentos pick-up e SUV e pela renovação de frotas empresariais.",
    imagem: imgMercado,
    imagemAlt: "Parque de viaturas novas alinhadas num concessionário",
    destaqueMercado: true,
    corpo: [
      "O mercado formal de veículos novos em Moçambique manteve, em 2025, a trajectória de crescimento observada nos últimos exercícios, com o Total Industry Volume a fixar-se acima dos valores registados no ano anterior.",
      "O desempenho foi sustentado sobretudo pelos segmentos pick-up e SUV, que continuam a representar a maior fatia das vendas, e pela renovação de frotas por parte de empresas dos sectores extractivo, agrícola e de serviços.",
      "A AIDAM sublinha a importância de consolidar a recolha de dados junto dos associados, de modo a produzir séries estatísticas comparáveis e úteis para a formulação de políticas públicas e para o planeamento das empresas.",
    ],
  },
  {
    slug: "formalizacao-do-mercado-em-destaque-no-dialogo-com-o-governo",
    titulo: "Formalização do mercado em destaque no diálogo com o Governo",
    data: "2026-04-23",
    categoria: "Sector",
    resumo:
      "A AIDAM defende medidas que reduzam a informalidade na importação e na assistência técnica, garantindo segurança para o consumidor e receita para o Estado.",
    imagem: imgFrota,
    imagemAlt: "Camiões e viaturas comerciais num terminal logístico",
    corpo: [
      "A informalidade na importação de veículos e na prestação de serviços de assistência técnica continua a ser um dos principais desafios do sector, com impacto directo na segurança rodoviária, na protecção do consumidor e na receita fiscal do Estado.",
      "A Associação tem vindo a propor um conjunto de medidas que inclui o reforço dos requisitos técnicos na importação, a rastreabilidade das peças e a valorização das redes oficiais de pós-venda.",
      "A AIDAM reafirma a disponibilidade para colaborar com as autoridades competentes na definição de um quadro regulamentar equilibrado, que promova a concorrência leal sem penalizar o acesso à mobilidade.",
    ],
  },
  {
    slug: "maquinaria-agricola-acompanha-expansao-do-agronegocio",
    titulo: "Maquinaria agrícola acompanha a expansão do agronegócio",
    data: "2026-02-18",
    categoria: "Sector",
    resumo:
      "O segmento de máquinas agrícolas reforça a sua importância no mercado nacional, acompanhando os investimentos em mecanização e produtividade agrícola.",
    imagem: imgAgricola,
    imagemAlt: "Tractor agrícola em operação num campo cultivado",
    corpo: [
      "O crescimento do agronegócio em Moçambique tem impulsionado a procura por maquinaria agrícola, equipamento de rega e soluções de mecanização adaptadas às condições locais.",
      "As empresas associadas da AIDAM têm vindo a alargar as suas redes de assistência técnica às zonas de maior produção agrícola, garantindo disponibilidade de peças e formação de operadores.",
      "A Associação considera este segmento estratégico para o desenvolvimento rural e defende condições de financiamento adequadas à aquisição de equipamento por parte de pequenos e médios produtores.",
    ],
  },
  {
    slug: "encontro-anual-do-sector-automovel-marcado-para-novembro",
    titulo: "Encontro anual do sector automóvel marcado para Novembro",
    data: "2025-11-05",
    categoria: "Eventos",
    resumo:
      "O encontro reunirá associados, autoridades e parceiros para debater fiscalidade, mobilidade sustentável e dados de mercado.",
    imagem: imgInstitucional,
    imagemAlt: "Auditório preparado para conferência do sector automóvel",
    corpo: [
      "O encontro anual promovido pela AIDAM juntará representantes das empresas associadas, entidades públicas, parceiros financeiros e especialistas do sector.",
      "A agenda inclui painéis sobre fiscalidade e política aduaneira, introdução de veículos eléctricos e híbridos no mercado nacional e apresentação dos indicadores anuais do mercado automóvel.",
      "As inscrições serão divulgadas oportunamente através dos canais oficiais da Associação.",
    ],
  },
  {
    slug: "seguranca-rodoviaria-e-qualidade-do-pos-venda",
    titulo: "Segurança rodoviária e qualidade do pós-venda em foco",
    data: "2025-09-12",
    categoria: "Associação",
    resumo:
      "A AIDAM promove boas práticas nas redes oficiais de assistência técnica e apoia campanhas de sensibilização para a segurança rodoviária.",
    imagem: imgFrota,
    imagemAlt: "Técnico a realizar manutenção numa oficina automóvel",
    corpo: [
      "A qualidade do serviço pós-venda é um factor determinante para a segurança dos veículos em circulação e para a confiança do consumidor no mercado formal.",
      "A AIDAM tem promovido junto dos associados a adopção de padrões técnicos comuns, a utilização de peças originais e a formação contínua das equipas oficinais.",
      "A Associação apoia igualmente iniciativas de sensibilização para a segurança rodoviária, em articulação com as autoridades e com organizações da sociedade civil.",
    ],
  },
];
