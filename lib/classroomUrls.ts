import type { LessonAttachment } from "../services/classroom";
import { uploadsPublicUrl } from "../services/mediaUrl";

/** URL para abrir anexo (link externo ou ficheiro em `/uploads`). */
export function attachmentOpenUrl(att: LessonAttachment): string {
  if (att.kind === "URL" && att.url) return att.url;
  return uploadsPublicUrl(att.url || att.path);
}
