export type Membro = {
  cargo: string;
  nome: string;
  empresa: string;
  linkedin?: string;
};

export type OrgaoSocial = {
  id: string;
  nome: string;
  descricao: string;
  membros: Membro[];
};

export const orgaosSociais: OrgaoSocial[] = [
  {
    id: "assembleia-geral",
    nome: "Assembleia Geral",
    descricao: "Órgão máximo da Associação, composto por todos os associados no pleno gozo dos seus direitos.",
    membros: [
      { cargo: "Presidente da Mesa", nome: "A designar", empresa: "Entreposto Moçambique", linkedin: "https://www.linkedin.com/" },
      { cargo: "Vice-Presidente da Mesa", nome: "A designar", empresa: "Intercar" },
      { cargo: "Secretário", nome: "A designar", empresa: "Ronil" },
    ],
  },
  {
    id: "direccao",
    nome: "Direcção",
    descricao: "Órgão executivo responsável pela gestão corrente e pela representação institucional da AIDAM.",
    membros: [
      { cargo: "Presidente", nome: "A designar", empresa: "Caetano Moçambique", linkedin: "https://www.linkedin.com/" },
      { cargo: "Vice-Presidente", nome: "A designar", empresa: "CFAO Motors Moçambique", linkedin: "https://www.linkedin.com/" },
      { cargo: "Tesoureiro", nome: "A designar", empresa: "Motorcare Moçambique" },
      { cargo: "Vogal", nome: "A designar", empresa: "Técnica Industrial" },
      { cargo: "Vogal", nome: "A designar", empresa: "Interauto" },
    ],
  },
  {
    id: "conselho-fiscal",
    nome: "Conselho Fiscal",
    descricao: "Órgão de fiscalização das contas e da legalidade dos actos de gestão da Associação.",
    membros: [
      { cargo: "Presidente", nome: "A designar", empresa: "Ronil" },
      { cargo: "Relator", nome: "A designar", empresa: "Intercar" },
      { cargo: "Vogal", nome: "A designar", empresa: "Entreposto Moçambique" },
    ],
  },
];
