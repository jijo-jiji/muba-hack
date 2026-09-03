import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's built-in scales, so our own font sizes
 * (text-body, text-small and friends) look to it like text *colour* classes.
 * Without this it would drop "text-white" from a button because "text-body"
 * comes later and appears to conflict. Telling it these are font sizes fixes it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["small", "body", "card-title", "section", "page-title", "hero"] },
      ],
    },
  },
});

/** Joins class names and lets a later Tailwind class win over an earlier one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
