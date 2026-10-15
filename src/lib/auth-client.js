import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000"; // Build time static fallback
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { useSession } = authClient;