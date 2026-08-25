import { createFileRoute } from "@tanstack/react-router";
import { Crud, type Campo } from "@/components/admin/Crud";
import type { MembroCms } from "@/lib/cms";

export const Route = createFileRoute("/admin/orgaos")({
  component: AdminOrgaos,
});

const campos: Campo<MembroCms>[] = [
  {
    nome: "orgao",
    rotulo: "Órgão",
    tipo: "seleccao",
    opcoes: ["Assembleia Geral", "Direcção", "Conselho Fiscal"],
    largura: "meia",
  },
  { nome: "cargo", rotulo: "Cargo", largura: "meia", obrigatorio: true },
  { nome: "nome", rotulo: "Nome", largura: "meia", obrigatorio: true },
  { nome: "empresa", rotulo: "Empresa", largura: "meia" },
  { nome: "linkedin", rotulo: "LinkedIn (URL)" },
  { nome: "ordem", rotulo: "Ordem", tipo: "numero", largura: "meia" },
];

function AdminOrgaos() {
  return (
    <Crud
      recurso="orgaos"
      titulo="Órgãos Sociais"
      descricao="Membros da Assembleia Geral, Direcção e Conselho Fiscal."
      rotuloNovo="Novo membro"
      campos={campos}
      colunas={["orgao", "cargo", "nome", "empresa"]}
      vazio={{ orgao: "Direcção", cargo: "", nome: "", empresa: "", linkedin: "", ordem: 1 }}
    />
  );
}
