import type { ToolResult } from "../types";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " "
  );

function makeSentence(): string {
  const len = 8 + Math.floor(Math.random() * 12);
  const words = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)]!);
  words[0] = words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1);
  return words.join(" ") + ".";
}

function makeParagraph(): string {
  const count = 3 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, makeSentence).join(" ");
}

export function generateLoremIpsum(paragraphs = 3): ToolResult {
  const count = Math.min(Math.max(paragraphs, 1), 20);
  const output = Array.from({ length: count }, makeParagraph).join("\n\n");
  return { output };
}
