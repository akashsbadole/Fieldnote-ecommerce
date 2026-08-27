"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPasswordAction, type ActionResult } from "@/actions/password-reset-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  useEffect(() => {
    if (state.message) toast.success(state.message);
  }, [state]);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <span className="font-mono text-xs tracking-widest text-rust">ACCOUNT RECOVERY</span>
      <h1 className="mt-1 font-display text-3xl">Reset your password</h1>
      <p className="mt-3 font-mono text-xs text-muted">
        Enter your email and we&apos;ll send a reset link.
      </p>

      {state.success ? (
        <div className="mt-8 border border-forest bg-forest/5 px-4 py-4 font-mono text-sm text-forest">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center font-mono text-xs text-muted">
        <Link href="/login" className="text-ink underline underline-offset-4 hover:text-forest">
          Back to login
        </Link>
      </p>
    </div>
  );
}
