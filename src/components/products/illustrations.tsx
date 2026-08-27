// Hand-built line-art illustrations, standing in for photography. Each is
// a real illustrated form (not an icon glyph) so the catalog reads as
// "editorial field-guide drawing" rather than a placeholder box. Swap
// these for real product photography via Cloudinary/Uploadthing when
// available — see ProductArt below for the integration point.

const STROKE = "var(--color-ink)";
const FILL = "var(--color-paper)";
const ACCENT = "var(--color-forest)";

export function BackpackIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} fill="none">
      {/* back straps */}
      <path d="M 110 95 Q 100 60 130 45" stroke={STROKE} strokeWidth="2.5" />
      <path d="M 190 95 Q 200 60 170 45" stroke={STROKE} strokeWidth="2.5" />
      {/* main body */}
      <rect x="85" y="90" width="130" height="150" rx="22" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
      {/* top lid */}
      <path d="M 85 120 Q 150 100 215 120 L 215 100 Q 150 82 85 100 Z" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
      {/* front pocket */}
      <rect x="105" y="165" width="90" height="55" rx="14" fill="none" stroke={STROKE} strokeWidth="2" />
      {/* buckle */}
      <rect x="140" y="185" width="20" height="14" rx="3" fill="none" stroke={ACCENT} strokeWidth="2" />
      {/* side compression straps */}
      <path d="M 85 150 L 70 155 L 70 195 L 85 200" stroke={STROKE} strokeWidth="2" fill="none" />
      <path d="M 215 150 L 230 155 L 230 195 L 215 200" stroke={STROKE} strokeWidth="2" fill="none" />
      {/* stitch line */}
      <path
        d="M 95 100 L 205 100"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      />
    </svg>
  );
}

export function JacketIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} fill="none">
      {/* torso */}
      <path
        d="M 120 90 L 110 95 L 70 130 L 90 155 L 105 140 L 100 235 Q 150 250 200 235 L 195 140 L 210 155 L 230 130 L 190 95 L 180 90 Q 150 105 120 90 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* collar */}
      <path d="M 120 90 Q 150 110 180 90 L 172 78 Q 150 92 128 78 Z" fill={FILL} stroke={STROKE} strokeWidth="2" />
      {/* zipper */}
      <path d="M 150 100 L 150 235" stroke={ACCENT} strokeWidth="2" strokeDasharray="2 4" />
      <circle cx="150" cy="108" r="3.5" fill={ACCENT} />
      {/* pockets */}
      <path d="M 108 175 L 138 172" stroke={STROKE} strokeWidth="2" />
      <path d="M 162 172 L 192 175" stroke={STROKE} strokeWidth="2" />
      {/* cuffs */}
      <path d="M 92 152 L 82 165" stroke={STROKE} strokeWidth="2" />
      <path d="M 208 152 L 218 165" stroke={STROKE} strokeWidth="2" />
    </svg>
  );
}

export function ToolIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} fill="none">
      {/* handle body */}
      <rect x="95" y="130" width="110" height="34" rx="10" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
      {/* rivets */}
      <circle cx="115" cy="147" r="3" fill={STROKE} />
      <circle cx="185" cy="147" r="3" fill={STROKE} />
      {/* folded blade */}
      <path d="M 205 138 L 240 128 L 242 136 L 208 148 Z" fill={FILL} stroke={STROKE} strokeWidth="2" />
      {/* folded plier arm */}
      <path d="M 95 138 L 62 122 L 60 130 L 92 148 Z" fill={FILL} stroke={STROKE} strokeWidth="2" />
      {/* grip texture */}
      <path d="M 120 130 L 120 164 M 135 130 L 135 164 M 165 130 L 165 164 M 180 130 L 180 164" stroke={ACCENT} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}
