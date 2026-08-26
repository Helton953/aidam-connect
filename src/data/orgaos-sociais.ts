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

/** Geridos no painel de administração (`/admin/orgaos`). Sem dados de exemplo. */
export const orgaosSociais: OrgaoSocial[] = [];
