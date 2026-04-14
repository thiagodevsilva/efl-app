/** Níveis CEFR — alinhado ao campo `ExerciseList.level` na API. */
export const EXERCISE_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type ExerciseLevel = (typeof EXERCISE_LEVELS)[number];

export const EXERCISE_LEVEL_LABELS: Record<ExerciseLevel, string> = {
  A1: "A1 — Iniciante",
  A2: "A2 — Básico",
  B1: "B1 — Intermediário",
  B2: "B2 — Intermediário superior",
  C1: "C1 — Avançado",
  C2: "C2 — Proficiente",
};
