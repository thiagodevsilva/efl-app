import { API_BASE_URL } from "../constants/config";

/** URL pública para ficheiros servidos sob `/uploads` (vídeo, imagem, anexos). */
export function uploadsPublicUrl(path: string | null | undefined): string {
  if (!path) return "";
  const p = String(path).trim();
  if (/^https?:\/\//i.test(p)) return p;
  const rel = p.replace(/^\/+/, "");
  const prefix = rel.startsWith("uploads/") ? "" : "uploads/";
  const base = API_BASE_URL.replace(/\/$/, "");
  const slash = base.endsWith("/") ? "" : "/";
  return `${base}${slash}${prefix}${rel}`;
}
