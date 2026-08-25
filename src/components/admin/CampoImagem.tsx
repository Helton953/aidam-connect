import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { carregarFicheiro } from "@/lib/cms";

type Props = {
  id?: string;
  valor: string;
  onChange: (url: string) => void;
  ajuda?: string;
};

/**
 * Campo de imagem com carregamento a partir do dispositivo (arrastar/soltar
 * ou selecção de ficheiro). O URL resultante é guardado no registo.
 */
export function CampoImagem({ id, valor, onChange, ajuda }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [sobre, setSobre] = useState(false);

  async function enviar(ficheiro: File | undefined) {
    if (!ficheiro) return;
    if (!ficheiro.type.startsWith("image/")) {
      toast.error("Seleccione um ficheiro de imagem.");
      return;
    }
    setACarregar(true);
    try {
      const registo = await carregarFicheiro(ficheiro);
      onChange(registo.url);
      toast.success("Imagem carregada.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Falha ao carregar a imagem.");
    } finally {
      setACarregar(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
          {valor ? (
            <img src={valor} alt="Pré-visualização" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-graphite" aria-hidden />
          )}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setSobre(true);
          }}
          onDragLeave={() => setSobre(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSobre(false);
            void enviar(e.dataTransfer.files?.[0]);
          }}
          className={`flex min-w-[16rem] flex-1 flex-col items-start gap-2 rounded-lg border border-dashed p-4 transition-colors ${
            sobre ? "border-primary bg-primary/5" : "border-border bg-background"
          }`}
        >
          <input
            id={id}
            ref={entrada}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void enviar(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={aCarregar}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
          >
            {aCarregar ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Carregar do dispositivo
          </button>
          <p className="text-xs font-light text-graphite">
            {ajuda ?? "Arraste uma imagem para aqui ou seleccione um ficheiro (JPG, PNG ou WEBP, até 5 MB)."}
          </p>
          {valor ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-graphite hover:text-primary"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover imagem
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
