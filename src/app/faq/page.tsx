"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What's your return policy?",
    a: "30 days from delivery, worn or not, as long as it's in resellable condition. Repairs after that window run through our lifetime repair program instead.",
  },
  {
    q: "How does the lifetime repair program work?",
    a: "Send us anything you bought from Fieldnote and we'll repair it for the cost of materials — often free for small fixes like seams or zipper pulls.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently across India (all states & UTs). International shipping is on the roadmap.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard is 3–5 business days and free over ₹500 (₹70 flat otherwise). Express is 1–2 days for ₹180. GST 18% applies at checkout.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Yes, as long as it's still in Pending status — you can cancel it from your order page. Once it moves to Processing we've already started picking it.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <span className="font-mono text-xs tracking-widest text-rust">FAQ</span>
      <h1 className="mt-2 font-display text-4xl">Questions, answered</h1>

      <div className="mt-10 divide-y divide-line border-t border-line">
        {FAQS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
            >
              <span className="font-display text-lg">{item.q}</span>
              {open === i ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
            </button>
            {open === i && (
              <p className="pb-5 font-body text-sm leading-relaxed text-ink-soft">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
