export type CategoriaAssociado = "ligeiros" | "agricolas" | "industrial";

export type Associado = {
  id: string;
  nome: string;
  marcas: string[];
  categorias: CategoriaAssociado[];
  website: string;
  descricao: string;
  logotipo?: string;
};

export const categoriasAssociado: { id: CategoriaAssociado; nome: string }[] = [
  { id: "ligeiros", nome: "Viaturas ligeiras" },
  { id: "agricolas", nome: "Máquinas agrícolas" },
  { id: "industrial", nome: "Equipamento industrial" },
];

export const associados: Associado[] = [
  {
    id: "caetano",
    nome: "Caetano Moçambique",
    marcas: ["Toyota", "Hino"],
    categorias: ["ligeiros", "industrial"],
    website: "https://www.gruposalvadorcaetano.pt",
    descricao: "Importação e distribuição de viaturas ligeiras e pesadas, com rede de assistência pós-venda.",
  },
  {
    id: "entreposto",
    nome: "Entreposto Moçambique",
    marcas: ["Mitsubishi", "Fuso"],
    categorias: ["ligeiros", "industrial"],
    website: "https://www.entreposto.co.mz",
    descricao: "Distribuição automóvel e equipamento, com presença histórica no mercado moçambicano.",
  },
  {
    id: "cfao",
    nome: "CFAO Motors Moçambique",
    marcas: ["Toyota", "Suzuki", "Yamaha"],
    categorias: ["ligeiros", "agricolas"],
    website: "https://www.cfaogroup.com",
    descricao: "Rede de distribuição multimarca com soluções de mobilidade para empresas e particulares.",
  },
  {
    id: "motorcare",
    nome: "Motorcare Moçambique",
    marcas: ["Nissan", "Renault"],
    categorias: ["ligeiros"],
    website: "https://www.motorcare.co.mz",
    descricao: "Concessionário de viaturas ligeiras e comerciais, com oficinas e peças originais.",
  },
  {
    id: "ronil",
    nome: "Ronil",
    marcas: ["Ford", "Mazda"],
    categorias: ["ligeiros"],
    website: "https://www.ronil.co.mz",
    descricao: "Comercialização de viaturas novas, frotas empresariais e serviços pós-venda.",
  },
  {
    id: "tecnica-industrial",
    nome: "Técnica Industrial",
    marcas: ["John Deere", "Case"],
    categorias: ["agricolas", "industrial"],
    website: "https://www.tecnicaindustrial.co.mz",
    descricao: "Máquinas agrícolas, equipamento industrial e assistência técnica especializada.",
  },
  {
    id: "interauto",
    nome: "Interauto",
    marcas: ["Volkswagen", "Audi"],
    categorias: ["ligeiros"],
    website: "https://www.interauto.co.mz",
    descricao: "Representação de marcas premium e serviços integrados de manutenção.",
  },
  {
    id: "intercar",
    nome: "Intercar",
    marcas: ["Hyundai", "Kia"],
    categorias: ["ligeiros"],
    website: "https://www.intercar.co.mz",
    descricao: "Distribuição de viaturas ligeiras e comerciais em todo o território nacional.",
  },
];
