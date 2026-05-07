import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

// Better Auth catch-all handler for Vercel Serverless Functions
// Handles all routes under /api/auth/* (sign-in, sign-up, sign-out, session, etc.)
const handler = toNodeHandler(auth);

export default handler;
