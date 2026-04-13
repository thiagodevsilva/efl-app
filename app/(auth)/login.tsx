import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { isAxiosError } from "axios";

import { API_BASE_URL } from "../../constants/config";
import { login } from "../../services/auth";

function mapLoginError(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      return [
        `Sem conexão com a API (${API_BASE_URL}).`,
        "Confira Wi‑Fi, se a API está no ar e o .env.",
        "API no WSL? O celular fala com o Windows — encaminhe a porta 8085: PowerShell como Admin → efl-api/scripts/forward-api-from-windows.ps1 (detalhes em docs/AMBIENTE-DESENVOLVIMENTO.md).",
      ].join("\n\n");
    }
    const status = err.response?.status;
    const msg = (err.response?.data as { message?: string | string[] })
      ?.message;
    const flat =
      typeof msg === "string"
        ? msg
        : Array.isArray(msg)
          ? msg.join(", ")
          : "";

    if (status === 401) {
      return "E-mail ou senha incorretos.";
    }
    if (status === 403) {
      return "Confirme seu e-mail antes de entrar. Use o link enviado no cadastro ou o site.";
    }
    if (flat) {
      return flat;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Não foi possível entrar. Verifique a conexão e tente de novo.";
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login({
        email: email.trim(),
        password,
        rememberMe,
      });
      router.replace("/(tabs)");
    } catch (e) {
      setError(mapLoginError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Thais Costa
        </Text>
        <Text className="mt-1 text-center text-lg font-semibold text-blue-700">
          English
        </Text>
        <Text className="mt-4 text-center text-base text-slate-600">
          Área do aluno — entre com a mesma conta do site.
        </Text>

        <Text className="mb-1 mt-8 text-sm font-medium text-slate-700">
          E-mail
        </Text>
        <TextInput
          className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="voce@email.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <Text className="mb-1 mt-4 text-sm font-medium text-slate-700">
          Senha
        </Text>
        <TextInput
          className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-slate-700">Manter conectado</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            disabled={loading}
          />
        </View>

        {error ? (
          <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
        ) : null}

        <Pressable
          className="mt-6 items-center rounded-lg bg-slate-900 py-3.5 active:opacity-90"
          onPress={() => void onSubmit()}
          disabled={loading || !email.trim() || !password}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Entrar</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
