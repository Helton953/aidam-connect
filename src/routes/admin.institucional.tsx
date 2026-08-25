import { createFileRoute } from "@tanstack/react-router";
import { Crud, type Campo } from "@/components/admin/Crud";
import type { InstitucionalCms } from "@/lib/cms";

export const Route = createFileRoute("/admin/institucional")({
  component: AdminInstitucional,
});

const campos: Campo<InstitucionalCms>[] = [
  { nome: "rotulo", rotulo: "Designação", obrigatorio: true, largura: "meia" },
  { nome: "chave", rotulo: "Chave", ajuda: "Identificador usado pelo site. Ex.: missao", largura: "meia", obrigatorio: true },
  { nome: "valor", rotulo: "Conteúdo", tipo: "area", obrigatorio: true },
];

function AdminInstitucional() {
  return (
    <Crud
      recurso="institucional"
      titulo="Conteúdo institucional"
      descricao="Textos e dados de contacto apresentados nas páginas Home, Sobre Nós e Contactos."
      rotuloNovo="Novo conteúdo"
      campos={campos}
      colunas={["rotulo", "chave", "valor"]}
      vazio={{ chave: "", rotulo: "", valor: "" }}
    />
  );
}
