import { cn } from "@/lib/utils";
import logoAsset from "@/assets/aidam-logo.png.asset.json";

/** Logótipo oficial da AIDAM. */
export function Logo({
  className,
  size = "md",
  showTagline = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Mantido por compatibilidade: a assinatura já faz parte do logótipo oficial. */
  showTagline?: boolean;
}) {
  void showTagline;
  const altura = size === "lg" ? "h-24 sm:h-28" : size === "md" ? "h-16" : "h-10";

  return (
    <img
      src={logoAsset.url}
      alt="AIDAM — Associação de Importação e Distribuição Automóvel de Moçambique"
      className={cn("w-auto object-contain", altura, className)}
      width={614}
      height={278}
    />
  );
}
