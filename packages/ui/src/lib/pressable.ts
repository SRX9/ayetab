import { cn } from "./utils";

/** One focus ring everywhere: 2px ring in the ring token, offset from the surface. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Shared interaction classes. Controls respond with colour only — a document
 * UI has no depth for a press to compress into.
 */
export function pressable(className?: string) {
  return cn("transition-colors duration-100", FOCUS_RING, className);
}
