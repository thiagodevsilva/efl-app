import { useMemo } from "react";
import { View } from "react-native";
import WebView from "react-native-webview";

type Props = {
  html: string;
  minHeight?: number;
};

export function HtmlBlock({ html, minHeight = 180 }: Props) {
  const source = useMemo(() => {
    const body = html.trim();
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 12px; margin: 0; font-size: 16px; line-height: 1.5; color: #0f172a; }
      img { max-width: 100%; height: auto; }
      a { color: #4f46e5; }
    </style></head><body>${body}</body></html>`;
    return { html: doc };
  }, [html]);

  return (
    <View className="min-h-[120px] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <WebView
        originWhitelist={["*"]}
        source={source}
        style={{ width: "100%", height: minHeight, backgroundColor: "transparent" }}
        scrollEnabled
        nestedScrollEnabled
        setSupportMultipleWindows={false}
      />
    </View>
  );
}
