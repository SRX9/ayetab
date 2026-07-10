import { cn } from "./utils";

/** Shared pressable interaction classes (Emil: scale 0.97 on :active, exact transitions). */
export function pressable(className?: string) {
  return cn(
    "transition-[transform,background-color,color,border-color,opacity,box-shadow] duration-150 ease-out-strong",
    "active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    className
  );
}
