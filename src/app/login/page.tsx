"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginSchema, phoneSchema, type LoginInput, type PhoneInput } from "@/lib/validations";
import { requestOtpAction } from "@/actions/otp-actions";
import { Button } from "@/components/ui/button";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

function EmailLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setSubmitting(true);
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setSubmitting(false);

    if (res?.error) {
      toast.error("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
        <input
          {...register("email")}
          type="email"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
        {errors.email && <p className="mt-1 font-mono text-xs text-rust">{errors.email.message}</p>}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Password</label>
          <Link href="/forgot-password" className="font-mono text-xs text-muted hover:text-forest">
            Forgot?
          </Link>
        </div>
        <input
          {...register("password")}
          type="password"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
        {errors.password && (
          <p className="mt-1 font-mono text-xs text-rust">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}

function PhoneLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) });

  async function onRequestCode(data: PhoneInput) {
    setSubmitting(true);
    const res = await requestOtpAction(data.phone);
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setPhone(data.phone);
    setDevCode(res.devCode ?? null);
    setStep("code");
    toast.success(res.message);
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setSubmitting(false);

    if (res?.error) {
      toast.error("That code didn't work — check it and try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={onVerifyCode} className="mt-8 space-y-5">
        <p className="font-mono text-xs text-muted">
          Code sent to <span className="text-ink">{phone}</span>.{" "}
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="cursor-pointer text-forest underline underline-offset-4"
          >
            Change number
          </button>
        </p>
        {devCode && (
          <p className="border border-dashed border-line bg-paper-dim px-4 py-3 font-mono text-xs text-muted">
            SMS isn&apos;t configured in this environment — your code is{" "}
            <span className="text-ink">{devCode}</span>.
          </p>
        )}
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            6-digit code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoFocus
            maxLength={6}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-center font-mono text-lg tracking-[0.5em] outline-none focus-visible:border-forest"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting || code.length !== 6}>
          {submitting ? "Verifying…" : "Verify and log in"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onRequestCode)} className="mt-8 space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-muted">
          Phone number
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+15555550123"
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
        />
        {errors.phone && <p className="mt-1 font-mono text-xs text-rust">{errors.phone.message}</p>}
        <p className="mt-1 font-mono text-xs text-muted">
          International format, e.g. +1 for the US. New numbers create an
          account automatically — you stay signed in for 30 days.
        </p>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [mode, setMode] = useState<"email" | "phone">("email");

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <span className="font-mono text-xs tracking-widest text-rust">WELCOME BACK</span>
      <h1 className="mt-1 font-display text-3xl">Log in</h1>

      <div className="mt-6 flex border border-line font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setMode("email")}
          className={`flex-1 cursor-pointer py-2 ${mode === "email" ? "bg-forest text-paper" : "text-ink-soft"}`}
        >
          Email
        </button>
        <button
          onClick={() => setMode("phone")}
          className={`flex-1 cursor-pointer py-2 ${mode === "phone" ? "bg-forest text-paper" : "text-ink-soft"}`}
        >
          Phone
        </button>
      </div>

      {mode === "email" ? (
        <EmailLoginForm callbackUrl={callbackUrl} />
      ) : (
        <PhoneLoginForm callbackUrl={callbackUrl} />
      )}

      {mode === "email" && googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </>
      )}

      <p className="mt-6 border border-dashed border-line bg-paper-dim px-4 py-3 font-mono text-xs text-muted">
        Demo account — demo@fieldnote.co / password123
        <br />
        Admin account — admin@fieldnote.co / admin123
        <br />
        Demo phone — +15555550123 (code appears on screen after &quot;Send code&quot;)
      </p>

      <p className="mt-6 text-center font-mono text-xs text-muted">
        No account?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4 hover:text-forest">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
