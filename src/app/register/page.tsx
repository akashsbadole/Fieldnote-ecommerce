"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerAction, type ActionResult } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
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
      <span className="font-mono text-xs tracking-widest text-rust">NEW HERE</span>
      <h1 className="mt-1 font-display text-3xl">Create an account</h1>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center font-mono text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4 hover:text-forest">
          Log in
        </Link>
      </p>
    </div>
  );
}
