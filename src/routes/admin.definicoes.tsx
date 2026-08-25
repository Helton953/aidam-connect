import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MailCheck, Save, ServerCog } from "lucide-react";
import { toast } from "sonner";
import {
  enviarEmailTeste,
  gravarDefinicoes,
  lerDefinicoes,
  verificarSmtp,
  type DefinicoesCms,
} from "@/lib/cms";

export const Route = createFileRoute("/admin/definicoes")({
  component: AdminDefinicoes,
});

type Campo = {
  chave: string;
  rotulo: string;
  tipo?: "texto" | "area" | "password" | "seleccao" | "numero";
  opcoes?: string[];
  ajuda?: string;
  meia?: boolean;
};

const grupos: { titulo: string; descricao: string; campos: Campo[] }[] = [
  {
    titulo: "Servidor de email (SMTP)",
    descricao:
      "Usado para enviar as mensagens recebidas no formulário de contacto. Estes valores substituem os definidos no ficheiro .env do servidor.",
    campos: [
      { chave: "smtp_host", rotulo: "Servidor SMTP", ajuda: "Ex.: mail.aidam.co.mz", meia: true },
      { chave: "smtp_port", rotulo: "Porta", tipo: "numero", meia: true },
      {
        chave: "smtp_secure",
        rotulo: "Ligação segura (SSL/TLS)",
        tipo: "seleccao",
        opcoes: ["true", "false"],
        meia: true,
      },
      { chave: "smtp_user", rotulo: "Utilizador", meia: true },
      { chave: "smtp_pass", rotulo: "Palavra-passe", tipo: "password", meia: true },
      { chave: "email_remetente", rotulo: "Remetente", ajuda: 'Ex.: "Website AIDAM <geral@aidam.co.mz>"', meia: true },
      { chave: "email_destino", rotulo: "Receber mensagens em", meia: true },
    ],
  },
  {
    titulo: "Contactos institucionais",
    descricao: "Dados apresentados no rodapé e na página de Contactos.",
    campos: [
      { chave: "morada", rotulo: "Morada", tipo: "area" },
      { chave: "telefone", rotulo: "Telefone", meia: true },
      { chave: "fax", rotulo: "Fax", meia: true },
      { chave: "email", rotulo: "E-mail geral", meia: true },
      { chave: "mapa_embed", rotulo: "URL do mapa (Google Maps embed)", ajuda: "Endereço src do iframe do Google Maps." },
    ],
  },
  {
    titulo: "Redes sociais",
    descricao: "Ligações apresentadas no rodapé do website.",
    campos: [
      { chave: "facebook", rotulo: "Facebook", meia: true },
      { chave: "linkedin", rotulo: "LinkedIn", meia: true },
      { chave: "instagram", rotulo: "Instagram", meia: true },
    ],
  },
  {
    titulo: "Plataforma",
    descricao: "Opções gerais do website.",
    campos: [
      { chave: "posicionamento", rotulo: "Frase de posicionamento" },
      { chave: "google_analytics", rotulo: "ID do Google Analytics", ajuda: "Ex.: G-XXXXXXX", meia: true },
      {
        chave: "manutencao",
        rotulo: "Modo de manutenção",
        tipo: "seleccao",
        opcoes: ["false", "true"],
        meia: true,
      },
    ],
  },
];

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";

function AdminDefinicoes() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["cms", "definicoes"], queryFn: lerDefinicoes });
  const [valores, setValores] = useState<DefinicoesCms>({});

  useEffect(() => {
    if (data) setValores(data);
  }, [data]);

  const guardar = useMutation({
    mutationFn: (v: DefinicoesCms) => gravarDefinicoes(v),
    onSuccess: (novos) => {
      setValores(novos);
      queryClient.invalidateQueries({ queryKey: ["cms", "definicoes"] });
      toast.success("Definições guardadas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testar = useMutation({
    mutationFn: async () => {
      const verificacao = await verificarSmtp();
      if (!verificacao.ok) {
        throw new Error(
          verificacao.configurado ? (verificacao.erro ?? "Ligação SMTP falhou.") : "SMTP ainda não configurado.",
        );
      }
      const envio = await enviarEmailTeste();
      if (!envio.ok) throw new Error(envio.erro ?? "Não foi possível enviar o email de teste.");
    },
    onSuccess: () => toast.success("Email de teste enviado com sucesso."),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Definições</h1>
          <p className="mt-1 text-sm font-light text-graphite">
            Configuração do envio de email, contactos e opções gerais da plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => testar.mutate()}
            disabled={testar.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:bg-surface disabled:opacity-60"
          >
            {testar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
            Testar SMTP
          </button>
          <button
            type="submit"
            form="form-definicoes"
            disabled={guardar.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
          >
            {guardar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      <form
        id="form-definicoes"
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          guardar.mutate(valores);
        }}
      >
        {grupos.map((grupo) => (
          <section
            key={grupo.titulo}
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ServerCog className="h-4 w-4 text-primary" aria-hidden />
              {grupo.titulo}
            </h2>
            <p className="mt-1 text-sm font-light text-graphite">{grupo.descricao}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {grupo.campos.map((campo) => {
                const id = `def-${campo.chave}`;
                const valor = valores[campo.chave] ?? "";
                const definir = (v: string) => setValores((p) => ({ ...p, [campo.chave]: v }));
                return (
                  <div key={campo.chave} className={campo.meia ? "sm:col-span-1" : "sm:col-span-2"}>
                    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
                      {campo.rotulo}
                    </label>
                    {campo.tipo === "area" ? (
                      <textarea id={id} rows={3} value={valor} onChange={(e) => definir(e.target.value)} className={inputCls} />
                    ) : campo.tipo === "seleccao" ? (
                      <select id={id} value={valor} onChange={(e) => definir(e.target.value)} className={inputCls}>
                        {(campo.opcoes ?? []).map((o) => (
                          <option key={o} value={o}>
                            {o === "true" ? "Sim" : o === "false" ? "Não" : o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={id}
                        type={campo.tipo === "password" ? "password" : campo.tipo === "numero" ? "number" : "text"}
                        autoComplete={campo.tipo === "password" ? "new-password" : "off"}
                        value={valor}
                        onChange={(e) => definir(e.target.value)}
                        className={inputCls}
                      />
                    )}
                    {campo.ajuda ? <p className="mt-1 text-xs font-light text-graphite">{campo.ajuda}</p> : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </form>
    </div>
  );
}
