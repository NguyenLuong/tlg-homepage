import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyNumber(value: number | string): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  return value.toLocaleString("en-US");
}
