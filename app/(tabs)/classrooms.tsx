import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { axiosErrorMessage } from "../../lib/axiosMessage";
import { listMyCourses } from "../../services/classroom";
import type {
  MyClassItem,
  MyCourseItem,
  StandaloneEnrollmentItem,
} from "../../services/classroom";

function stripHtmlPreview(html: string | null | undefined, max = 100): string {
  if (!html) return "";
  const plain = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

function CourseCard({ item }: { item: MyCourseItem }) {
  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-4 active:bg-slate-50"
      onPress={() =>
        router.push({
          pathname: "/classroom/course/[slug]",
          params: { slug: item.slug },
        })
      }
    >
      <Text className="text-lg font-semibold text-slate-900" numberOfLines={2}>
        {item.title}
      </Text>
      {item.status ? (
        <Text className="mt-1 text-xs text-slate-500">Estado: {item.status}</Text>
      ) : null}
      {typeof item.progress === "number" ? (
        <Text className="mt-1 text-xs text-slate-600">Progresso: {Math.round(item.progress)}%</Text>
      ) : null}
      <Text className="mt-3 text-sm font-medium text-indigo-600">Entrar na sala →</Text>
    </Pressable>
  );
}

function ClassCard({ item }: { item: MyClassItem }) {
  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-4 active:bg-slate-50"
      onPress={() =>
        router.push({ pathname: "/classroom/class/[id]", params: { id: item.id } })
      }
    >
      <Text className="text-lg font-semibold text-slate-900" numberOfLines={2}>
        {item.name}
      </Text>
      {item.level ? (
        <Text className="mt-1 text-xs text-slate-500">Nível: {item.level}</Text>
      ) : null}
      <Text className="mt-3 text-sm font-medium text-indigo-600">Sala da turma →</Text>
    </Pressable>
  );
}

function EnrollmentCard({ item }: { item: StandaloneEnrollmentItem }) {
  const title =
    item.title?.trim() ||
    stripHtmlPreview(item.description) ||
    "Matrícula livre";
  return (
    <Pressable
      className="mb-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-4 active:bg-slate-50"
      onPress={() =>
        router.push({
          pathname: "/classroom/enrollment/[id]",
          params: { id: item.id },
        })
      }
    >
      <Text className="text-lg font-semibold text-slate-900" numberOfLines={2}>
        {title}
      </Text>
      <Text className="mt-1 text-xs text-slate-500">
        {item.startedAt ? new Date(item.startedAt).toLocaleDateString("pt-BR") : ""}
        {item.endedAt ? ` – ${new Date(item.endedAt).toLocaleDateString("pt-BR")}` : ""}
      </Text>
      <Text className="mt-3 text-sm font-medium text-indigo-600">Ver materiais →</Text>
    </Pressable>
  );
}

export default function ClassroomsHubScreen() {
  const insets = useSafeAreaInsets();
  const query = useQuery({
    queryKey: ["my-classrooms"],
    queryFn: listMyCourses,
  });

  const sortedCourses = useMemo(
    () => [...(query.data?.courses ?? [])].sort((a, b) => a.title.localeCompare(b.title)),
    [query.data?.courses],
  );
  const sortedClasses = useMemo(
    () => [...(query.data?.classes ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [query.data?.classes],
  );
  const sortedEnrollments = useMemo(
    () => [...(query.data?.standaloneEnrollments ?? [])],
    [query.data?.standaloneEnrollments],
  );

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }

  const err =
    query.isError && !query.isPending
      ? axiosErrorMessage(query.error, "Não foi possível carregar as suas aulas.")
      : null;

  return (
    <View className="flex-1 bg-slate-100" style={{ paddingTop: insets.top }}>
      <View className="border-b border-slate-200 bg-white px-4 py-4">
        <Text className="text-2xl font-bold text-slate-900">Minhas aulas</Text>
        <Text className="mt-1 text-sm text-slate-600">
          Cursos, turmas e materiais da sua matrícula.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        {query.isPending && !query.data ? (
          <Text className="py-8 text-center text-slate-600">A carregar…</Text>
        ) : null}

        {err ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm text-red-800">{err}</Text>
            <Pressable className="mt-2" onPress={() => void query.refetch()}>
              <Text className="text-sm font-semibold text-indigo-600">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        <Text className="mb-2 text-lg font-semibold text-slate-900">Meus cursos</Text>
        {!sortedCourses.length && !query.isPending ? (
          <Text className="mb-6 text-sm text-slate-600">
            Ainda não tem cursos listados. Quando estiver matriculado, aparecem aqui.
          </Text>
        ) : (
          <View className="mb-8">{sortedCourses.map((c) => <CourseCard key={c.id} item={c} />)}</View>
        )}

        {sortedClasses.length ? (
          <>
            <Text className="mb-2 text-lg font-semibold text-slate-900">Minhas turmas</Text>
            <View className="mb-8">
              {sortedClasses.map((c) => (
                <ClassCard key={c.id} item={c} />
              ))}
            </View>
          </>
        ) : null}

        {sortedEnrollments.length ? (
          <>
            <Text className="mb-2 text-lg font-semibold text-slate-900">Matrículas livres</Text>
            <Text className="mb-2 text-xs text-slate-500">Materiais enviados para si.</Text>
            <View className="mb-8">
              {sortedEnrollments.map((e) => (
                <EnrollmentCard key={e.id} item={e} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
