import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Newspaper,
  FileText,
  Settings,
  Percent,
  Star,
  Ticket,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/settings/tax", label: "Tax rates", icon: Percent },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="w-52 shrink-0 print:hidden">
        <div className="mb-6">
          <span className="font-mono text-xs tracking-widest text-rust">ADMIN</span>
          <h1 className="font-display text-2xl">Fieldnote HQ</h1>
        </div>
        <nav className="space-y-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 border-b border-line py-2.5 font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-forest"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="mt-6 block font-mono text-xs text-muted hover:text-forest"
        >
          ← Back to store
        </Link>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
