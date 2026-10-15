import { createAuthClient } from "better-auth/react";

const getValidBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;

  if (envUrl) {
    try {
      const formatted = envUrl.trim().startsWith("http")
        ? envUrl.trim()
        : `https://${envUrl.trim()}`;
      new URL(formatted); // Validates if it's a real URL
      return formatted;
    } catch (e) {
      // If Vercel env is invalid, fallback below
    }
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getValidBaseUrl(),
});

export const { useSession, signIn, signOut, signUp } = authClient;