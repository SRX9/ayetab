const logos = [
  {
    src: "https://svgl.app/library/procure.svg",
    alt: "Procure",
    gradient: { from: "#3B82F6", to: "#1D4ED8" },
  },
  {
    src: "https://svgl.app/library/shopify.svg",
    alt: "Shopify",
    gradient: { from: "#FACC15", to: "#EAB308" },
  },
  {
    src: "https://svgl.app/library/blender.svg",
    alt: "Blender",
    gradient: { from: "#60A5FA", to: "#2563EB" },
  },
  {
    src: "https://svgl.app/library/figma.svg",
    alt: "Figma",
    gradient: { from: "#A855F7", to: "#7C3AED" },
  },
  {
    src: "https://svgl.app/library/spotify.svg",
    alt: "Spotify",
    gradient: { from: "#FB7185", to: "#EF4444" },
  },
  {
    src: "https://svgl.app/library/lottielab.svg",
    alt: "Lottielab",
    gradient: { from: "#FDE047", to: "#22C55E" },
  },
  {
    src: "https://svgl.app/library/google-cloud.svg",
    alt: "Google Cloud",
    gradient: { from: "#93C5FD", to: "#38BDF8" },
  },
  {
    src: "https://svgl.app/library/bing.svg",
    alt: "Bing",
    gradient: { from: "#22D3EE", to: "#14B8A6" },
  },
] as const;

const marqueeItems = [...logos, ...logos];

function LogoCard({
  src,
  alt,
  gradient,
}: {
  src: string;
  alt: string;
  gradient: { from: string; to: string };
}) {
  return (
    <div className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
      <div
        className="absolute inset-0 scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
        }}
        aria-hidden="true"
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 h-10 w-10 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function MarqueeScroller() {
  return (
    <div className="marquee-scroller mt-10 w-full overflow-hidden">
      <div className="marquee-track flex items-center gap-4 px-2">
        {marqueeItems.map((logo, index) => (
          <LogoCard
            key={`${logo.alt}-${index}`}
            src={logo.src}
            alt={logo.alt}
            gradient={logo.gradient}
          />
        ))}
      </div>
    </div>
  );
}
