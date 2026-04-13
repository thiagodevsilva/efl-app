import axios from "axios";

import { API_BASE_URL } from "../constants/config";
import { useSessionStore, type SessionUser } from "../store/useSessionStore";

type LoginResponse = {
  access: string;
  refresh?: string;
  user: SessionUser;
};

const plainClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

export async function login(params: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const { data } = await plainClient.post<LoginResponse>(
    "/auth/login",
    {
      email: params.email.trim(),
      password: params.password,
      rememberMe: params.rememberMe ?? false,
    },
    { headers: { "X-EFL-Mobile": "1" } },
  );
  if (!data.refresh) {
    throw new Error("Resposta de login sem refresh (mobile).");
  }
  await useSessionStore.getState().setSession({
    access: data.access,
    refresh: data.refresh,
    user: data.user,
  });
  return data;
}

export async function logout() {
  const refresh = useSessionStore.getState().refreshToken;
  try {
    if (refresh) {
      await plainClient.post("/auth/logout", { refresh });
    }
  } finally {
    await useSessionStore.getState().clearSession();
  }
}
