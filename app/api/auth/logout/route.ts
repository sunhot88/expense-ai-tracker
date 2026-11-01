import { destroySession } from "@/lib/session";

// POST /api/auth/logout
export async function POST() {
  await destroySession();
  return Response.json({ ok: true });
}
