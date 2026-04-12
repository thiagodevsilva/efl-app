const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

/** Base da API (`efl-api` usa PORT padrão 8085). */
export const API_BASE_URL =
  fromEnv && fromEnv.length > 0 ? fromEnv : "http://localhost:8085";
