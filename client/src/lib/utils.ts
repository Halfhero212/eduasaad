import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIQD(
  value: number | string | null | undefined,
  currencyLabel?: string,
) {
  if (value === null || value === undefined || value === "") return "";
  const numericValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(numericValue)) return "";

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const amount = formatter.format(Math.round(numericValue));
  return currencyLabel ? `${amount}${currencyLabel}` : amount;
}
