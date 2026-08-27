export const metadata = { title: "About — Fieldnote" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">ABOUT</span>
      <h1 className="mt-2 font-display text-4xl">A small catalog, on purpose.</h1>
      <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-ink-soft">
        <p>
          Fieldnote started as a shared spreadsheet of gear three of us kept
          repairing instead of replacing. Most outdoor brands chase seasonal
          drops; we went the other way and asked how few products we could
          sell if every one of them had to be worth keeping for a decade.
        </p>
        <p>
          Everything in the catalog goes through the same test: could someone
          fix this with a sewing kit and a Saturday afternoon? If not, we
          redesign it until they can. That&apos;s also why we run a lifetime
          repair program instead of a warranty with an expiration date.
        </p>
        <p>
          We&apos;re a small team shipping out of Portland, Oregon. If
          something we sold you needs a patch, a zipper, or an honest
          opinion about whether it&apos;s worth fixing, write to us — a
          person reads every message.
        </p>
      </div>
    </div>
  );
}
