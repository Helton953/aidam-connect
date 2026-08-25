import { createFileRoute } from "@tanstack/react-router";
import { Crud, type Campo } from "@/components/admin/Crud";
import type { AssociadoCms } from "@/lib/cms";

export const Route = createFileRoute("/admin/associados")({
  component: AdminAssociados,
});

const campos: Campo<AssociadoCms>[] = [
  { nome: "nome", rotulo: "Empresa", obrigatorio: true },
  { nome: "marcas", rotulo: "Marcas", ajuda: "Separadas por vírgula. Ex.: Toyota, Hino" },
  {
    nome: "categorias",
    rotulo: "Categorias",
    ajuda: "Separadas por vírgula, entre: ligeiros, agricolas, industrial",
  },
  { nome: "website", rotulo: "Website", largura: "meia" },
  { nome: "logotipo", rotulo: "Logótipo (URL)", largura: "meia" },
  { nome: "descricao", rotulo: "Descrição", tipo: "area" },
  { nome: "ordem", rotulo: "Ordem", tipo: "numero", largura: "meia" },
];

function AdminAssociados() {
  return (
    <Crud
      recurso="associados"
      titulo="Associados"
      descricao="Empresas associadas apresentadas na página de Portfólio."
      rotuloNovo="Novo associado"
      campos={campos}
      colunas={["nome", "marcas", "categorias", "ordem"]}
      vazio={{
        nome: "",
        marcas: "",
        categorias: "ligeiros",
        website: "",
        descricao: "",
        logotipo: "",
        ordem: 99,
      }}
    />
  );
}
