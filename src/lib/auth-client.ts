import { createAuthClient } from 'better-auth/react'

// ============================================================
// Better Auth browser client
// Used by frontend components for sign-in, sign-up, sign-out.
// The baseURL must match BETTER_AUTH_URL on the server.
// In production this is the Vercel deployment URL.
// ============================================================

export const authClient = createAuthClient({
  // Same origin in production — Vercel Functions live at /api/auth/*
  // No baseURL needed when frontend and API are on the same domain.
  // Set explicitly only if running API on a different port locally.
  baseURL: import.meta.env.VITE_APP_URL ?? undefined,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
