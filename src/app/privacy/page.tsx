export const metadata = { title: "Privacy Policy — Fieldnote" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">LEGAL</span>
      <h1 className="mt-2 font-display text-4xl">Privacy Policy</h1>
      <p className="mt-3 font-mono text-xs text-muted">Last updated: [DATE]</p>

      <div className="mt-4 border border-dashed border-line bg-paper-dim px-4 py-3 font-mono text-xs text-muted">
        This reflects what the app actually collects and how it&apos;s
        actually handled in this codebase — it isn&apos;t boilerplate copied
        from elsewhere. It still needs review by counsel before launch,
        especially the sections on regional rights (GDPR/CCPA) and any
        additional processors you add (analytics, ads, etc. aren&apos;t used
        here, but if you add them, this policy needs updating to match).
      </div>

      <div className="mt-8 space-y-8 font-body text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="mb-2 font-display text-xl text-ink">1. What we collect</h2>
          <p>When you create an account or place an order, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account info: name, email, and a hashed password (we never store your password in plain text)</li>
            <li>Order info: items purchased, shipping address, order status and history</li>
            <li>Content you provide: product reviews, contact form messages</li>
            <li>Payment info: handled entirely by Stripe — we receive a confirmation and a payment reference, never your full card number</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">2. How we use it</h2>
          <p>We use collected data to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and fulfill orders, including shipping and customer support</li>
            <li>Send transactional email: order confirmations, shipping updates, password resets, and account-related notices</li>
            <li>Maintain your account, cart, and wishlist</li>
            <li>Detect and prevent fraud and abuse (including automated rate limiting on login and checkout)</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information, and we do not use
            your data for ad targeting.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">3. Third parties we share data with</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Stripe</strong> — payment processing (receives billing details, never your full account password)</li>
            <li><strong>Resend</strong> — transactional email delivery (receives your email address and the content of the email being sent)</li>
            <li>Shipping carriers — your name and address, to deliver orders</li>
          </ul>
          <p className="mt-2">
            We don&apos;t share data with advertisers, data brokers, or
            analytics networks — none are integrated into this site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">4. Data retention</h2>
          <p>
            We retain account and order data for as long as your account is
            active, and for a reasonable period after for tax, accounting,
            and fraud-prevention purposes. Password reset tokens expire
            after 1 hour and are deleted on use. You can request deletion
            of your account at any time (see Section 6).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">5. Cookies</h2>
          <p>
            We use a session cookie to keep you logged in (via Auth.js) and
            local browser storage to persist your shopping cart between
            visits. We do not use tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">6. Your rights</h2>
          <p>
            Depending on where you live, you may have the right to access,
            correct, export, or delete your personal data, and to object to
            certain processing. To exercise any of these rights, contact us
            at [SUPPORT EMAIL] or via the{" "}
            <a href="/contact" className="text-ink underline underline-offset-4 hover:text-forest">
              contact page
            </a>
            . We&apos;ll respond within a reasonable time and consistent with
            applicable law (e.g. GDPR for EU/UK residents, CCPA/CPRA for
            California residents).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">7. Security</h2>
          <p>
            Passwords are hashed (never stored in plain text). Payment data
            never touches our servers directly — it&apos;s handled by Stripe.
            We apply rate limiting on login, registration, password reset,
            and checkout endpoints to reduce abuse. No system is perfectly
            secure, and we can&apos;t guarantee absolute security of
            information transmitted to the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">8. Children&apos;s privacy</h2>
          <p>
            The Site is not directed at children under 13 (or the relevant
            minimum age in your jurisdiction), and we do not knowingly
            collect data from children.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">9. Changes to this policy</h2>
          <p>
            We may update this policy from time to time; material changes
            will be reflected in the &quot;last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">10. Contact</h2>
          <p>
            Questions about this policy or your data: [SUPPORT EMAIL].
          </p>
        </section>
      </div>
    </div>
  );
}
