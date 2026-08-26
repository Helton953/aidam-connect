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

/** Geridos no painel de administração (`/admin/associados`). Sem dados de exemplo. */
export const associados: Associado[] = [];
