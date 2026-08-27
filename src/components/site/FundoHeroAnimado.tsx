/**
 * Fundo institucional do hero.
 * Camadas discretas sobre a fotografia real: grelha técnica subtil e
 * brilho radial suave. A fotografia fica fixa ao scroll
 * (background-attachment: fixed) no elemento pai.
 */
export function FundoHeroAnimado() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Grelha técnica subtil */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="aidam-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0v56" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#aidam-grid)" className="text-ink" />
      </svg>

      {/* Brilho radial suave atrás do conteúdo */}
      <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-primary/[0.06] blur-3xl" />
    </div>
  );
}
