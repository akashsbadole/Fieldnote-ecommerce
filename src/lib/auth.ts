import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
  getUserByEmail,
  getUserById,
  verifyPassword,
  getUserByPhone,
  createUserByPhone,
  verifyOtp,
  recordLogin,
} from "@/lib/data";
import { loginSchema, otpVerifySchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

const providers: Provider[] = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw, request) => {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      // 5 attempts per 5 minutes, keyed by the email being attempted (so
      // one bad actor can't lock out a real IP shared with other users,
      // e.g. behind a corporate NAT — but still stops credential stuffing
      // against a single account).
      const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const { allowed } = checkRateLimit(`login:${email.toLowerCase()}:${ip}`, 5, 5 * 60 * 1000);
      if (!allowed) {
        throw new Error("Too many login attempts. Try again in a few minutes.");
      }

      const user = await getUserByEmail(email);
      if (!user || user.blocked) return null;

      const valid = await verifyPassword(user, password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      };
    },
  }),
  Credentials({
    id: "phone-otp",
    name: "Phone",
    credentials: {
      phone: { label: "Phone", type: "text" },
      code: { label: "Code", type: "text" },
    },
    authorize: async (raw, request) => {
      const parsed = otpVerifySchema.safeParse(raw);
      if (!parsed.success) return null;

      const { phone, code } = parsed.data;

      const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const { allowed } = checkRateLimit(`otp-verify:${phone}:${ip}`, 8, 5 * 60 * 1000);
      if (!allowed) {
        throw new Error("Too many attempts. Try again in a few minutes.");
      }

      const valid = await verifyOtp(phone, code);
      if (!valid) return null;

      let user = await getUserByPhone(phone);
      if (!user) {
        user = await createUserByPhone({ phone });
      }
      if (user.blocked) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      };
    },
  }),
];

// Only registered when credentials are actually set — otherwise NextAuth
// throws at startup. Set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET to enable.
export const isGoogleConfigured = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);
if (isGoogleConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error("AUTH_SECRET must be set and at least 32 characters");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 30-day sessions. Requested specifically for the mobile OTP login flow,
  // and applied session-wide since NextAuth's JWT strategy configures
  // session length globally rather than per-provider — this also makes
  // password/Google logins "stay signed in" for a month rather than the
  // NextAuth default of ~1 month anyway, but the explicit value here is
  // deliberate rather than incidental.
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  jwt: { maxAge: THIRTY_DAYS },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.phone = (user as { phone?: string }).phone;
        await recordLogin(user.id as string);
        return token;
      }
      // Re-validate on every request: blocked users and role changes invalidate JWT
      if (token.id) {
        try {
          const fresh = await getUserById(token.id as string);
          if (!fresh || fresh.blocked) {
            (token as unknown as Record<string, unknown>).blocked = true;
            token.role = "CUSTOMER";
          } else if (fresh.role !== token.role) {
            token.role = fresh.role;
          }
        } catch {
          // On DB failure, keep existing token (fail open for availability)
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        session.user.phone = token.phone as string | undefined;
        (session.user as unknown as Record<string, unknown>).blocked = (token as unknown as Record<string, unknown>).blocked;
      }
      return session;
    },
  },
});
