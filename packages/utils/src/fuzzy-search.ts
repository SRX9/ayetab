import type { ToolDefinition } from "./types";

export interface FuzzyMatch {
  score: number;
  indices: number[];
}

/** Subsequence fuzzy match with Raycast-style scoring. */
export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  if (!query) return { score: 0, indices: [] };

  const q = query.toLowerCase();
  const lower = text.toLowerCase();

  let qi = 0;
  const indices: number[] = [];
  let score = 0;
  let lastIdx = -1;
  let consecutive = 0;

  for (let ti = 0; ti < lower.length && qi < q.length; ti++) {
    if (lower[ti] === q[qi]) {
      indices.push(ti);

      if (lastIdx === ti - 1) {
        consecutive++;
        score += 8 + consecutive * 3;
      } else {
        consecutive = 0;
        score += 2;
      }

      if (ti === 0) score += 25;
      else if (/[\s\-_./]/.test(text[ti - 1]!)) score += 18;

      if (lastIdx >= 0 && ti - lastIdx > 1) score -= ti - lastIdx - 1;

      lastIdx = ti;
      qi++;
    }
  }

  if (qi < q.length) return null;

  score -= (text.length - q.length) * 0.5;
  return { score, indices };
}

/** Match query letters at the start of each word (e.g. "jf" → "JSON Formatter"). */
export function acronymMatch(query: string, text: string): FuzzyMatch | null {
  if (!query) return { score: 0, indices: [] };

  const q = query.toLowerCase();
  const wordStarts: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (i === 0 || /[\s\-_./]/.test(text[i - 1]!)) {
      wordStarts.push(i);
    }
  }

  let qi = 0;
  const indices: number[] = [];
  for (const start of wordStarts) {
    if (qi < q.length && text[start]?.toLowerCase() === q[qi]) {
      indices.push(start);
      qi++;
    }
  }

  if (qi < q.length) return null;

  return { score: 120 + q.length * 25, indices };
}

export interface ToolSearchResult {
  tool: ToolDefinition;
  score: number;
  nameIndices: number[];
}

const PRIORITY_WEIGHT: Record<ToolDefinition["priority"], number> = {
  P0: 4,
  P1: 3,
  P2: 2,
  P3: 1,
};

export function fuzzySearchTools(query: string, tools: ToolDefinition[]): ToolSearchResult[] {
  const q = query.trim();
  if (!q) {
    return tools.map((tool) => ({ tool, score: 0, nameIndices: [] }));
  }

  const results: ToolSearchResult[] = [];

  for (const tool of tools) {
    const nameMatch = fuzzyMatch(q, tool.name);
    const acronym = acronymMatch(q, tool.name);
    const fields: Array<{ match: FuzzyMatch | null; weight: number }> = [
      { match: acronym, weight: 4 },
      { match: nameMatch, weight: 3 },
      { match: fuzzyMatch(q, tool.id.replace(/-/g, " ")), weight: 2 },
      { match: fuzzyMatch(q, tool.description), weight: 1 },
      ...tool.keywords.map((keyword) => ({ match: fuzzyMatch(q, keyword), weight: 2 })),
    ];

    let bestScore = -Infinity;
    let nameIndices: number[] = [];
    for (const { match, weight } of fields) {
      if (match) {
        const weighted = match.score * weight;
        if (weighted > bestScore) {
          bestScore = weighted;
          nameIndices = match === nameMatch || match === acronym ? match.indices : nameIndices;
        }
      }
    }

    if (nameMatch) nameIndices = nameMatch.indices;
    if (acronym && (!nameMatch || acronym.score * 4 >= (nameMatch.score * 3))) {
      nameIndices = acronym.indices;
    }

    if (bestScore > -Infinity) {
      results.push({
        tool,
        score: bestScore + PRIORITY_WEIGHT[tool.priority] * 0.1,
        nameIndices,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
