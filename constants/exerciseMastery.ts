import type { ExerciseListMyProgress, MasteryTier } from "../services/exercises";

export const MASTERY_TIER_LABELS: Record<Exclude<MasteryTier, "none">, string> = {
  done: "Concluída",
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  diamond: "Diamante",
};

export const MASTERY_TIER_COLORS: Record<Exclude<MasteryTier, "none">, { bg: string; text: string }> = {
  done: { bg: "bg-emerald-100", text: "text-emerald-800" },
  bronze: { bg: "bg-amber-100", text: "text-amber-900" },
  silver: { bg: "bg-slate-200", text: "text-slate-700" },
  gold: { bg: "bg-yellow-100", text: "text-yellow-900" },
  diamond: { bg: "bg-indigo-100", text: "text-indigo-800" },
};

export function exerciseListCta(progress?: ExerciseListMyProgress): string {
  if (progress?.inProgress) return "Continuar";
  if ((progress?.completionCount ?? 0) > 0) return "Praticar de novo";
  return "Iniciar prática";
}

export type ExerciseListSort =
  | "default"
  | "leastPracticed"
  | "notDoneFirst"
  | "mostPracticed"
  | "levelAsc";

export type ExerciseListProgressFilter = "all" | "notDone" | "inProgress" | "done";

export const SORT_OPTIONS: { value: ExerciseListSort; label: string }[] = [
  { value: "default", label: "Padrão" },
  { value: "leastPracticed", label: "Menos praticadas" },
  { value: "notDoneFirst", label: "Não feitas primeiro" },
  { value: "mostPracticed", label: "Mais praticadas" },
  { value: "levelAsc", label: "Por nível" },
];

export const PROGRESS_FILTER_OPTIONS: { value: ExerciseListProgressFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "notDone", label: "Não feitas" },
  { value: "inProgress", label: "Em andamento" },
  { value: "done", label: "Feitas" },
];
