import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale is named (`text-ui`, `text-caption`, `text-label`) rather than
 * sized, and tailwind-merge reads an unknown `text-*` as a colour. That put the
 * size and the colour in one group, so `cn("text-ui", "text-foreground")`
 * discarded the size and the element fell back to 16px. Declaring the scale
 * keeps the two groups apart; `text-ui text-caption` still collapses correctly.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "kbd",
            "label",
            "caption",
            "ui",
            "ui-md",
            "ui-lg",
            "subtitle",
            "title",
            "display",
            "display-lg",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
