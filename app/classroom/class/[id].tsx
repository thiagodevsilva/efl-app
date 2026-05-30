import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { AttachmentButtons } from "../../../components/classroom/AttachmentButtons";
import { HtmlBlock } from "../../../components/classroom/HtmlBlock";
import { LessonMediaSection } from "../../../components/classroom/LessonMediaSection";
import { axiosErrorMessage } from "../../../lib/axiosMessage";
import { uploadsPublicUrl } from "../../../services/mediaUrl";
import { getClassroomClass, type ClassLessonForClassroom } from "../../../services/classroom";
import { parseVideoEmbedFromUrl } from "../../../lib/videoEmbed";
import { EmbedWebView } from "../../../components/classroom/EmbedWebView";
import { attachmentOpenUrl } from "../../../lib/classroomUrls";

export default function ClassClassroomScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const classId = typeof idParam === "string" ? idParam : idParam?.[0] ?? "";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const query = useQuery({
    queryKey: ["classroom-class", classId],
    queryFn: () => getClassroomClass(classId),
    enabled: classId.length > 0,
  });

  const lessons = useMemo(() => {
    const list = query.data?.lessons ?? [];
    return [...list].sort((a, b) => a.order - b.order);
  }, [query.data?.lessons]);

  const modules = query.data?.modules ?? [];

  function formatScheduled(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const [lessonId, setLessonId] = useState<string | null>(null);
  const currentLesson: ClassLessonForClassroom | null = useMemo(() => {
    if (!lessons.length) return null;
    if (lessonId) {
      return lessons.find((l) => l.id === lessonId) ?? lessons.find((l) => l.isReleased !== false) ?? lessons[0];
    }
    return lessons.find((l) => l.isReleased !== false) ?? lessons[0];
  }, [lessons, lessonId]);

  const classAttachments = query.data?.attachments ?? [];
  const hasClassAttachmentsOnly = !lessons.length && classAttachments.length > 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: query.data?.name ?? "Turma",
    });
  }, [navigation, query.data?.name]);

  if (!classId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-center text-slate-700">Turma inválida.</Text>
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
          {axiosErrorMessage(query.error, "Não foi possível carregar a turma.")}
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

  const cls = query.data;
  const lessonHtml = currentLesson?.htmlContent ?? currentLesson?.description;

  return (
    <View className="flex-1 bg-slate-100">
      {lessons.length || modules.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-28 border-b border-slate-200 bg-white py-2"
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {modules.length
            ? modules.flatMap((mod) =>
                mod.lessons.map((l) => ({ ...l, moduleTitle: mod.title })),
              ).map((l) => {
                const active = currentLesson?.id === l.id;
                const locked = l.isReleased === false;
                return (
                  <Pressable
                    key={l.id}
                    disabled={locked}
                    onPress={() => !locked && setLessonId(l.id)}
                    className={`rounded-full px-3 py-2 ${active ? "bg-indigo-600" : locked ? "bg-slate-50 opacity-60" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${active ? "text-white" : "text-slate-800"}`}
                      numberOfLines={2}
                    >
                      {l.order}. {l.title}
                    </Text>
                    {locked && l.scheduledAt ? (
                      <Text className="text-[10px] text-slate-500">{formatScheduled(l.scheduledAt)}</Text>
                    ) : null}
                  </Pressable>
                );
              })
            : lessons.map((l) => {
                const active = currentLesson?.id === l.id;
                const locked = l.isReleased === false;
                return (
                  <Pressable
                    key={l.id}
                    disabled={locked}
                    onPress={() => !locked && setLessonId(l.id)}
                    className={`rounded-full px-3 py-2 ${active ? "bg-indigo-600" : locked ? "bg-slate-50 opacity-60" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${active ? "text-white" : "text-slate-800"}`}
                      numberOfLines={2}
                    >
                      {l.order}. {l.title}
                    </Text>
                    {locked && l.scheduledAt ? (
                      <Text className="text-[10px] text-slate-500">{formatScheduled(l.scheduledAt)}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
        </ScrollView>
      ) : null}

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {cls.description || cls.level ? (
          <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-base font-semibold text-slate-900">Sobre a turma</Text>
            {cls.level ? (
              <Text className="mt-1 text-xs text-slate-600">Nível: {cls.level}</Text>
            ) : null}
            {cls.description ? (
              <Text className="mt-2 text-sm leading-6 text-slate-700">{cls.description}</Text>
            ) : null}
          </View>
        ) : null}

        {!currentLesson && !hasClassAttachmentsOnly ? (
          <Text className="text-slate-600">Esta turma ainda não tem aulas.</Text>
        ) : null}

        {hasClassAttachmentsOnly ? (
          <Text className="mb-2 text-sm text-slate-600">
            Esta turma ainda não tem aulas. Anexos disponíveis abaixo.
          </Text>
        ) : null}

        {currentLesson && currentLesson.isReleased === false ? (
          <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-sm text-amber-900">
              Esta aula será liberada em {formatScheduled(currentLesson.scheduledAt)}.
            </Text>
          </View>
        ) : null}

        {currentLesson && currentLesson.isReleased !== false ? (
          <>
            <LessonMediaSection
              videoPath={currentLesson.videoPath}
              videoUrl={currentLesson.videoUrl}
            />

            {currentLesson.imagePath ? (
              <View className="mt-4 overflow-hidden rounded-xl bg-white">
                <Image
                  source={{ uri: uploadsPublicUrl(currentLesson.imagePath) }}
                  className="h-64 w-full"
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <View className="mt-4">
              <Text className="text-xl font-bold text-slate-900">
                {currentLesson.order}. {currentLesson.title}
              </Text>
              <Text className="mt-1 text-xs text-slate-500">Turma: {cls.name}</Text>
            </View>

            {lessonHtml ? (
              <View className="mt-4">
                <Text className="mb-2 text-sm font-semibold text-slate-800">Descrição</Text>
                <HtmlBlock html={lessonHtml} minHeight={240} />
              </View>
            ) : null}

            {currentLesson.attachments?.length ? (
              <View className="mt-4">
                {currentLesson.attachments.map((att, idx) => {
                  const url = attachmentOpenUrl(att);
                  const embed =
                    att.kind === "URL" && att.url ? parseVideoEmbedFromUrl(att.url) : null;
                  return (
                    <View
                      key={`la-${idx}`}
                      className={`${idx > 0 ? "mt-4" : ""} rounded-2xl border border-slate-200 bg-white p-4`}
                    >
                      <Text className="mb-2 text-sm font-medium text-slate-900" numberOfLines={2}>
                        {att.name || "Anexo"}
                      </Text>
                      {embed ? <EmbedWebView embedSrc={embed.embedSrc} height={200} /> : null}
                      <Pressable
                        className="mt-2 self-start rounded-lg bg-indigo-600 px-3 py-2"
                        onPress={() => void Linking.openURL(url)}
                      >
                        <Text className="text-sm font-semibold text-white">
                          {att.kind === "FILE" ? "Abrir / transferir" : "Abrir link"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {currentLesson.links?.length ? (
              <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <Text className="mb-2 text-base font-semibold text-slate-900">Links</Text>
                {currentLesson.links.map((link, i) => (
                  <Pressable
                    key={`${link.url}-${i}`}
                    className="mb-2 py-1"
                    onPress={() => void Linking.openURL(link.url)}
                  >
                    <Text className="text-sm text-indigo-600" numberOfLines={2}>
                      {link.name || link.url}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {classAttachments.length ? (
          <View className="mt-4">
            <AttachmentButtons attachments={classAttachments} title="Anexos da turma" />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
