import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-forest text-sand-light">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <span className="font-display text-2xl text-paper">Fieldnote</span>
            <p className="mt-3 max-w-xs font-mono text-xs leading-relaxed text-sand">
              Gear tested outdoors, not in a studio. Built to be repaired,
              not replaced.
            </p>
            <form className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                required
                placeholder="you@trailmail.com"
                className="w-full border border-sand/40 bg-transparent px-3 py-2 font-mono text-xs text-paper placeholder:text-sand/60 outline-none focus-visible:outline-rust"
              />
              <button className="shrink-0 bg-rust px-4 font-mono text-xs uppercase tracking-wide text-paper hover:bg-rust-dark cursor-pointer">
                Join
              </button>
            </form>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-sand">Shop</h3>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li><Link href="/products" className="hover:text-paper">All gear</Link></li>
              <li><Link href="/categories/packs" className="hover:text-paper">Packs</Link></li>
              <li><Link href="/categories/outerwear" className="hover:text-paper">Outerwear</Link></li>
              <li><Link href="/categories/tools" className="hover:text-paper">Tools</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-sand">Company</h3>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li><Link href="/about" className="hover:text-paper">About</Link></li>
              <li><Link href="/blog" className="hover:text-paper">Field notes</Link></li>
              <li><Link href="/track-order" className="hover:text-paper">Track order</Link></li>
              <li><Link href="/contact" className="hover:text-paper">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-paper">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-paper">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-paper">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-sand/20 pt-6 font-mono text-[0.65rem] text-sand/70 sm:flex-row">
          <span>© {new Date().getFullYear()} Fieldnote Supply Co.</span>
          <span>Coordinates unknown, but always headed outside.</span>
        </div>
      </div>
    </footer>
  );
}
