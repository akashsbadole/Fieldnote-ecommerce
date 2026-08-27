export const metadata = { title: "Terms of Service — Fieldnote" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">LEGAL</span>
      <h1 className="mt-2 font-display text-4xl">Terms of Service</h1>
      <p className="mt-3 font-mono text-xs text-muted">Last updated: [DATE]</p>

      <div className="mt-4 border border-dashed border-line bg-paper-dim px-4 py-3 font-mono text-xs text-muted">
        This is drafted as a real, launch-shaped Terms of Service, not a
        single throwaway paragraph — but it is still a template, not legal
        advice. Have a lawyer licensed in your jurisdiction review and
        adapt it (state/country, arbitration clause enforceability, and
        consumer-protection carve-outs vary a lot) before relying on it
        for real transactions.
      </div>

      <div className="mt-8 space-y-8 font-body text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="mb-2 font-display text-xl text-ink">1. Acceptance of terms</h2>
          <p>
            By accessing or using the Fieldnote website (the &quot;Site&quot;) or
            placing an order, you agree to be bound by these Terms of
            Service and our Privacy Policy. If you do not agree, do not use
            the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">2. Accounts</h2>
          <p>
            You&apos;re responsible for maintaining the confidentiality of your
            account credentials and for all activity under your account.
            Notify us immediately at [SUPPORT EMAIL] of any unauthorized
            use. We may suspend or terminate accounts that violate these
            terms, provide false information, or are used for fraudulent
            activity.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">3. Orders and pricing</h2>
          <p>
            All orders are subject to acceptance and availability. Prices
            are listed in USD and may change without notice; the price
            charged is the price shown at the time your order is placed.
            In the event of a pricing or listing error, we reserve the
            right to cancel the order and issue a full refund, even after
            an order confirmation has been sent.
          </p>
          <p className="mt-2">
            Payment is processed at the time of order via our third-party
            payment processor (Stripe). We do not store your full card
            details on our servers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">4. Shipping and delivery</h2>
          <p>
            Estimated delivery windows shown at checkout are estimates, not
            guarantees. Risk of loss and title for items purchased pass to
            you upon our delivery to the shipping carrier. We are not
            responsible for carrier delays, but will assist with claims
            for items lost or damaged in transit.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">5. Returns and the repair program</h2>
          <p>
            Items may be returned within 30 days of delivery in resellable
            condition for a full refund to the original payment method.
            Beyond that window, items purchased from Fieldnote are eligible
            for our lifetime repair program at the cost of materials — see
            the FAQ page for details. This section does not limit any
            statutory return or warranty rights you have under the law of
            your jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">6. Intellectual property</h2>
          <p>
            All content on the Site — text, graphics, logos, and design —
            is owned by Fieldnote Supply Co. or its licensors and protected
            by intellectual property law. You may not reproduce,
            distribute, or create derivative works from Site content
            without our written permission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">7. Prohibited use</h2>
          <p>
            You agree not to use the Site to violate any law, infringe any
            party&apos;s rights, transmit malicious code, scrape or harvest
            data without permission, or interfere with the Site&apos;s normal
            operation, including attempting to bypass rate limits or
            security controls.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">8. Disclaimer of warranties</h2>
          <p>
            The Site is provided &quot;as is&quot; without warranties of any kind,
            express or implied, to the fullest extent permitted by law. We
            don&apos;t warrant that the Site will be uninterrupted, secure, or
            error-free.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Fieldnote Supply Co.
            will not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Site or
            products purchased through it. Our total liability for any
            claim will not exceed the amount you paid for the product
            giving rise to the claim. Nothing in these terms limits
            liability that cannot be limited under applicable law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">10. Governing law and disputes</h2>
          <p>
            These terms are governed by the laws of [STATE/COUNTRY],
            without regard to conflict-of-law principles. [Add your
            arbitration clause and venue selection here if applicable —
            enforceability of mandatory arbitration and class-action
            waivers varies significantly by jurisdiction and should be
            reviewed by counsel.]
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">11. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of
            the Site after changes take effect constitutes acceptance of
            the revised terms. Material changes will be noted with an
            updated &quot;last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl text-ink">12. Contact</h2>
          <p>
            Questions about these terms: [SUPPORT EMAIL] or our{" "}
            <a href="/contact" className="text-ink underline underline-offset-4 hover:text-forest">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
