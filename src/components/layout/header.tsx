"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart-store";
import { SearchBox } from "./search-box";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products", label: "All Gear" },
  { href: "/categories/packs", label: "Packs" },
  { href: "/categories/outerwear", label: "Outerwear" },
  { href: "/categories/tools", label: "Tools" },
];

export function Header() {
  const { data: session } = useSession();
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.itemCount());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const displayCount = hydrated ? itemCount : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <button
            className="cursor-pointer md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl tracking-tight text-ink">
              Fieldnote
            </span>
            <span className="hidden font-mono text-[0.65rem] text-rust sm:inline">
              No. 03
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            className="cursor-pointer text-ink-soft hover:text-forest"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="group relative">
            <Link
              href={session ? "/account" : "/login"}
              aria-label={session ? "Account" : "Log in"}
              className="flex cursor-pointer text-ink-soft hover:text-forest"
            >
              <User className="h-5 w-5" />
            </Link>
            {session && (
              <div className="invisible absolute right-0 top-full z-10 w-44 border border-line bg-paper py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <p className="truncate border-b border-line px-3 py-2 font-mono text-xs text-muted">
                  {session.user?.email || session.user?.name}
                </p>
                <Link href="/account" className="block px-3 py-2 text-sm hover:bg-sand-light">
                  My account
                </Link>
                <Link href="/account/orders" className="block px-3 py-2 text-sm hover:bg-sand-light">
                  Orders
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-sand-light">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-sand-light"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <NotificationBell />

          <button
            aria-label={`Open cart, ${displayCount} items`}
            className="relative cursor-pointer text-ink-soft hover:text-forest"
            onClick={openCart}
            suppressHydrationWarning
          >
            <ShoppingBag className="h-5 w-5" />
            {displayCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust font-mono text-[0.6rem] text-paper">
                {displayCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-paper px-4 py-3">
          <SearchBox onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden border-t border-line md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-line py-3 font-mono text-xs uppercase tracking-wider text-ink-soft"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
