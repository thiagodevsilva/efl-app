import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "../constants/config";
import { useSessionStore } from "../store/useSessionStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthUrl(url?: string) {
  if (!url) return false;
  const paths = [
    "/auth/login",
    "/auth/register",
    "/auth/confirm",
    "/auth/resend-confirmation",
    "/auth/request-password-reset",
    "/auth/reset-password",
  ];
  return paths.some((p) => url.includes(p));
}

let refreshPromise: Promise<void> | null = null;

async function runRefresh() {
  const refreshToken = useSessionStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error("Sem refresh token");
  }
  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${API_BASE_URL}/auth/refresh`,
    { refresh: refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 15_000 },
  );
  await useSessionStore.getState().setAccessToken(data.access);
  if (data.refresh) {
    await useSessionStore.getState().setRefreshToken(data.refresh);
  }
}

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (status === 401 && original?._retry) {
      await useSessionStore.getState().clearSession();
      return Promise.reject(error);
    }

    if (!original || original._retry || isAuthUrl(original.url)) {
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = runRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      original._retry = true;
      return api(original);
    } catch {
      await useSessionStore.getState().clearSession();
      return Promise.reject(error);
    }
  },
);
