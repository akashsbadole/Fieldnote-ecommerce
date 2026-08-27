"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            border: "none",
            borderRadius: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
          },
        }}
      />
    </SessionProvider>
  );
}
