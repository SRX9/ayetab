import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  /** `hover:` only fires on real pointers, so taps don't leave rows stuck lit. */
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./src/**/*.{ts,tsx,html}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        favorite: "hsl(var(--favorite))",
        selection: {
          DEFAULT: "hsl(var(--selection))",
          foreground: "hsl(var(--selection-foreground))",
          soft: "hsl(var(--selection-soft))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          border: "hsl(var(--sidebar-border))",
        },
        shell: "hsl(var(--shell))",
        mist: "hsl(var(--sidebar))",
        line: "hsl(var(--border))",
      },
      /** Keep in sync with apps/web/tailwind.config.ts — packages/ui uses these. */
      fontSize: {
        kbd: ["0.625rem", { lineHeight: "1", letterSpacing: "0" }],
        label: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.08em" }],
        caption: ["0.75rem", { lineHeight: "1.45" }],
        ui: ["0.8125rem", { lineHeight: "1.4" }],
        "ui-md": ["0.875rem", { lineHeight: "1.45" }],
        "ui-lg": ["0.9375rem", { lineHeight: "1.5" }],
        subtitle: ["1.0625rem", { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" }],
        title: ["1.375rem", { lineHeight: "1.18", letterSpacing: "-0.025em", fontWeight: "600" }],
        display: ["1.875rem", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "600" }],
        "display-lg": ["2.125rem", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "600" }],
      },
      /**
       * Soft glass scale — squircles like the brand mark, not Notion-flat
       * chips or full pills. Keep in sync with apps/web/tailwind.config.ts.
       */
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "var(--radius)",
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
