import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim();
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return "http://localhost:3000"; // Safe build-time static fallback
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const useSession = authClient.useSession;
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;