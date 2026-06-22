import type { CSSProperties, ReactNode } from "react";

/**
 * Clezol-style section bands — alternating white / light gray.
 * Inline style + CSS class so backgrounds always paint (reference: clezol.com).
 */
export type SectionBandVariant =
  | "white"
  | "muted"
  | "fade-white-to-muted"
  | "fade-muted-to-white"
  | "muted-from-white";

const BAND_CLASS: Record<SectionBandVariant, string> = {
  white: "rlsgl-band--white",
  muted: "rlsgl-band--muted",
  "fade-white-to-muted": "rlsgl-band--fade-white-to-muted",
  "fade-muted-to-white": "rlsgl-band--fade-muted-to-white",
  "muted-from-white": "rlsgl-band--muted-from-white",
};

/** Visible gray — clearly distinct from white on all displays */
export const SECTION_MUTED = "#d4dae3";
export const SECTION_WHITE = "#ffffff";

const BAND_STYLES: Record<SectionBandVariant, CSSProperties> = {
  white: { backgroundColor: SECTION_WHITE },
  muted: { backgroundColor: SECTION_MUTED },
  "fade-white-to-muted": {
    background: `linear-gradient(180deg, ${SECTION_WHITE} 0%, ${SECTION_WHITE} 52%, ${SECTION_MUTED} 100%)`,
  },
  "fade-muted-to-white": {
    background: `linear-gradient(180deg, ${SECTION_MUTED} 0%, #e2e7ef 16%, ${SECTION_WHITE} 34%, ${SECTION_WHITE} 100%)`,
  },
  "muted-from-white": {
    background: `linear-gradient(180deg, ${SECTION_WHITE} 0%, #e0e5ed 14%, ${SECTION_MUTED} 32%, ${SECTION_MUTED} 100%)`,
  },
};

export function SectionBand({
  variant,
  id,
  className = "",
  children,
}: {
  variant: SectionBandVariant;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={BAND_STYLES[variant]}
      className={`block min-w-full ${BAND_CLASS[variant]} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

/** White card surface on gray section bands (Clezol / UNIPOD). */
export const cardOnBandClass =
  "rounded-[var(--radius)] border border-border bg-white shadow-card";
