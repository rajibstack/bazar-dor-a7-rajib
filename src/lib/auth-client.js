import { createAuthClient } from "better-auth/react";

// Safe Base URL Resolution for Server Side, Prerendering, and Client
const getBaseUrl = () => {
  // 1. Client-side browser execution
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // 2. Production / Vercel deployment environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL}`;
  }

  // 3. Fallback for Static Page Generation / Prerendering build step
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { useSession, signIn, signOut, signUp } = authClient;