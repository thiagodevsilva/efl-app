import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useSessionStore } from "../store/useSessionStore";

export default function Index() {
  const { isHydrated, accessToken } = useSessionStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
