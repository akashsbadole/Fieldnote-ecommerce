import { Package } from "lucide-react";
import {
  BackpackIllustration,
  JacketIllustration,
  ToolIllustration,
} from "./illustrations";

const ILLUSTRATIONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cat_packs: BackpackIllustration,
  cat_outerwear: JacketIllustration,
  cat_tools: ToolIllustration,
};

// Deterministic pseudo-random contour offsets seeded from the product id,
// so each card's background looks hand-drawn but stable across renders.
function seedFrom(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
}

export function ProductArt({
  productId,
  categoryId,
  className,
  imageUrl,
}: {
  productId: string;
  categoryId: string;
  className?: string;
  /** Real product photo URL — once wired to Cloudinary/Uploadthing, pass
   * it here and this component renders the photo instead of the line-art
   * fallback. Left undefined everywhere in this build. */
  imageUrl?: string;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt="" className={`${className ?? ""} object-cover`} />;
  }

  const Illustration = ILLUSTRATIONS[categoryId] ?? Package;
  const seed = seedFrom(productId);
  const lines = Array.from({ length: 5 }, (_, i) => {
    const base = 30 + i * 22 + ((seed + i * 37) % 12);
    return base;
  });

  return (
    <div
      className={
        "relative flex items-center justify-center overflow-hidden bg-sand-light " +
        (className ?? "")
      }
    >
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full opacity-25">
        {lines.map((y, i) => (
          <path
            key={i}
            d={`M -10 ${y} Q 75 ${y - 18 + (i % 2) * 10}, 150 ${y} T 310 ${y}`}
            fill="none"
            stroke="var(--color-forest)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <Illustration className="relative h-[78%] w-[78%]" />
      <span className="absolute bottom-2 right-2 font-mono text-[0.6rem] tracking-wide text-forest-dark/60">
        {String(seed).padStart(3, "0")}·N
      </span>
    </div>
  );
}
