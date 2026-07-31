import type { ToolResult } from "../types";

export type CipherKind =
  | "auto"
  | "caesar"
  | "rot13"
  | "atbash"
  | "vigenere"
  | "railfence"
  | "a1z26"
  | "morse"
  | "binary"
  | "reverse";

export const CIPHER_KINDS: Array<{ id: CipherKind; label: string; needsKey?: "text" | "number" }> = [
  { id: "auto", label: "Auto-detect" },
  { id: "caesar", label: "Caesar shift", needsKey: "number" },
  { id: "rot13", label: "ROT13" },
  { id: "atbash", label: "Atbash" },
  { id: "vigenere", label: "Vigenère", needsKey: "text" },
  { id: "railfence", label: "Rail fence", needsKey: "number" },
  { id: "a1z26", label: "A1Z26" },
  { id: "morse", label: "Morse code" },
  { id: "binary", label: "Binary" },
  { id: "reverse", label: "Reverse" },
];

const A = "abcdefghijklmnopqrstuvwxyz";

// ── Individual ciphers ──────────────────────────────────────────────────────

export function caesar(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch <= "Z";
    const idx = A.indexOf(ch.toLowerCase());
    const out = A[(idx + s) % 26];
    return isUpper ? out.toUpperCase() : out;
  });
}

export function atbash(text: string): string {
  return text.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch <= "Z";
    const out = A[25 - A.indexOf(ch.toLowerCase())];
    return isUpper ? out.toUpperCase() : out;
  });
}

export function vigenere(text: string, key: string, decode: boolean): string {
  const k = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!k) return text;

  let ki = 0;
  return text.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch <= "Z";
    const shift = A.indexOf(k[ki % k.length]);
    ki++;
    const idx = A.indexOf(ch.toLowerCase());
    const out = A[(idx + (decode ? -shift : shift) + 26) % 26];
    return isUpper ? out.toUpperCase() : out;
  });
}

export function railFenceDecode(text: string, rails: number): string {
  if (rails < 2) return text;
  const n = text.length;

  // Mark the zig-zag pattern, then fill row by row.
  const pattern: number[] = [];
  let rail = 0;
  let dir = 1;
  for (let i = 0; i < n; i++) {
    pattern.push(rail);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }

  const out = new Array<string>(n);
  let pos = 0;
  for (let r = 0; r < rails; r++) {
    for (let i = 0; i < n; i++) {
      if (pattern[i] === r) out[i] = text[pos++];
    }
  }
  return out.join("");
}

export function railFenceEncode(text: string, rails: number): string {
  if (rails < 2) return text;
  const rows: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let dir = 1;
  for (const ch of text) {
    rows[rail].push(ch);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return rows.flat().join("");
}

export function a1z26Decode(text: string): string {
  return text
    .split(/\s*[/|]\s*|\n/)
    .map((word) =>
      word
        .trim()
        .split(/[\s,.-]+/)
        .filter(Boolean)
        .map((n) => {
          const i = Number(n);
          return i >= 1 && i <= 26 ? A[i - 1] : "";
        })
        .join("")
    )
    .filter(Boolean)
    .join(" ");
}

export function a1z26Encode(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split("")
        .map((c) => (A.includes(c) ? String(A.indexOf(c) + 1) : ""))
        .filter(Boolean)
        .join("-")
    )
    .filter(Boolean)
    .join(" / ");
}

const MORSE: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....",
  i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.",
  q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-",
  y: "-.--", z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  "=": "-...-", "+": ".-.-.", "-": "-....-", '"': ".-..-.", "@": ".--.-.",
};

const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k])
);

export function morseDecode(text: string): string {
  return text
    .trim()
    .split(/\s*\/\s*|\s{3,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => MORSE_REVERSE[code] ?? "")
        .join("")
    )
    .join(" ")
    .trim();
}

export function morseEncode(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split("")
        .map((c) => MORSE[c] ?? "")
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join(" / ");
}

export function binaryDecode(text: string): string {
  const bits = text.trim().split(/\s+/);
  return bits
    .map((b) => (/^[01]{7,8}$/.test(b) ? String.fromCharCode(parseInt(b, 2)) : ""))
    .join("");
}

export function binaryEncode(text: string): string {
  return [...text].map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
}

// ── Auto-detection ──────────────────────────────────────────────────────────

/** Relative letter frequency of English, used to score candidate plaintexts. */
const ENGLISH_FREQ: Record<string, number> = {
  a: 8.17, b: 1.49, c: 2.78, d: 4.25, e: 12.70, f: 2.23, g: 2.02, h: 6.09,
  i: 6.97, j: 0.15, k: 0.77, l: 4.03, m: 2.41, n: 6.75, o: 7.51, p: 1.93,
  q: 0.10, r: 5.99, s: 6.33, t: 9.06, u: 2.76, v: 0.98, w: 2.36, x: 0.15,
  y: 1.97, z: 0.07,
};

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "that", "have", "with", "this", "from",
  "they", "which", "there", "their", "would", "about", "were", "been", "what",
  "when", "your", "said", "each", "will", "other", "than", "then", "them",
];

/**
 * Score how English-like a string is. Combines chi-squared letter frequency
 * (lower is better, so it is inverted) with a bonus for recognisable words.
 */
export function englishScore(text: string): number {
  const letters = text.toLowerCase().replace(/[^a-z]/g, "");
  if (letters.length === 0) return -Infinity;

  const counts: Record<string, number> = {};
  for (const c of letters) counts[c] = (counts[c] ?? 0) + 1;

  let chi = 0;
  for (const [letter, pct] of Object.entries(ENGLISH_FREQ)) {
    const expected = (pct / 100) * letters.length;
    const observed = counts[letter] ?? 0;
    chi += Math.pow(observed - expected, 2) / Math.max(expected, 0.5);
  }

  const lower = ` ${text.toLowerCase()} `;
  let wordBonus = 0;
  for (const w of COMMON_WORDS) {
    if (lower.includes(` ${w} `)) wordBonus += 40;
  }

  return wordBonus - chi / Math.max(1, letters.length / 40);
}

export interface CipherCandidate {
  cipher: string;
  detail: string;
  output: string;
  score: number;
}

export function autoDetect(input: string): CipherCandidate[] {
  const candidates: CipherCandidate[] = [];
  const add = (cipher: string, detail: string, output: string) => {
    if (output.trim()) candidates.push({ cipher, detail, output, score: englishScore(output) });
  };

  for (let shift = 1; shift < 26; shift++) {
    const out = caesar(input, -shift);
    add(shift === 13 ? "ROT13" : "Caesar", `shift ${shift}`, out);
  }

  add("Atbash", "mirror alphabet", atbash(input));
  add("Reverse", "reversed text", [...input].reverse().join(""));

  for (let rails = 2; rails <= 8; rails++) {
    add("Rail fence", `${rails} rails`, railFenceDecode(input, rails));
  }

  if (/^[\s.\-/]+$/.test(input)) add("Morse", "dots and dashes", morseDecode(input));
  if (/^[01\s]+$/.test(input)) add("Binary", "8-bit ASCII", binaryDecode(input));
  if (/^[\d\s,.\-/|]+$/.test(input)) add("A1Z26", "letter positions", a1z26Decode(input));

  return candidates.sort((a, b) => b.score - a.score).slice(0, 8);
}

// ── Entry point ─────────────────────────────────────────────────────────────

export function runCipher(
  input: string,
  kind: CipherKind,
  key: string,
  mode: "decode" | "encode"
): ToolResult {
  const decode = mode === "decode";

  switch (kind) {
    case "auto": {
      const results = autoDetect(input);
      if (results.length === 0) return { output: "", error: "No plausible cipher found." };
      const best = results[0];
      const lines = [
        `Best match: ${best.cipher} (${best.detail})`,
        "",
        best.output,
        "",
        "─".repeat(48),
        "Other candidates",
        "",
        ...results.slice(1).map((r) => `${r.cipher} — ${r.detail}\n  ${r.output.slice(0, 120)}`),
      ];
      return { output: lines.join("\n"), meta: { candidates: results } };
    }
    case "caesar": {
      const shift = Number(key) || 3;
      return { output: caesar(input, decode ? -shift : shift) };
    }
    case "rot13":
      return { output: caesar(input, 13) };
    case "atbash":
      return { output: atbash(input) };
    case "vigenere": {
      if (!key.trim()) return { output: "", error: "Vigenère needs a keyword." };
      return { output: vigenere(input, key, decode) };
    }
    case "railfence": {
      const rails = Math.max(2, Number(key) || 3);
      return { output: decode ? railFenceDecode(input, rails) : railFenceEncode(input, rails) };
    }
    case "a1z26":
      return { output: decode ? a1z26Decode(input) : a1z26Encode(input) };
    case "morse":
      return { output: decode ? morseDecode(input) : morseEncode(input) };
    case "binary":
      return { output: decode ? binaryDecode(input) : binaryEncode(input) };
    case "reverse":
      return { output: [...input].reverse().join("") };
  }
}
