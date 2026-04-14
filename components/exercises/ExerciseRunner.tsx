import { isAxiosError } from "axios";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandedBootScreen } from "../BrandedBootScreen";
import {
  exerciseMediaUrl,
  getExerciseList,
  startExerciseAttempt,
  submitExerciseAnswer,
  type ExerciseListQuestion,
} from "../../services/exercises";
import { ExerciseQuestionByType } from "./ExerciseQuestionViews";

function messageFromUnknown(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const data = err.response?.data as { message?: unknown } | undefined;
  return typeof data?.message === "string" ? data.message : undefined;
}

function goBackToLists() {
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)");
}

type Props = { listId: string };

export function ExerciseRunner({ listId }: Props) {
  const [listTitle, setListTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ExerciseListQuestion | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [revealWrong, setRevealWrong] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] =
    useState<ExerciseListQuestion | null>(null);
  const [lastSubmittedOptionId, setLastSubmittedOptionId] = useState<string | null>(null);

  const [completed, setCompleted] = useState(false);
  const [finalErrorCount, setFinalErrorCount] = useState(0);
  const [finalAttemptCount, setFinalAttemptCount] = useState(0);

  const loadStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setRevealWrong(false);
    setPendingNextQuestion(null);
    setLastSubmittedOptionId(null);
    setCompleted(false);
    setAnsweredCount(0);
    try {
      const [meta, start] = await Promise.all([
        getExerciseList(listId),
        startExerciseAttempt(listId),
      ]);
      setListTitle(meta.title);
      setAttemptId(start.attemptId);
      setTotalQuestions(start.totalQuestions);
      setCurrentQuestion(start.currentQuestion);
    } catch (e) {
      setError(messageFromUnknown(e) ?? "Não foi possível iniciar a lista.");
      setAttemptId(null);
      setCurrentQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    void loadStart();
  }, [loadStart]);

  function clearWrongState() {
    setRevealWrong(false);
    setPendingNextQuestion(null);
    setLastSubmittedOptionId(null);
    setFeedback(null);
  }

  function continueAfterWrong() {
    setCurrentQuestion(pendingNextQuestion);
    clearWrongState();
    setError(null);
  }

  async function onSubmitAnswer(payload: Record<string, unknown>) {
    if (!attemptId || !currentQuestion || submitting || revealWrong) return;
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    setLastSubmittedOptionId(
      currentQuestion.type === "MULTIPLE_CHOICE" && typeof payload.optionId === "string"
        ? payload.optionId
        : null,
    );
    try {
      const res = await submitExerciseAnswer(attemptId, currentQuestion.id, payload);
      setFeedback(res.correct);
      if (res.correct) {
        setAnsweredCount((c) => c + 1);
      }
      if (res.completed) {
        clearWrongState();
        setCompleted(true);
        setFinalErrorCount(res.errorCount);
        setFinalAttemptCount(res.attemptCount);
        if (res.streakIncreased && res.streakCurrent != null) {
          Alert.alert(
            "Sequência",
            `Boa! Sua sequência de estudos: ${res.streakCurrent} dia(s).`,
            [{ text: "OK" }],
          );
        }
        return;
      }
      if (res.correct) {
        setRevealWrong(false);
        setPendingNextQuestion(null);
        setLastSubmittedOptionId(null);
        setCurrentQuestion(res.nextQuestion ?? null);
        setTimeout(() => setFeedback(null), 1500);
      } else {
        setPendingNextQuestion(res.nextQuestion ?? null);
        setRevealWrong(true);
      }
    } catch (e) {
      setError(messageFromUnknown(e) ?? "Erro ao enviar resposta.");
      setLastSubmittedOptionId(null);
    } finally {
      setSubmitting(false);
    }
  }

  const progressText =
    totalQuestions > 0 ? `${answeredCount} de ${totalQuestions} questões acertadas` : "";

  if (loading) {
    return <BrandedBootScreen message="A preparar a lista e as questões…" />;
  }

  if (error && !attemptId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
        <View className="border-b border-slate-200 bg-slate-50 px-2 py-3">
          <Pressable hitSlop={12} className="self-start px-2 py-2" onPress={goBackToLists}>
            <Text className="text-base font-medium text-slate-800">← Voltar</Text>
          </Pressable>
        </View>
        <View className="flex-1 justify-center px-6">
          <Text className="text-center text-base text-red-700">{error}</Text>
          <Pressable
            className="mt-6 items-center rounded-xl bg-slate-900 py-3"
            onPress={() => void loadStart()}
          >
            <Text className="font-semibold text-white">Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <View className="border-b border-slate-200 bg-slate-50 px-2 py-2">
        <View className="flex-row items-center gap-2">
          <Pressable hitSlop={12} className="rounded-lg px-2 py-2" onPress={goBackToLists}>
            <Text className="text-base font-medium text-slate-800">← Voltar</Text>
          </Pressable>
          <View className="min-w-0 flex-1">
            <Text className="text-center text-sm font-semibold text-slate-900" numberOfLines={1}>
              {listTitle || "Lista"}
            </Text>
            {progressText ? (
              <Text className="text-center text-xs text-slate-600">{progressText}</Text>
            ) : null}
          </View>
          <View className="w-14" />
        </View>
      </View>

      {completed ? (
        <ScrollView className="flex-1 px-5 py-8" contentContainerStyle={{ paddingBottom: 32 }}>
          <Text className="text-center text-xl font-bold text-slate-900">Lista concluída!</Text>
          <Text className="mt-2 text-center text-base text-slate-600">
            Você acertou {answeredCount} de {totalQuestions} questões nesta volta.
          </Text>
          <Text className="mt-1 text-center text-sm text-slate-500">
            Tentativas de resposta: {finalAttemptCount} · Erros: {finalErrorCount}
          </Text>
          <Pressable
            className="mt-8 items-center rounded-xl bg-indigo-600 py-3.5 active:bg-indigo-700"
            onPress={goBackToLists}
          >
            <Text className="text-base font-semibold text-white">Voltar às listas</Text>
          </Pressable>
        </ScrollView>
      ) : currentQuestion ? (
        <ScrollView
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {error ? (
            <Text className="mb-3 text-center text-sm text-red-600">{error}</Text>
          ) : null}
          <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {currentQuestion.title ? (
              <Text className="text-base font-semibold text-slate-900">{currentQuestion.title}</Text>
            ) : null}
            {currentQuestion.description ? (
              <Text className="mt-2 text-sm leading-5 text-slate-600">{currentQuestion.description}</Text>
            ) : null}
            {currentQuestion.imagePath ? (
              <Image
                source={{ uri: exerciseMediaUrl(currentQuestion.imagePath) }}
                style={{ marginTop: 12, maxHeight: 192, width: "100%", borderRadius: 12 }}
                resizeMode="contain"
              />
            ) : null}
            {currentQuestion.audioPath ? (
              <Pressable
                className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                onPress={() => void Linking.openURL(exerciseMediaUrl(currentQuestion.audioPath))}
              >
                <Text className="text-sm font-medium text-indigo-700">Abrir áudio</Text>
              </Pressable>
            ) : null}
            {currentQuestion.videoPath ? (
              <Pressable
                className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                onPress={() => void Linking.openURL(exerciseMediaUrl(currentQuestion.videoPath))}
              >
                <Text className="text-sm font-medium text-indigo-700">Abrir vídeo</Text>
              </Pressable>
            ) : null}

            <View className="mt-4 border-t border-slate-100 pt-4">
              <ExerciseQuestionByType
                key={currentQuestion.id}
                question={currentQuestion}
                disabled={submitting || revealWrong}
                revealCorrect={revealWrong}
                submittedOptionId={lastSubmittedOptionId}
                onSubmit={(p) => void onSubmitAnswer(p)}
              />
            </View>
          </View>

          {feedback !== null ? (
            <View className="mt-4">
              <View
                className={`rounded-xl px-4 py-3 ${
                  feedback ? "border border-emerald-200 bg-emerald-50" : "border border-amber-200 bg-amber-50"
                }`}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    feedback ? "text-emerald-900" : "text-amber-900"
                  }`}
                >
                  {feedback
                    ? "Acertou!"
                    : "Errou. Confira acima. Esta questão volta para o final da fila."}
                </Text>
              </View>
              {!feedback && revealWrong ? (
                <Pressable
                  className="mt-4 items-center rounded-xl bg-indigo-600 py-3 active:bg-indigo-700"
                  onPress={continueAfterWrong}
                >
                  <Text className="text-base font-semibold text-white">Continuar</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-slate-600">Nenhuma questão para exibir.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
