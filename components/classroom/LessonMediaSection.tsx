import { Linking, Pressable, Text, View } from "react-native";

import { parseVideoEmbedFromUrl } from "../../lib/videoEmbed";
import { uploadsPublicUrl } from "../../services/mediaUrl";
import { EmbedWebView } from "./EmbedWebView";
import { UploadedVideo } from "./UploadedVideo";

type Props = {
  videoPath?: string | null;
  videoUrl?: string | null;
};

export function LessonMediaSection({ videoPath, videoUrl }: Props) {
  const rawUrl = videoUrl?.trim() ?? "";
  const embed = rawUrl ? parseVideoEmbedFromUrl(rawUrl) : null;

  if (videoPath) {
    const uri = uploadsPublicUrl(videoPath);
    if (!uri) return null;
    return <UploadedVideo uri={uri} />;
  }

  if (embed) {
    return (
      <View className="gap-2">
        <EmbedWebView embedSrc={embed.embedSrc} height={220} />
        <Pressable onPress={() => void Linking.openURL(rawUrl)}>
          <Text className="text-sm text-indigo-600">Abrir no site original</Text>
        </Pressable>
      </View>
    );
  }

  if (rawUrl) {
    return (
      <View className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Text className="mb-2 text-sm text-slate-700">
          Este link não permite reprodução embutida na app. Abra no navegador.
        </Text>
        <Pressable
          className="self-start rounded-lg bg-indigo-600 px-3 py-2 active:bg-indigo-700"
          onPress={() => void Linking.openURL(rawUrl)}
        >
          <Text className="text-sm font-semibold text-white">Abrir vídeo</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}
