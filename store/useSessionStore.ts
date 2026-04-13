import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { SECURE_STORE_KEYS } from "../constants/secureKeys";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  isHydrated: boolean;
  setSession: (p: {
    access: string;
    refresh: string;
    user: SessionUser;
  }) => Promise<void>;
  setAccessToken: (access: string) => Promise<void>;
  setRefreshToken: (refresh: string) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrateFromSecureStore: () => Promise<void>;
};

async function deleteSecure(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* key inexistente */
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,

  setSession: async ({ access, refresh, user }) => {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, access);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, refresh);
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.userJson,
      JSON.stringify(user),
    );
    set({
      accessToken: access,
      refreshToken: refresh,
      user,
    });
  },

  setAccessToken: async (access) => {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, access);
    set({ accessToken: access });
  },

  setRefreshToken: async (refresh) => {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, refresh);
    set({ refreshToken: refresh });
  },

  clearSession: async () => {
    await deleteSecure(SECURE_STORE_KEYS.accessToken);
    await deleteSecure(SECURE_STORE_KEYS.refreshToken);
    await deleteSecure(SECURE_STORE_KEYS.userJson);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  },

  hydrateFromSecureStore: async () => {
    const [access, refresh, rawUser] = await Promise.all([
      SecureStore.getItemAsync(SECURE_STORE_KEYS.accessToken),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.refreshToken),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.userJson),
    ]);
    let user: SessionUser | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as SessionUser;
      } catch {
        user = null;
      }
    }
    set({
      accessToken: access,
      refreshToken: refresh,
      user,
      isHydrated: true,
    });
  },
}));
