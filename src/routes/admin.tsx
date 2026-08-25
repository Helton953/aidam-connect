import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Newspaper,
  Building2,
  Users,
  FileText,
  Mail,
  LogOut,
  Loader2,
  Images,
  Settings,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/site/Logo";
import { entrar, estadoServico, modoLocal, sair, sessaoActual } from "@/lib/cms";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Painel de administração — AIDAM" },
      { name: "description", content: "Gestão de conteúdos do website institucional da AIDAM." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const seccoes = [
  {
    titulo: "Geral",
    itens: [{ to: "/admin", label: "Resumo", icon: LayoutDashboard, exact: true }],
  },
  {
    titulo: "Conteúdos",
    itens: [
      { to: "/admin/noticias", label: "Notícias", icon: Newspaper },
      { to: "/admin/associados", label: "Associados", icon: Building2 },
      { to: "/admin/orgaos", label: "Órgãos Sociais", icon: Users },
      { to: "/admin/institucional", label: "Institucional", icon: FileText },
      { to: "/admin/ficheiros", label: "Ficheiros", icon: Images },
    ],
  },
  {
    titulo: "Comunicação",
    itens: [{ to: "/admin/mensagens", label: "Mensagens", icon: Mail }],
  },
  {
    titulo: "Plataforma",
    itens: [
      { to: "/admin/definicoes", label: "Definições", icon: Settings },
      { to: "/admin/utilizadores", label: "Administradores", icon: ShieldCheck },
      { to: "/admin/sistema", label: "Estado do sistema", icon: Activity },
    ],
  },
] as const;

function AdminLayout() {
  const queryClient = useQueryClient();
  const { data: utilizador, isLoading } = useQuery({ queryKey: ["cms", "sessao"], queryFn: sessaoActual });
  const saude = useQuery({
    queryKey: ["cms", "saude"],
    queryFn: estadoServico,
    enabled: !modoLocal && Boolean(utilizador),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!utilizador) return <Login />;

  const online = saude.data?.ok && saude.data.baseDados?.ok;

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <aside className="flex flex-col border-b border-border bg-card lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="p-6">
          <Logo size="sm" showTagline={false} />
        </div>
        <nav aria-label="Navegação do painel" className="flex-1 space-y-5 px-3 pb-4">
          {seccoes.map((seccao) => (
            <div key={seccao.titulo}>
              <p className="px-3 pb-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-mid-grey">
                {seccao.titulo}
              </p>
              <div className="flex flex-wrap gap-1 lg:flex-col">
                {seccao.itens.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: "exact" in item ? item.exact : false }}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-graphite transition-colors hover:bg-surface hover:text-primary"
                    activeProps={{ className: "bg-surface text-primary" }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            to="/admin/sistema"
            className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-graphite hover:text-primary"
          >
            <span
              className={`h-2 w-2 rounded-full ${modoLocal ? "bg-mid-grey" : online ? "bg-primary" : "bg-mid-grey"}`}
              aria-hidden
            />
            {modoLocal ? "Modo demonstração" : online ? "Serviço operacional" : "Serviço indisponível"}
          </Link>
          <p className="truncate text-xs font-light text-graphite">{utilizador.email}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to="/" className="text-xs font-semibold text-graphite hover:text-primary">
              Ver site
            </Link>
            <button
              type="button"
              onClick={async () => {
                await sair();
                queryClient.setQueryData(["cms", "sessao"], null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-graphite hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Terminar sessão
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        {modoLocal ? (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-graphite">
            Modo de demonstração: os dados são guardados apenas neste navegador. Defina a variável{" "}
            <code className="font-mono text-xs">VITE_API_URL</code> para ligar à API MySQL em aidam.co.mz.
          </div>
        ) : null}
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}


function Login() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [palavraPasse, setPalavraPasse] = useState("");
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    document.title = "Iniciar sessão — AIDAM";
  }, []);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAGuardar(true);
    try {
      const utilizador = await entrar(email, palavraPasse);
      queryClient.setQueryData(["cms", "sessao"], utilizador);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível iniciar sessão.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <Logo size="sm" showTagline={false} />
        <h1 className="mt-8 text-2xl font-bold text-foreground">Painel de administração</h1>
        <p className="mt-2 text-sm font-light text-graphite">Área reservada à gestão de conteúdos do website.</p>

        <form className="mt-6 space-y-4" onSubmit={submeter}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-foreground">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="palavra-passe" className="mb-1.5 block text-sm font-semibold text-foreground">
              Palavra-passe
            </label>
            <input
              id="palavra-passe"
              type="password"
              required
              autoComplete="current-password"
              value={palavraPasse}
              onChange={(e) => setPalavraPasse(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {erro ? <p className="text-sm font-semibold text-primary">{erro}</p> : null}

          <button
            type="submit"
            disabled={aGuardar}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
          >
            {aGuardar ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Entrar
          </button>
        </form>

        {modoLocal ? (
          <p className="mt-6 rounded-md bg-surface px-3 py-2 text-xs font-light text-graphite">
            Demonstração: <strong>admin@aidam.co.mz</strong> / <strong>aidam2026</strong>
          </p>
        ) : null}
      </div>
    </div>
  );
}
