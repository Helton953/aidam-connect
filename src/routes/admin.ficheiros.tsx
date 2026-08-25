import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { carregarFicheiro, listarFicheiros, removerFicheiro } from "@/lib/cms";

export const Route = createFileRoute("/admin/ficheiros")({
  component: AdminFicheiros,
});

function tamanhoLegivel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AdminFicheiros() {
  const queryClient = useQueryClient();
  const entrada = useRef<HTMLInputElement>(null);
  const [sobre, setSobre] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["cms", "ficheiros"], queryFn: listarFicheiros });

  const enviar = useMutation({
    mutationFn: async (ficheiros: File[]) => {
      for (const f of ficheiros) await carregarFicheiro(f);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "ficheiros"] });
      toast.success("Ficheiros carregados.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: (id: string) => removerFicheiro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "ficheiros"] });
      toast.success("Ficheiro eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Biblioteca de ficheiros</h1>
      <p className="mt-1 text-sm font-light text-graphite">
        Imagens e documentos carregados a partir do seu dispositivo, reutilizáveis em qualquer conteúdo.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSobre(true);
        }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSobre(false);
          enviar.mutate(Array.from(e.dataTransfer.files));
        }}
        className={`mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center transition-colors ${
          sobre ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
      >
        <UploadCloud className="h-7 w-7 text-primary" aria-hidden />
        <p className="text-sm font-light text-graphite">Arraste ficheiros para aqui ou seleccione-os no dispositivo.</p>
        <input
          ref={entrada}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(e) => enviar.mutate(Array.from(e.target.files ?? []))}
        />
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={enviar.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
        >
          {enviar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Escolher ficheiros
        </button>
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : lista.length === 0 ? (
        <p className="mt-10 text-sm font-light text-graphite">Ainda não existem ficheiros carregados.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {lista.map((f) => (
            <li key={f.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="flex h-36 items-center justify-center bg-surface">
                {f.tipo.startsWith("image/") ? (
                  <img src={f.url} alt={f.nomeOriginal} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-xs font-semibold text-graphite">{f.tipo}</span>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-semibold text-foreground" title={f.nomeOriginal}>
                  {f.nomeOriginal}
                </p>
                <p className="mt-1 text-xs font-light text-graphite">{tamanhoLegivel(f.tamanho)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(f.url);
                      toast.success("Endereço copiado.");
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-graphite hover:bg-surface"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Eliminar este ficheiro?")) apagar.mutate(f.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-graphite hover:bg-surface hover:text-primary"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
