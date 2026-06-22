import { Fraunces } from "next/font/google";

/** Display serif for catalog headings — pairs with global Inter body */
export const storeDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});
