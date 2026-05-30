import { ResizeMode, Video } from "expo-av";
import { View } from "react-native";

type Props = {
  uri: string;
};

export function UploadedVideo({ uri }: Props) {
  if (!uri) return null;
  return (
    <View className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <Video
        style={{ width: "100%", height: "100%" }}
        source={{ uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
      />
    </View>
  );
}
