import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts (shadcn / react-native-reusables convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
