import { createAuthClient } from "better-auth/react";

// Fallback logic for Next.js Static Prerendering on Vercel
const getBaseUrl = () => {
  // 1. Browser runtime
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // 2. Vercel deployment environment variable
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (appUrl) {
    return appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  }

  // 3. Fallback for Vercel Static Page Prerendering phase
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { useSession, signIn, signOut, signUp } = authClient;