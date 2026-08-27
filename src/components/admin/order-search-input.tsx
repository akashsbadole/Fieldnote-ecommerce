"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function OrderSearchInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value ? `/admin/orders?q=${encodeURIComponent(value)}` : "/admin/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search order ID, customer, email…"
          className="w-72 border border-line bg-transparent py-2 pl-8 pr-3 font-mono text-xs outline-none focus-visible:border-forest"
        />
      </div>
    </form>
  );
}
