import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { AttachmentButtons } from "../../../components/classroom/AttachmentButtons";
import { HtmlBlock } from "../../../components/classroom/HtmlBlock";
import { axiosErrorMessage } from "../../../lib/axiosMessage";
import { getClassroomEnrollment } from "../../../services/classroom";

type SortKey = "oldest" | "newest";

export default function EnrollmentClassroomScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const enrollmentId = typeof idParam === "string" ? idParam : idParam?.[0] ?? "";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [sortOrder, setSortOrder] = useState<SortKey>("oldest");

  const query = useQuery({
    queryKey: ["classroom-enrollment", enrollmentId],
    queryFn: () => getClassroomEnrollment(enrollmentId),
    enabled: enrollmentId.length > 0,
  });

  const sortedAttachments = useMemo(() => {
    const list = [...(query.data?.attachments ?? [])];
    if (sortOrder === "newest") list.reverse();
    return list;
  }, [query.data?.attachments, sortOrder]);

  useLayoutEffect(() => {
    const title =
      query.data?.title?.trim() ||
      (query.data?.description ? "Matrícula livre" : "Materiais");
    navigation.setOptions({ title });
  }, [navigation, query.data?.title, query.data?.description]);

  if (!enrollmentId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-center text-slate-700">Matrícula inválida.</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View
        className="flex-1 justify-center bg-slate-100 px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-center text-base text-red-800">
          {axiosErrorMessage(query.error, "Não foi possível carregar os materiais.")}
        </Text>
      </View>
    );
  }

  if (query.isPending || !query.data) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <Text className="text-slate-600">A carregar…</Text>
      </View>
    );
  }

  const e = query.data;

  return (
    <ScrollView
      className="flex-1 bg-slate-100"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Text className="text-xs font-semibold uppercase text-slate-500">Matrícula livre</Text>
      <Text className="mt-1 text-xl font-bold text-slate-900">
        {e.title?.trim() || "Materiais"}
      </Text>

      <Text className="mt-2 text-sm text-slate-600">
        {e.startedAt ? `Início: ${new Date(e.startedAt).toLocaleDateString("pt-BR")}` : ""}
        {e.endedAt ? ` · Fim: ${new Date(e.endedAt).toLocaleDateString("pt-BR")}` : ""}
      </Text>

      {e.description?.trim() ? (
        <View className="mt-6">
          <Text className="mb-2 text-base font-semibold text-slate-900">Mensagem</Text>
          <HtmlBlock html={e.description} minHeight={260} />
        </View>
      ) : null}

      {sortedAttachments.length ? (
        <View className="mt-6">
          <View className="mb-3 flex-row flex-wrap items-center gap-2">
            <Text className="text-sm text-slate-600">Ordenar:</Text>
            <Pressable
              className={`rounded-lg px-2 py-1 ${sortOrder === "oldest" ? "bg-indigo-100" : "bg-white"}`}
              onPress={() => setSortOrder("oldest")}
            >
              <Text className="text-xs font-medium text-slate-800">Mais antigos</Text>
            </Pressable>
            <Pressable
              className={`rounded-lg px-2 py-1 ${sortOrder === "newest" ? "bg-indigo-100" : "bg-white"}`}
              onPress={() => setSortOrder("newest")}
            >
              <Text className="text-xs font-medium text-slate-800">Mais recentes</Text>
            </Pressable>
          </View>
          <AttachmentButtons attachments={sortedAttachments} title="Materiais" />
        </View>
      ) : !e.description?.trim() ? (
        <Text className="mt-6 text-sm text-slate-600">Sem materiais nesta matrícula.</Text>
      ) : null}
    </ScrollView>
  );
}
