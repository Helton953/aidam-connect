import { cn } from "@/lib/utils";

/**
 * Marcador temporário do logótipo AIDAM.
 * Substituir pelo ficheiro oficial quando disponível.
 */
export function Logo({
  className,
  size = "md",
  showTagline = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const wordmark = size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-2xl" : "text-xl";
  const icon = size === "lg" ? "h-8 w-20" : size === "md" ? "h-5 w-12" : "h-4 w-10";

  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <svg
        viewBox="0 0 120 32"
        className={cn(icon, "mb-1 text-primary")}
        role="img"
        aria-label="Silhueta de automóvel"
        fill="currentColor"
      >
        <path d="M6 22c0-2 1.6-3.6 3.6-3.6h1.1c.6-3 3.2-5.2 6.4-5.2s5.8 2.2 6.4 5.2h62c.6-3 3.2-5.2 6.4-5.2s5.8 2.2 6.4 5.2h1.1c2 0 3.6 1.6 3.6 3.6H6z" />
        <path d="M14 13.4 22 6h34l10 7.4H14z" opacity="0.75" />
        <circle cx="17.1" cy="22.4" r="4.4" />
        <circle cx="91.9" cy="22.4" r="4.4" />
      </svg>
      <span className={cn("font-extrabold tracking-tight text-ink", wordmark)}>AIDAM</span>
      {showTagline ? (
        <span className="mt-1 max-w-[22rem] text-[0.6rem] font-medium uppercase leading-tight tracking-[0.12em] text-steel">
          Associação de Importadores e Distribuidores de Automóveis de Moçambique
        </span>
      ) : null}
    </span>
  );
}
