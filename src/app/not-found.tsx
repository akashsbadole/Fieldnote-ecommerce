import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center">
      <span className="font-mono text-xs tracking-widest text-rust">LOST THE TRAIL</span>
      <h1 className="font-display text-6xl">404</h1>
      <p className="font-body text-ink-soft">
        This page wandered off the map. Let&apos;s get you back to camp.
      </p>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Back to home
      </Link>
    </div>
  );
}
