import type { ToolResult } from "../types";

/** Average adult reading and speaking rates, words per minute. */
const READING_WPM = 238;
const SPEAKING_WPM = 140;

export interface WordCountStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  averageWordLength: number;
  longestWord: string;
  readingTimeSeconds: number;
  speakingTimeSeconds: number;
  topWords: Array<{ word: string; count: number }>;
}

/** Words that dominate any frequency count without saying anything. */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "is", "are",
  "was", "were", "be", "been", "being", "it", "its", "this", "that", "these", "those", "as", "by",
  "from", "not", "no", "so", "if", "than", "then", "there", "their", "they", "them", "he", "she",
  "his", "her", "we", "our", "you", "your", "i", "my", "me", "do", "does", "did", "has", "have",
  "had", "will", "would", "can", "could", "should", "may", "might", "must", "about", "into", "over",
]);

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const mins = Math.floor(seconds / 60);
  const rem = Math.round(seconds % 60);
  if (mins < 60) return rem === 0 ? `${mins} min` : `${mins} min ${rem}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export function computeWordStats(input: string): WordCountStats {
  const text = input;

  const wordMatches = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
  const words = wordMatches.length;

  const characters = [...text].length;
  const charactersNoSpaces = [...text.replace(/\s/g, "")].length;

  // A sentence ends at . ! ? … possibly followed by quotes/brackets.
  const sentences = text.trim()
    ? (text.match(/[^.!?…]+[.!?…]+["'”’)\]]*|[^.!?…]+$/g) ?? []).filter((s) => s.trim().length > 0)
        .length
    : 0;

  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

  const lower = wordMatches.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lower).size;

  const totalLength = wordMatches.reduce((sum, w) => sum + w.length, 0);
  const averageWordLength = words > 0 ? totalLength / words : 0;

  const longestWord = wordMatches.reduce((best, w) => (w.length > best.length ? w : best), "");

  const freq = new Map<string, number>();
  for (const w of lower) {
    if (w.length < 3 || STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    averageWordLength,
    longestWord,
    readingTimeSeconds: (words / READING_WPM) * 60,
    speakingTimeSeconds: (words / SPEAKING_WPM) * 60,
    topWords,
  };
}

export function countWords(input: string): ToolResult {
  const s = computeWordStats(input);

  const rows: Array<[string, string]> = [
    ["Words", s.words.toLocaleString()],
    ["Characters", s.characters.toLocaleString()],
    ["Characters (no spaces)", s.charactersNoSpaces.toLocaleString()],
    ["Sentences", s.sentences.toLocaleString()],
    ["Paragraphs", s.paragraphs.toLocaleString()],
    ["Lines", s.lines.toLocaleString()],
    ["Unique words", s.uniqueWords.toLocaleString()],
    ["Avg. word length", `${s.averageWordLength.toFixed(1)} chars`],
    ["Longest word", s.longestWord || "—"],
    ["Reading time", formatDuration(s.readingTimeSeconds)],
    ["Speaking time", formatDuration(s.speakingTimeSeconds)],
  ];

  const width = Math.max(...rows.map(([label]) => label.length));
  let output = rows.map(([label, value]) => `${label.padEnd(width)}  ${value}`).join("\n");

  if (s.topWords.length > 0) {
    output += "\n\nMost frequent words\n";
    output += s.topWords.map(({ word, count }) => `  ${String(count).padStart(4)}  ${word}`).join("\n");
  }

  return { output, meta: { ...s } };
}
