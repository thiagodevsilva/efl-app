import { isAxiosError } from "axios";

export function axiosErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const raw = error.response?.data as { message?: string | string[] } | undefined;
  const m = raw?.message;
  if (typeof m === "string" && m.trim()) return m;
  if (Array.isArray(m) && m.length) return m.filter(Boolean).join(", ");
  return fallback;
}
