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

/**
 * Conteúdo de produção. As notícias são geridas no painel de administração
 * (`/admin/noticias`) e servidas pela API. Não adicionar dados de exemplo aqui.
 */
export const noticias: Noticia[] = [];
