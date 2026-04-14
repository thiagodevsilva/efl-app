import { Redirect } from "expo-router";

import { BrandedBootScreen } from "../components/BrandedBootScreen";
import { useSessionStore } from "../store/useSessionStore";

export default function Index() {
  const { isHydrated, accessToken } = useSessionStore();

  if (!isHydrated) {
    return <BrandedBootScreen message="A recuperar a sua sessão…" />;
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
