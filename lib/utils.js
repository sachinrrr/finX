import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Utility to merge Tailwind CSS classes (handles conflicts)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
