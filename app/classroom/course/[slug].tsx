import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { AttachmentButtons } from "../../../components/classroom/AttachmentButtons";
import { HtmlBlock } from "../../../components/classroom/HtmlBlock";
import { LessonMediaSection } from "../../../components/classroom/LessonMediaSection";
import { axiosErrorMessage } from "../../../lib/axiosMessage";
import {
  getClassroomCourse,
  type LessonForClassroom,
} from "../../../services/classroom";

export default function CourseClassroomScreen() {
  const { slug: slugParam } = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = typeof slugParam === "string" ? slugParam : slugParam?.[0] ?? "";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const query = useQuery({
    queryKey: ["classroom-course", slug],
    queryFn: () => getClassroomCourse(slug),
    enabled: slug.length > 0,
  });

  const lessons = useMemo(() => {
    const list = query.data?.lessons ?? [];
    return [...list].sort((a, b) => a.order - b.order);
  }, [query.data?.lessons]);

  const [lessonId, setLessonId] = useState<string | null>(null);
  const currentLesson: LessonForClassroom | null = useMemo(() => {
    if (!lessons.length) return null;
    if (lessonId) {
      return lessons.find((l) => l.id === lessonId) ?? lessons[0];
    }
    return lessons[0];
  }, [lessons, lessonId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: query.data?.title ?? "Sala do curso",
    });
  }, [navigation, query.data?.title]);

  if (!slug) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-center text-slate-700">Curso inválido.</Text>
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
          {axiosErrorMessage(query.error, "Não foi possível carregar a sala.")}
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

  const course = query.data;
  const att = currentLesson?.attachments?.filter(Boolean) ?? [];

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-28 border-b border-slate-200 bg-white py-2"
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {lessons.map((l) => {
          const active = currentLesson?.id === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLessonId(l.id)}
              className={`rounded-full px-3 py-2 ${active ? "bg-indigo-600" : "bg-slate-100"}`}
            >
              <Text
                className={`text-xs font-semibold ${active ? "text-white" : "text-slate-800"}`}
                numberOfLines={2}
              >
                {l.order}. {l.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {!currentLesson ? (
          <Text className="text-slate-600">Este curso ainda não tem aulas.</Text>
        ) : (
          <>
            <LessonMediaSection videoPath={currentLesson.videoPath} />

            <View className="mt-4">
              <Text className="text-xl font-bold text-slate-900">
                {currentLesson.order}. {currentLesson.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-500">Curso: {course.title}</Text>
            </View>

            {currentLesson.htmlContent ? (
              <View className="mt-4">
                <Text className="mb-2 text-sm font-semibold text-slate-800">Descrição</Text>
                <HtmlBlock html={currentLesson.htmlContent} minHeight={240} />
              </View>
            ) : currentLesson.content ? (
              <View className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <Text className="text-sm font-semibold text-slate-800">Descrição</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-700">{currentLesson.content}</Text>
              </View>
            ) : null}

            {att.length ? (
              <View className="mt-4">
                <AttachmentButtons attachments={att} title="Materiais da aula" />
              </View>
            ) : null}

            <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-base font-semibold text-slate-900">Exercícios</Text>
              <Text className="mt-1 text-sm text-slate-600">
                Pratique com listas temáticas na área de exercícios.
              </Text>
              <Pressable
                className="mt-3 self-start rounded-lg bg-indigo-600 px-3 py-2 active:bg-indigo-700"
                onPress={() => router.push("/(tabs)")}
              >
                <Text className="text-sm font-semibold text-white">Ir para exercícios</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
