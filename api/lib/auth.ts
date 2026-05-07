import { betterAuth } from "better-auth";

// Better Auth configured with direct PostgreSQL connection (Supabase Transaction Pooler)
// Uses pg provider — Supabase uses PostgreSQL under the hood
// DATABASE_URL must point to Transaction Pooler (port 6543), NOT Direct connection (5432)
// because Vercel Functions are serverless and require pgBouncer-compatible connections.
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",

  secret: process.env.BETTER_AUTH_SECRET,

  database: {
    provider: "pg",
    url: process.env.DATABASE_URL!,
  },

  // Email + password — primary auth method for Gymbro
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Session via secure httpOnly cookie
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  // Trust proxy headers from Vercel
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
