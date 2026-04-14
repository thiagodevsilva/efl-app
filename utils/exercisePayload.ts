import type { ExerciseListQuestion } from "../services/exercises";

/** API pode devolver `typePayload` como objeto ou string JSON (igual ao web). */
export function parseTypePayload(question: ExerciseListQuestion): Record<string, unknown> {
  const p = question.typePayload as unknown;
  if (p == null) return {};
  if (typeof p === "string") {
    try {
      return JSON.parse(p) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof p === "object") return p as Record<string, unknown>;
  return {};
}
