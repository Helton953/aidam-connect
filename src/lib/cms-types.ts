/**
 * Tipos partilhados entre o painel de administração e a API (MySQL).
 * Os nomes dos campos correspondem às colunas das tabelas em `backend/schema.sql`.
 */

export type NoticiaCms = {
  id: string;
  slug: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  categoria: "Associação" | "Mercado" | "Sector" | "Eventos";
  resumo: string;
  imagem: string;
  imagemAlt: string;
  corpo: string; // parágrafos separados por linha em branco
  publicada: boolean;
};

export type AssociadoCms = {
  id: string;
  nome: string;
  marcas: string; // separadas por vírgula
  categorias: string; // ids separados por vírgula: ligeiros,agricolas,industrial
  website: string;
  descricao: string;
  logotipo: string;
  ordem: number;
};

export type MembroCms = {
  id: string;
  orgao: string; // Assembleia Geral | Direcção | Conselho Fiscal
  cargo: string;
  nome: string;
  empresa: string;
  linkedin: string;
  ordem: number;
};

export type InstitucionalCms = {
  id: string;
  chave: string;
  rotulo: string;
  valor: string;
};

export type MensagemCms = {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  assunto: string;
  mensagem: string;
  criadaEm: string; // ISO
  lida: boolean;
};

export type UtilizadorCms = {
  id: string;
  nome: string;
  email: string;
};

export type RecursoCms = "noticias" | "associados" | "orgaos" | "institucional" | "mensagens";

export type RegistoPorRecurso = {
  noticias: NoticiaCms;
  associados: AssociadoCms;
  orgaos: MembroCms;
  institucional: InstitucionalCms;
  mensagens: MensagemCms;
};
