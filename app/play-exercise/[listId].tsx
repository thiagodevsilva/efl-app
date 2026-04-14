import { isAxiosError } from "axios";
import { router, useLocalSearchParams, usePathname, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getExerciseList } from "../../services/exercises";

function normalizeListIdParam(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].length > 0) {
    return raw[0];
  }
  return undefined;
}

function listIdFromSegments(segments: string[]): string | undefined {
  const i = segments.indexOf("play-exercise");
  if (i >= 0 && segments[i + 1]) return segments[i + 1];
  return segments.length >= 2 ? segments[segments.length - 1] : undefined;
}

function listIdFromPathname(pathname: string | undefined): string | undefined {
  if (!pathname) return undefined;
  const m = pathname.match(/\/play-exercise\/([^/?#]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}

function messageFromUnknown(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const data = err.response?.data as { message?: unknown } | undefined;
  return typeof data?.message === "string" ? data.message : undefined;
}

function goBackToLists() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)");
  }
}

/**
 * Rota no Stack raiz (sem `app/exercise/_layout`): evita bug de contexto de
 * navegação com Stack aninhado + Android/Expo Go.
 */
export default function ExercisePlayPlaceholderScreen() {
  const params = useLocalSearchParams<{ listId?: string | string[] }>();
  const segments = useSegments();
  const pathname = usePathname();
  const listId = useMemo(() => {
    return (
      normalizeListIdParam(params.listId) ??
      listIdFromSegments(segments) ??
      listIdFromPathname(pathname)
    );
  }, [params.listId, segments, pathname]);
  const [title, setTitle] = useState("Lista");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) {
      setLoading(false);
      setError("Lista inválida.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getExerciseList(listId);
        if (!cancelled) setTitle(list.title);
      } catch (e) {
        if (!cancelled) {
          setError(
            messageFromUnknown(e) ?? "Não foi possível carregar a lista.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listId]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          style={styles.backBtn}
          onPress={goBackToLists}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0f172a" />
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Em construção</Text>
              <Text style={styles.cardBody}>
                Em seguida implementamos a execução igual ao site: uma questão por vez,
                feedback imediato, fila quando errar e tela de conclusão — com os quatro
                tipos (texto livre, múltipla escolha, lacunas e montar frase).
              </Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={goBackToLists}>
              <Text style={styles.primaryBtnText}>Voltar às listas</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingBottom: 12,
    paddingTop: 4,
  },
  backBtn: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8 },
  backText: { fontSize: 16, fontWeight: "500", color: "#1e293b" },
  title: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  toolbarSpacer: { width: 64 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  centered: { alignItems: "center", paddingVertical: 64 },
  error: { textAlign: "center", fontSize: 16, color: "#b91c1c" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a" },
  cardBody: { marginTop: 8, fontSize: 16, lineHeight: 24, color: "#475569" },
  primaryBtn: {
    marginTop: 24,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
