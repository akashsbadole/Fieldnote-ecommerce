"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const RECENT_KEY = "fieldnote-recent-searches";
const POPULAR = ["Backpack", "Rain shell", "Multitool", "Headlamp"];

interface Suggestion {
  name: string;
  slug: string;
  price: number;
}

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  const current = getRecent().filter((t) => t.toLowerCase() !== term.toLowerCase());
  const next = [term, ...current].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function SearchBox({ onNavigate }: { onNavigate: () => void }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>(() => getRecent());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing derived suggestions when the query becomes too short to search, not synchronizing external state
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function go(term: string) {
    if (!term.trim()) return;
    pushRecent(term.trim());
    setRecent(getRecent());
    router.push(`/products?q=${encodeURIComponent(term.trim())}`);
    onNavigate();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(value);
  }

  const showDropdown = value.trim().length > 0 || recent.length > 0;

  return (
    <div className="mx-auto max-w-7xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="Search gear…"
          className="w-full border-b border-ink/30 bg-transparent py-1 font-body text-sm outline-none placeholder:text-muted"
        />
      </form>

      {showDropdown && (
        <div className="mt-3 max-h-80 overflow-y-auto">
          {value.trim().length >= 2 ? (
            <>
              {loading && <p className="py-2 font-mono text-xs text-muted">Searching…</p>}
              {!loading && suggestions.length === 0 && (
                <p className="py-2 font-mono text-xs text-muted">No matches for &quot;{value}&quot;.</p>
              )}
              <ul>
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <button
                      onClick={() => go(s.name)}
                      className="flex w-full cursor-pointer items-center justify-between py-2 text-left hover:text-forest"
                    >
                      <span className="font-body text-sm">{s.name}</span>
                      <span className="font-mono text-xs text-muted">{formatPrice(s.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="space-y-4">
              {recent.length > 0 && (
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                    Recent
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => go(term)}
                        className="cursor-pointer border border-line px-2.5 py-1 font-mono text-xs text-ink-soft hover:border-forest hover:text-forest"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                  Popular
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      onClick={() => go(term)}
                      className="cursor-pointer border border-line px-2.5 py-1 font-mono text-xs text-ink-soft hover:border-forest hover:text-forest"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
