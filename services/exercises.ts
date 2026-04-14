import { API_BASE_URL } from "../constants/config";

import { api } from "./api";

export type ExerciseListQuestionType =
  | "FREE_TEXT"
  | "MULTIPLE_CHOICE"
  | "FILL_BLANK"
  | "SENTENCE_BUILDER";

export type SuggestedMedia = {
  type: "image" | "audio" | "video";
  description?: string;
};

export type ExerciseListQuestion = {
  id: string;
  exerciseListId: string;
  order: number;
  title?: string | null;
  description?: string | null;
  imagePath?: string | null;
  audioPath?: string | null;
  videoPath?: string | null;
  suggestedMedia?: SuggestedMedia | null;
  type: ExerciseListQuestionType;
  typePayload: Record<string, unknown>;
};

export type ExerciseListLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ExerciseListStatus = "DRAFT" | "PUBLISHED";

export type ExerciseList = {
  id: string;
  title: string;
  description?: string | null;
  theme: string;
  level: ExerciseListLevel;
  status: ExerciseListStatus;
  coverThemeSlug?: string | null;
  imagePath?: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: ExerciseListQuestion[];
};

export type ExerciseListAttemptStart = {
  attemptId: string;
  totalQuestions: number;
  queueLength: number;
  currentQuestion: ExerciseListQuestion;
};

export type ExerciseListsMeta = {
  page: number;
  limit: number;
  total: number;
};

/** URL pública para mídia da lista ou da questão (path relativo a `uploads/`). */
export function exerciseMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  const p = String(path).trim();
  if (/^https?:\/\//i.test(p)) return p;
  const rel = p.replace(/^\/+/, "");
  const prefix = rel.startsWith("uploads/") ? "" : "uploads/";
  const base = API_BASE_URL.replace(/\/$/, "");
  const slash = base.endsWith("/") ? "" : "/";
  return `${base}${slash}${prefix}${rel}`;
}

export async function listExerciseLists(params: {
  theme?: string;
  q?: string;
  level?: ExerciseListLevel;
  page?: number;
  limit?: number;
} = {}) {
  const { data } = await api.get<{
    data: ExerciseList[];
    meta: ExerciseListsMeta;
  }>("/exercise-lists", { params });
  return data;
}

export async function getExerciseList(id: string) {
  const { data } = await api.get<{ data: ExerciseList }>(`/exercise-lists/${id}`);
  return data.data;
}

export async function startExerciseAttempt(listId: string) {
  const { data } = await api.post<{ data: ExerciseListAttemptStart }>(
    `/exercise-lists/${listId}/start`,
  );
  return data.data;
}

export async function submitExerciseAnswer(
  attemptId: string,
  questionId: string,
  answerPayload: Record<string, unknown>,
) {
  const { data } = await api.post<{
    data: {
      correct: boolean;
      completed: boolean;
      errorCount: number;
      attemptCount: number;
      nextQuestion: ExerciseListQuestion | null;
      streakCurrent?: number;
      streakIncreased?: boolean;
    };
  }>(`/exercise-attempts/${attemptId}/answer`, { questionId, answerPayload });
  return data.data;
}
