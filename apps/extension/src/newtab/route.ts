/**
 * Hash routing for the new tab page.
 *
 * The side panel gets away with `useState` navigation because it is a
 * companion surface. A new tab is a real tab: users press browser Back and
 * expect it to work, and they reload. The hash is therefore the source of
 * truth for which view is open — no shared `sessionStorage` slot, which many
 * concurrently open tabs would fight over.
 */

export type Route = { kind: "home" } | { kind: "tool"; toolId: string; input: string };

/**
 * Tool chaining ("send this output to another tool") can hand over a large
 * payload. Short values ride in the hash so reload and Back restore them;
 * larger ones are stashed in per-tab sessionStorage under a token.
 */
const INLINE_INPUT_LIMIT = 512;
const STASH_PREFIX = "ayetab-nav-input:";

function stashInput(input: string): string | null {
  const token = Math.random().toString(36).slice(2, 10);
  try {
    sessionStorage.setItem(STASH_PREFIX + token, input);
    return token;
  } catch {
    return null;
  }
}

function readStash(token: string): string {
  try {
    return sessionStorage.getItem(STASH_PREFIX + token) ?? "";
  } catch {
    return "";
  }
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, "");
  const [path = "", query = ""] = raw.split("?");
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "tools" && segments[1]) {
    const params = new URLSearchParams(query);
    const ref = params.get("ref");
    return {
      kind: "tool",
      toolId: decodeURIComponent(segments[1]),
      input: ref ? readStash(ref) : (params.get("input") ?? ""),
    };
  }

  return { kind: "home" };
}

export function homeHash(): string {
  return "#/";
}

export function toolHash(toolId: string, input = ""): string {
  const base = `#/tools/${encodeURIComponent(toolId)}`;
  if (!input) return base;
  if (input.length <= INLINE_INPUT_LIMIT) {
    return `${base}?${new URLSearchParams({ input }).toString()}`;
  }
  const token = stashInput(input);
  return token ? `${base}?ref=${token}` : base;
}

/** Push a hash onto history. Assigning an unchanged hash is a no-op in browsers. */
export function navigate(hash: string) {
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}
