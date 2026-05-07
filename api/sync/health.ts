import type { VercelRequest, VercelResponse } from "@vercel/node";
import { auth } from "../lib/auth.js";

// GET /api/sync/health
// Returns server health + auth status for the current session.
// No auth required — used by frontend to check if backend is reachable.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      authenticated: session !== null,
      userId: session?.user?.id ?? null,
    });
  } catch {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      authenticated: false,
      userId: null,
    });
  }
}
