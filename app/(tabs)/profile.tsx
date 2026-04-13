import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { logout } from "../../services/auth";
import { useSessionStore } from "../../store/useSessionStore";

export default function ProfileScreen() {
  const user = useSessionStore((s) => s.user);
  const [leaving, setLeaving] = useState(false);

  async function onLogout() {
    setLeaving(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-6">
      <Text className="text-xl font-semibold text-slate-900">Perfil</Text>
      {user ? (
        <>
          <Text className="mt-2 text-lg text-slate-800">{user.name}</Text>
          <Text className="mt-1 text-slate-600">{user.email}</Text>
        </>
      ) : (
        <Text className="mt-2 text-slate-600">Sessão ativa.</Text>
      )}

      <Pressable
        className="mt-8 items-center rounded-lg border border-slate-300 bg-white py-3 active:bg-slate-100"
        onPress={() => void onLogout()}
        disabled={leaving}
      >
        {leaving ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-base font-medium text-slate-800">Sair</Text>
        )}
      </Pressable>
    </View>
  );
}
