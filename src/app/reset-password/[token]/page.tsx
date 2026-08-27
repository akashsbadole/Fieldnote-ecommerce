"use client";

import { useActionState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordAction, type ActionResult } from "@/actions/password-reset-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/login");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <span className="font-mono text-xs tracking-widest text-rust">ACCOUNT RECOVERY</span>
      <h1 className="mt-1 font-display text-3xl">Choose a new password</h1>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            New password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-6 text-center font-mono text-xs text-muted">
        <Link href="/login" className="text-ink underline underline-offset-4 hover:text-forest">
          Back to login
        </Link>
      </p>
    </div>
  );
}
