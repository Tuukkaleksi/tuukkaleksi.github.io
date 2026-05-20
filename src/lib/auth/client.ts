"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        callsign: { type: "string" },
      },
    }),
  ],
});

export const { signIn, signOut, useSession, requestPasswordReset, resetPassword, sendVerificationEmail } =
  authClient;

export type PilotSession = typeof authClient.$Infer.Session;

export function isPilotVerified(session: PilotSession | null): boolean {
  return Boolean(session?.user?.emailVerified);
}

export function getPilotCallsign(session: PilotSession | null): string | null {
  if (!session?.user) return null;
  const user = session.user as { callsign?: string; name?: string };
  return user.callsign ?? user.name ?? null;
}
