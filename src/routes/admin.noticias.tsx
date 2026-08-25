import { createFileRoute } from "@tanstack/react-router";
import { Crud, type Campo } from "@/components/admin/Crud";
import type { NoticiaCms } from "@/lib/cms";

export const Route = createFileRoute("/admin/noticias")({
  component: AdminNoticias,
});

const campos: Campo<NoticiaCms>[] = [
  { nome: "titulo", rotulo: "Título", obrigatorio: true },
  { nome: "slug", rotulo: "Slug (URL)", ajuda: "Ex.: mercado-automovel-cresce-em-2026", obrigatorio: true },
  { nome: "data", rotulo: "Data", tipo: "data", largura: "meia", obrigatorio: true },
  {
    nome: "categoria",
    rotulo: "Categoria",
    tipo: "seleccao",
    opcoes: ["Associação", "Mercado", "Sector", "Eventos"],
    largura: "meia",
  },
  { nome: "resumo", rotulo: "Resumo", tipo: "area", obrigatorio: true },
  { nome: "imagem", rotulo: "Imagem (URL)", ajuda: "Endereço da imagem de destaque." },
  { nome: "imagemAlt", rotulo: "Texto alternativo da imagem" },
  { nome: "corpo", rotulo: "Corpo do artigo", tipo: "area", ajuda: "Separe os parágrafos com uma linha em branco." },
  { nome: "publicada", rotulo: "Publicada", tipo: "booleano", largura: "meia" },
];

function AdminNoticias() {
  return (
    <Crud
      recurso="noticias"
      titulo="Notícias"
      descricao="Criação e edição dos artigos publicados na área de Notícias."
      rotuloNovo="Nova notícia"
      campos={campos}
      colunas={["titulo", "data", "categoria", "publicada"]}
      vazio={{
        slug: "",
        titulo: "",
        data: new Date().toISOString().slice(0, 10),
        categoria: "Associação",
        resumo: "",
        imagem: "",
        imagemAlt: "",
        corpo: "",
        publicada: false,
      }}
    />
  );
}
