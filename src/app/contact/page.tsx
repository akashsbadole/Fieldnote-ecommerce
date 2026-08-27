"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent — we'll reply within a couple of days.");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">GET IN TOUCH</span>
      <h1 className="mt-2 font-display text-4xl">Contact us</h1>
      <p className="mt-3 font-body text-sm text-ink-soft">
        Order questions, repair requests, or just want to talk gear.
      </p>

      {submitted ? (
        <div className="mt-8 border border-forest bg-forest/5 px-4 py-4 font-mono text-sm text-forest">
          Thanks — your message is in. We reply within 2 business days.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Name</label>
            <input
              required
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted">Message</label>
            <textarea
              required
              rows={5}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-forest"
            />
          </div>
          <Button type="submit" size="lg">
            Send message
          </Button>
        </form>
      )}
    </div>
  );
}
