import { useLocalSearchParams, usePathname, useSegments } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { ExerciseRunner } from "../../components/exercises/ExerciseRunner";

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

export default function PlayExerciseScreen() {
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

  if (!listId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-center text-base text-red-700">Lista inválida.</Text>
      </View>
    );
  }

  return <ExerciseRunner listId={listId} />;
}
