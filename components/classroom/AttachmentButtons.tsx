import { Linking, Pressable, Text, View } from "react-native";

import { attachmentOpenUrl } from "../../lib/classroomUrls";
import type { LessonAttachment } from "../../services/classroom";
import { parseVideoEmbedFromUrl } from "../../lib/videoEmbed";
import { EmbedWebView } from "./EmbedWebView";

type Props = {
  attachments: LessonAttachment[];
  title?: string;
};

export function AttachmentButtons({ attachments, title = "Materiais" }: Props) {
  if (!attachments.length) return null;

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="mb-3 text-base font-semibold text-slate-900">{title}</Text>
      <View className="gap-4">
        {attachments.map((att, idx) => {
          const url = attachmentOpenUrl(att);
          const embed = att.kind === "URL" && att.url ? parseVideoEmbedFromUrl(att.url) : null;
          return (
            <View
              key={`${att.name ?? ""}-${url}-${idx}`}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <Text className="mb-2 text-sm font-medium text-slate-800" numberOfLines={2}>
                {att.name || "Anexo"}
              </Text>
              {embed ? <EmbedWebView embedSrc={embed.embedSrc} height={200} /> : null}
              <Pressable
                className="mt-2 self-start rounded-lg bg-indigo-600 px-3 py-2 active:bg-indigo-700"
                onPress={() => void Linking.openURL(url)}
              >
                <Text className="text-sm font-semibold text-white">
                  {att.kind === "FILE" ? "Abrir / transferir" : "Abrir link"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
