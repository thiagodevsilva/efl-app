import { Text, View } from "react-native";

export default function ExercisesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-center text-2xl font-semibold text-slate-900">
        Exercícios
      </Text>
      <Text className="mt-3 text-center text-base text-slate-600">
        MVP aluno: lista e fluxo de exercícios entram aqui (React Query + API).
      </Text>
    </View>
  );
}
