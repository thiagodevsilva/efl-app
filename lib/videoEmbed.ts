/**
 * Converte URLs de páginas de vídeo em URLs seguras para iframe/WebView (embed).
 * Alinhado a efl-web/src/utils/videoEmbed.ts
 */

export type VideoEmbedKind = "youtube" | "vimeo" | "loom" | "dailymotion";

export type VideoEmbedInfo = {
  kind: VideoEmbedKind;
  embedSrc: string;
};

function tryYoutube(url: URL): VideoEmbedInfo | null {
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host.endsWith("youtube.com") || host === "m.youtube.com") {
    if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/")[2] ?? null;
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/")[2] ?? null;
    } else {
      id = url.searchParams.get("v");
    }
  }
  if (!id || !/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;
  return {
    kind: "youtube",
    embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
  };
}

function tryVimeo(url: URL): VideoEmbedInfo | null {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.includes("vimeo.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  const embedIdx = parts.indexOf("video");
  if (embedIdx >= 0 && parts[embedIdx + 1]) id = parts[embedIdx + 1];
  else if (parts[0] && /^\d+$/.test(parts[0])) id = parts[0];
  if (!id) return null;
  return {
    kind: "vimeo",
    embedSrc: `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
  };
}

function tryLoom(url: URL): VideoEmbedInfo | null {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.endsWith("loom.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "share" && parts[1]) {
    return {
      kind: "loom",
      embedSrc: `https://www.loom.com/embed/${encodeURIComponent(parts[1])}`,
    };
  }
  if (parts[0] === "embed" && parts[1]) {
    return {
      kind: "loom",
      embedSrc: `https://www.loom.com/embed/${encodeURIComponent(parts[1])}`,
    };
  }
  return null;
}

function tryDailymotion(url: URL): VideoEmbedInfo | null {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.includes("dailymotion.com")) return null;
  const m = url.pathname.match(/\/video\/([a-z0-9]+)/i);
  const id = m?.[1];
  if (!id) return null;
  return {
    kind: "dailymotion",
    embedSrc: `https://www.dailymotion.com/embed/video/${encodeURIComponent(id)}`,
  };
}

export function parseVideoEmbedFromUrl(raw: string): VideoEmbedInfo | null {
  const trimmed = raw?.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  return tryYoutube(url) || tryVimeo(url) || tryLoom(url) || tryDailymotion(url);
}
