import Link from "next/link";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/profile", label: "Profile & addresses" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-line pb-6">
        <span className="font-mono text-xs tracking-widest text-rust">YOUR ACCOUNT</span>
        <h1 className="mt-1 font-display text-4xl">Dashboard</h1>
      </div>
      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="space-y-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block border-b border-line py-2 font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-forest md:border-b-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
