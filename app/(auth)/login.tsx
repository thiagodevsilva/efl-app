import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center gap-4 bg-white px-6">
      <Text className="text-2xl font-semibold text-slate-900">Login</Text>
      <Text className="text-slate-600">
        Fluxo de autenticação para alunos (SecureStore + API) será ligado aqui.
      </Text>
      <Link href="/(tabs)" asChild>
        <Pressable>
          <Text className="text-base font-medium text-blue-600">
            Voltar às abas (dev)
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
