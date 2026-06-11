import { api } from "./api";
import { uploadsPublicUrl } from "./mediaUrl";

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

export type MasteryTier = "none" | "done" | "bronze" | "silver" | "gold" | "diamond";

export type ExerciseListMyProgress = {
  completionCount: number;
  inProgress: boolean;
  masteryTier: MasteryTier;
  lastCompletedAt: string | null;
};

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
  myProgress?: ExerciseListMyProgress;
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
  return uploadsPublicUrl(path);
}

export async function listExerciseLists(params: {
  theme?: string;
  q?: string;
  level?: ExerciseListLevel;
  classId?: string;
  onlyMyClasses?: boolean;
  sort?: "default" | "leastPracticed" | "notDoneFirst" | "mostPracticed" | "levelAsc";
  progressFilter?: "all" | "notDone" | "inProgress" | "done";
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
