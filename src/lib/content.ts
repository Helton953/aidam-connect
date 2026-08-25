/**
 * Camada de acesso a conteúdo.
 *
 * Nesta fase os dados vivem em módulos tipados em `src/data/`. Na fase 2
 * (painel de administração + base de dados) basta substituir a implementação
 * destas funções por chamadas ao backend, mantendo as mesmas assinaturas.
 */
import { noticias, type Noticia } from "@/data/noticias";
import { associados, categoriasAssociado, type Associado } from "@/data/associados";
import { orgaosSociais } from "@/data/orgaos-sociais";
import * as institucional from "@/data/institucional";
import * as mercado from "@/data/mercado";

export function getNoticias(): Noticia[] {
  return [...noticias].sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function getUltimasNoticias(limite = 3): Noticia[] {
  return getNoticias().slice(0, limite);
}

export function getNoticia(slug: string): Noticia | undefined {
  return noticias.find((n) => n.slug === slug);
}

export function getAssociados(): Associado[] {
  return associados;
}

export function getCategoriasAssociado() {
  return categoriasAssociado;
}

export function getOrgaosSociais() {
  return orgaosSociais;
}

export function getInstitucional() {
  return institucional;
}

export function getMercado() {
  return mercado;
}

export function formatarData(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
