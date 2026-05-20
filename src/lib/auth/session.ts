import { headers } from "next/headers";
import { getAuth, isAuthConfigured } from "@/lib/auth";

export async function getPilotSession() {
  if (!isAuthConfigured()) return null;
  const auth = getAuth();
  if (!auth) return null;

  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}
