import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Printer, Mail, Send, CheckCircle2 } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { organizacao } from "@/data/institucional";
import { enviarMensagem } from "@/lib/cms";
import heroContactos from "@/assets/hero-contactos.jpg";

export const Route = createFileRoute("/contactos")({
  component: ContactosPage,
  head: () => ({
    meta: [
      { title: "Contactos — AIDAM" },
      {
        name: "description",
        content:
          "Contacte a AIDAM: Avenida do Trabalho, 1856, CP 1153 — Maputo. Telefone 21 225 400, fax 21 400 954.",
      },
      { property: "og:title", content: "Contactos — AIDAM" },
      { property: "og:description", content: "Fale com a Associação de Importadores e Distribuidores de Automóveis de Moçambique." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contactos" },
    ],
    links: [{ rel: "canonical", href: "/contactos" }],
  }),
});

const esquema = z.object({
  nome: z.string().trim().min(2, "Indique o seu nome.").max(100, "Máximo de 100 caracteres."),
  empresa: z.string().trim().max(120, "Máximo de 120 caracteres.").optional().or(z.literal("")),
  email: z.string().trim().email("Indique um e-mail válido.").max(255, "Máximo de 255 caracteres."),
  assunto: z.string().trim().min(3, "Indique o assunto.").max(150, "Máximo de 150 caracteres."),
  mensagem: z.string().trim().min(10, "A mensagem deve ter pelo menos 10 caracteres.").max(2000, "Máximo de 2000 caracteres."),
});

type Campos = keyof z.infer<typeof esquema>;

function ContactosPage() {
  const [erros, setErros] = useState<Partial<Record<Campos, string>>>({});
  const [enviado, setEnviado] = useState(false);

  const [aEnviar, setAEnviar] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = Object.fromEntries(new FormData(form));

    // Honeypot anti-spam
    if (typeof dados["website"] === "string" && dados["website"].length > 0) return;

    const resultado = esquema.safeParse(dados);
    if (!resultado.success) {
      const novos: Partial<Record<Campos, string>> = {};
      resultado.error.issues.forEach((issue) => {
        const campo = issue.path[0] as Campos;
        if (!novos[campo]) novos[campo] = issue.message;
      });
      setErros(novos);
      return;
    }

    setErros({});
    setErroEnvio("");
    setAEnviar(true);
    try {
      await enviarMensagem({
        nome: resultado.data.nome,
        empresa: resultado.data.empresa ?? "",
        email: resultado.data.email,
        assunto: resultado.data.assunto,
        mensagem: resultado.data.mensagem,
      });
      setEnviado(true);
      form.reset();
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
    } finally {
      setAEnviar(false);
    }
  }


  return (
    <>
      <PageHero
        eyebrow="Contactos"
        titulo="Fale com a AIDAM"
        descricao="Para pedidos de informação, adesão à Associação ou contactos institucionais e de imprensa."
        imagem={heroContactos}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl">Formulário de contacto</h2>
              <p className="mt-2 text-sm font-light text-graphite">
                Responderemos com a maior brevidade possível.
              </p>

              {enviado ? (
                <div className="mt-8 flex items-start gap-3 rounded-lg border border-primary/30 bg-surface p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Mensagem validada com sucesso.</p>
                    <p className="mt-1 text-sm font-light text-graphite">
                      O envio será activado com a ligação ao painel de administração.
                    </p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo id="nome" label="Nome" erro={erros.nome} required />
                  <Campo id="empresa" label="Empresa" erro={erros.empresa} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo id="email" label="E-mail" type="email" erro={erros.email} required />
                  <Campo id="assunto" label="Assunto" erro={erros.assunto} required />
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-semibold text-ink">
                    Mensagem <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    rows={6}
                    required
                    aria-invalid={Boolean(erros.mensagem)}
                    aria-describedby={erros.mensagem ? "erro-mensagem" : undefined}
                    className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {erros.mensagem ? (
                    <p id="erro-mensagem" className="mt-1.5 text-xs font-semibold text-primary">
                      {erros.mensagem}
                    </p>
                  ) : null}
                </div>

                {/* Honeypot — invisível para utilizadores */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Não preencher</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {erroEnvio ? (
                  <p role="alert" className="text-sm font-semibold text-primary">
                    {erroEnvio}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={aEnviar}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-lg hover:brightness-95 disabled:opacity-60"
                >
                  {aEnviar ? "A enviar…" : "Enviar mensagem"}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>

              </form>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-8">
              <div className="rounded-xl border border-border bg-card p-8">
                <h2 className="text-xl">Sede da Associação</h2>
                <ul className="mt-5 space-y-4 text-sm text-graphite">
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{organizacao.morada}</span>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <a href="tel:+25821225400" className="transition-colors hover:text-primary">
                      {organizacao.telefone}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Printer className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Fax: {organizacao.fax}</span>
                  </li>
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <a href={`mailto:${organizacao.email}`} className="transition-colors hover:text-primary">
                      {organizacao.email}
                    </a>
                  </li>
                </ul>
                <div className="mt-6 flex gap-4 text-sm font-semibold text-graphite">
                  {organizacao.redes.map((rede) => (
                    <a
                      key={rede.nome}
                      href={rede.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-primary"
                    >
                      {rede.nome}
                    </a>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title="Mapa da sede da AIDAM em Maputo"
                  src={organizacao.mapa}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-80 w-full border-0"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function Campo({
  id,
  label,
  type = "text",
  erro,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  erro?: string | undefined;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `erro-${id}` : undefined}
        className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {erro ? (
        <p id={`erro-${id}`} className="mt-1.5 text-xs font-semibold text-primary">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
