import { View } from "react-native";
import WebView from "react-native-webview";

type Props = {
  embedSrc: string;
  height?: number;
};

export function EmbedWebView({ embedSrc, height = 220 }: Props) {
  return (
    <View className="w-full overflow-hidden rounded-xl bg-black" style={{ height }}>
      <WebView
        source={{ uri: embedSrc }}
        style={{ flex: 1, backgroundColor: "#000" }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
      />
    </View>
  );
}
