import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { ExerciseListQuestion } from "../../services/exercises";
import { parseTypePayload } from "../../utils/exercisePayload";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

type BaseProps = {
  question: ExerciseListQuestion;
  disabled?: boolean;
  revealCorrect?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
};

export function ExerciseQuestionFreeText({
  question,
  disabled,
  revealCorrect,
  onSubmit,
}: BaseProps) {
  const payload = useMemo(() => parseTypePayload(question), [question]);
  const correctAnswer = String(payload.correctAnswer ?? "").trim();
  const ignoreCase = !!payload.ignoreCase;
  const ignorePunctuation = !!payload.ignorePunctuation;
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
  }, [question.id]);

  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-slate-700">Sua resposta</Text>
      <TextInput
        className="min-h-[96px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
        multiline
        placeholder="Digite aqui…"
        placeholderTextColor="#94a3b8"
        editable={!disabled && !revealCorrect}
        value={value}
        onChangeText={setValue}
      />
      {revealCorrect && correctAnswer ? (
        <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Text className="text-sm font-medium text-emerald-800">Resposta esperada:</Text>
          <Text className="mt-1 text-base font-semibold text-emerald-900">{correctAnswer}</Text>
          {(ignoreCase || ignorePunctuation) && (
            <Text className="mt-1 text-xs text-emerald-800/80">
              {ignoreCase ? "Maiúsculas/minúsculas ignoradas." : ""}
              {ignoreCase && ignorePunctuation ? " " : ""}
              {ignorePunctuation ? "Pontuação ignorada na correção." : ""}
            </Text>
          )}
        </View>
      ) : null}
      {revealCorrect && !correctAnswer ? (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <Text className="text-sm font-medium text-amber-900">Gabarito não definido.</Text>
        </View>
      ) : null}
      {!revealCorrect ? (
        <Pressable
          className="mt-4 self-start rounded-lg bg-indigo-600 px-4 py-2.5 active:bg-indigo-700 disabled:opacity-40"
          disabled={disabled || !value.trim()}
          onPress={() => onSubmit({ value: value.trim() })}
        >
          <Text className="text-center text-base font-semibold text-white">Enviar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ExerciseQuestionMultipleChoice({
  question,
  disabled,
  revealCorrect,
  onSubmit,
  submittedOptionId,
}: BaseProps & { submittedOptionId?: string | null }) {
  const payload = useMemo(() => parseTypePayload(question), [question]);
  const options = (payload.options as Array<{ id: string; text: string }> | undefined) ?? [];
  const correctOptionId = String(payload.correctOptionId ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [question.id]);

  const wrongOptionId =
    revealCorrect && submittedOptionId && submittedOptionId !== correctOptionId
      ? submittedOptionId
      : null;

  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-slate-700">Escolha uma opção:</Text>
      {options.map((opt) => {
        let box = "border-slate-200 bg-white";
        if (!revealCorrect && selectedId === opt.id) box = "border-indigo-500 bg-indigo-50";
        if (revealCorrect && opt.id === correctOptionId) box = "border-emerald-500 bg-emerald-50";
        if (revealCorrect && opt.id === wrongOptionId) box = "border-red-400 bg-red-50";
        return (
          <Pressable
            key={opt.id}
            disabled={disabled || revealCorrect}
            onPress={() => setSelectedId(opt.id)}
            className={`mb-2 rounded-xl border px-3 py-3 ${box}`}
          >
            <Text className="text-base text-slate-800">{opt.text}</Text>
            {revealCorrect && opt.id === correctOptionId ? (
              <Text className="mt-1 text-xs font-semibold text-emerald-700">Correta</Text>
            ) : null}
            {revealCorrect && opt.id === wrongOptionId ? (
              <Text className="mt-1 text-xs font-semibold text-red-700">Sua resposta</Text>
            ) : null}
          </Pressable>
        );
      })}
      {!revealCorrect ? (
        <Pressable
          className="mt-2 self-start rounded-lg bg-indigo-600 px-4 py-2.5 active:bg-indigo-700 disabled:opacity-40"
          disabled={disabled || selectedId === null}
          onPress={() => {
            if (selectedId !== null) onSubmit({ optionId: selectedId });
          }}
        >
          <Text className="text-center text-base font-semibold text-white">Enviar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type FillPart = { type: string; value?: string };

export function ExerciseQuestionFillBlank({
  question,
  disabled,
  revealCorrect,
  onSubmit,
}: BaseProps) {
  const payload = useMemo(() => parseTypePayload(question), [question]);
  const parts = (payload.parts as FillPart[] | undefined) ?? [];
  const blankCount = useMemo(
    () => parts.filter((p) => p?.type === "blank").length,
    [parts],
  );
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    setValues(Array.from({ length: blankCount }, () => ""));
  }, [question.id, blankCount]);

  const allFilled = values.every((v) => v.trim().length > 0);

  const correctFullPhrase = parts
    .map((p) => (p?.type === "text" ? (p.value ?? "") : (p.value ?? "—")))
    .join("")
    .trim();

  const blankSlotByPartIndex = useMemo(() => {
    const m = new Map<number, number>();
    let b = 0;
    parts.forEach((part, i) => {
      if (part?.type === "blank") {
        m.set(i, b);
        b += 1;
      }
    });
    return m;
  }, [parts]);

  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-slate-700">Preencha as lacunas:</Text>
      <View className="flex-row flex-wrap items-end gap-y-2">
        {parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <Text key={`t-${i}`} className="text-base text-slate-800">
                {part.value ?? ""}
              </Text>
            );
          }
          const bi = blankSlotByPartIndex.get(i) ?? 0;
          return !revealCorrect ? (
            <TextInput
              key={`b-${i}`}
              className="mx-0.5 min-w-[72px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-base text-slate-900"
              editable={!disabled}
              value={values[bi] ?? ""}
              onChangeText={(t) => {
                setValues((prev) => {
                  const next = [...prev];
                  next[bi] = t;
                  return next;
                });
              }}
            />
          ) : (
            <Text
              key={`br-${i}`}
              className="mx-0.5 min-w-[72px] rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-center text-base text-slate-800"
            >
              {(values[bi] ?? "").trim() || "—"}
            </Text>
          );
        })}
      </View>
      {revealCorrect && correctFullPhrase ? (
        <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Text className="text-sm font-medium text-emerald-800">Frase correta:</Text>
          <Text className="mt-1 text-base font-semibold text-emerald-900">{correctFullPhrase}</Text>
        </View>
      ) : null}
      {!revealCorrect ? (
        <Pressable
          className="mt-4 self-start rounded-lg bg-indigo-600 px-4 py-2.5 active:bg-indigo-700 disabled:opacity-40"
          disabled={disabled || !allFilled}
          onPress={() => onSubmit({ values: values.map((v) => v.trim()) })}
        >
          <Text className="text-center text-base font-semibold text-white">Enviar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ExerciseQuestionSentenceBuilder({
  question,
  disabled,
  revealCorrect,
  onSubmit,
}: BaseProps) {
  const payload = useMemo(() => parseTypePayload(question), [question]);
  const correctWords = (payload.correctWords as string[] | undefined) ?? [];
  const correctSentence = correctWords.join(" ");
  const [pool, setPool] = useState<string[]>([]);
  const [sentence, setSentence] = useState<string[]>([]);

  useEffect(() => {
    const p = parseTypePayload(question);
    const words = ((p.correctWords as string[]) ?? []).slice();
    setPool(shuffle(words));
    setSentence([]);
  }, [question.id]);

  const userAttemptText = sentence.length ? sentence.join(" ") : "—";

  if (revealCorrect) {
    return (
      <View>
        <View className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Text className="text-xs text-slate-600">Sua resposta:</Text>
          <Text className="mt-1 text-base font-medium text-slate-900">{userAttemptText}</Text>
        </View>
        <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Text className="text-sm font-medium text-emerald-800">Ordem correta:</Text>
          <Text className="mt-1 text-base font-semibold text-emerald-900">{correctSentence}</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text className="mb-3 text-sm font-medium text-slate-700">
        Monte a frase tocando nas palavras na ordem correta:
      </Text>
      <View className="flex-row gap-3">
        <View className="min-h-[96px] flex-1 flex-row flex-wrap content-start gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3">
          {pool.map((word, idx) => (
            <Pressable
              key={`p-${word}-${idx}`}
              disabled={disabled}
              onPress={() => {
                const w = pool[idx]!;
                setPool((p) => p.filter((_, i) => i !== idx));
                setSentence((s) => [...s, w]);
              }}
              className="rounded-lg bg-white px-2 py-1.5 active:bg-slate-200"
            >
              <Text className="text-base text-slate-800">{word}</Text>
            </Pressable>
          ))}
        </View>
        <View className="min-h-[96px] flex-1 flex-row flex-wrap content-start gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-white p-3">
          {sentence.map((word, idx) => (
            <Pressable
              key={`s-${word}-${idx}`}
              disabled={disabled}
              onPress={() => {
                const w = sentence[idx]!;
                setSentence((s) => s.filter((_, i) => i !== idx));
                setPool((p) => [...p, w]);
              }}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 active:bg-indigo-100"
            >
              <Text className="text-base text-indigo-900">{word}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable
        className="mt-4 self-start rounded-lg bg-indigo-600 px-4 py-2.5 active:bg-indigo-700 disabled:opacity-40"
        disabled={disabled || sentence.length === 0}
        onPress={() => onSubmit({ words: [...sentence] })}
      >
        <Text className="text-center text-base font-semibold text-white">Enviar</Text>
      </Pressable>
    </View>
  );
}

export function ExerciseQuestionByType(
  props: BaseProps & { submittedOptionId?: string | null },
) {
  switch (props.question.type) {
    case "FREE_TEXT":
      return <ExerciseQuestionFreeText {...props} />;
    case "MULTIPLE_CHOICE":
      return <ExerciseQuestionMultipleChoice {...props} />;
    case "FILL_BLANK":
      return <ExerciseQuestionFillBlank {...props} />;
    case "SENTENCE_BUILDER":
      return <ExerciseQuestionSentenceBuilder {...props} />;
    default:
      return (
        <Text className="text-sm text-red-600">Tipo não suportado: {props.question.type}</Text>
      );
  }
}
