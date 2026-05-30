import { Stack } from "expo-router";

export default function ClassroomStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#4f46e5",
        headerTitleStyle: { fontWeight: "600" },
        headerBackTitle: "Aulas",
      }}
    />
  );
}
