/**
 * Fundo institucional animado do hero.
 * Camadas: grelha subtil, estrada em movimento contínuo e silhueta de
 * automóvel a vermelho — tudo em CSS puro (sem JS), respeitando
 * prefers-reduced-motion. A camada de imagem fica fixa ao scroll
 * (background-attachment: fixed) no elemento pai.
 */
export function FundoHeroAnimado() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Grelha técnica subtil */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="aidam-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0v56" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#aidam-grid)" className="text-ink" />
      </svg>

      {/* Silhueta de automóvel em traço, com ligeiro movimento de deslize */}
      <svg
        viewBox="0 0 900 320"
        className="fundo-hero-carro absolute -right-24 top-1/2 w-[720px] max-w-none -translate-y-[62%] text-primary/12 lg:right-8 lg:w-[880px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M60 240 L120 240 Q150 240 165 220 L210 160 Q225 140 255 140 L480 140 Q510 140 535 160 L600 215 Q610 225 630 228 L760 240 Q800 244 800 265 L800 285 L760 285" />
        <circle cx="700" cy="285" r="34" />
        <circle cx="700" cy="285" r="14" />
        <circle cx="230" cy="285" r="34" />
        <circle cx="230" cy="285" r="14" />
        <path d="M264 285 L666 285" />
        <path d="M300 150 L300 218" opacity="0.6" />
        <path d="M470 150 L470 218" opacity="0.6" />
        <path d="M255 150 L480 150" opacity="0.6" />
      </svg>

      {/* Estrada: linhas de traçado em movimento contínuo */}
      <div className="absolute inset-x-0 bottom-[14%] hidden h-px sm:block">
        <div className="fundo-hero-estrada h-full w-[200%] bg-[repeating-linear-gradient(90deg,oklch(0.55_0_0)_0px,oklch(0.55_0_0)_48px,transparent_48px,transparent_96px)] opacity-25" />
      </div>
      <div className="absolute inset-x-0 bottom-[calc(14%-3px)] hidden h-[7px] sm:block">
        <div className="fundo-hero-estrada h-full w-[200%] bg-[repeating-linear-gradient(90deg,oklch(0.552_0.229_28.5)_0px,oklch(0.552_0.229_28.5)_64px,transparent_64px,transparent_128px)] opacity-20" />
      </div>

      {/* Brilho radial suave atrás do conteúdo */}
      <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-primary/[0.05] blur-3xl" />
    </div>
  );
}
