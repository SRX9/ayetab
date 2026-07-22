const logos = [
  {
    src: "https://svgl.app/library/chrome.svg",
    alt: "Chrome",
    gradient: { from: "#34A853", to: "#4285F4" },
  },
  {
    src: "https://svgl.app/library/firefox.svg",
    alt: "Firefox",
    gradient: { from: "#FF7139", to: "#FF4F5E" },
  },
  {
    src: "https://svgl.app/library/json.svg",
    alt: "JSON",
    gradient: { from: "#FACC15", to: "#EAB308" },
  },
  {
    src: "https://svgl.app/library/typescript.svg",
    alt: "TypeScript",
    gradient: { from: "#60A5FA", to: "#2563EB" },
  },
  {
    src: "https://svgl.app/library/vscode.svg",
    alt: "VS Code",
    gradient: { from: "#38BDF8", to: "#0284C7" },
  },
  {
    src: "https://svgl.app/library/github_light.svg",
    alt: "GitHub",
    gradient: { from: "#64748B", to: "#0F172A" },
  },
  {
    src: "https://svgl.app/library/nodejs.svg",
    alt: "Node.js",
    gradient: { from: "#4ADE80", to: "#16A34A" },
  },
  {
    src: "https://svgl.app/library/react_light.svg",
    alt: "React",
    gradient: { from: "#67E8F9", to: "#22D3EE" },
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
    <div
      className="marquee-scroller mt-10 w-full overflow-hidden"
      aria-label="Works alongside the tools you already use"
    >
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
