import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://bazar-dor-a7-rajib.vercel.app",
});

export const { useSession, signIn, signOut, signUp } = authClient;