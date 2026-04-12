import { Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <Text className="text-lg font-medium text-slate-800">Perfil</Text>
      <Text className="mt-2 text-center text-slate-600">
        Dados da conta e preferências (sem área admin neste app).
      </Text>
    </View>
  );
}
