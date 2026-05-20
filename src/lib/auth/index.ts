import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { authSchema } from "@/db/schema";
import { getDb, isDatabaseConfigured } from "@/db/index";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth/emails";
import { getAuthBaseUrl } from "@/lib/auth/urls";

export { getAuthBaseUrl } from "@/lib/auth/urls";

export function isAuthConfigured(): boolean {
  return isDatabaseConfigured() && Boolean(process.env.BETTER_AUTH_SECRET?.trim());
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuth(): ReturnType<typeof betterAuth> | null {
  if (!isAuthConfigured()) return null;

  if (!authInstance) {
    const db = getDb();
    if (!db) return null;

    const baseURL = getAuthBaseUrl();
    const trustedOrigins = [
      baseURL,
      process.env.NEXT_PUBLIC_SITE_URL?.trim(),
      "http://localhost:3000",
    ].filter((v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i);

    authInstance = betterAuth({
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL,
      trustedOrigins,
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema,
      }),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 10,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url }) => {
          void sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            url,
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          void sendVerificationEmail({
            to: user.email,
            name: user.name,
            url,
          });
        },
      },
      user: {
        additionalFields: {
          callsign: {
            type: "string",
            required: true,
            unique: true,
            input: true,
          },
        },
      },
      plugins: [nextCookies()],
    }) as unknown as ReturnType<typeof betterAuth>;
  }

  return authInstance;
}
