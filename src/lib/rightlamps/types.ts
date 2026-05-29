export type RightlampsProduct = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  brand?: string;
  category?: string;
  description?: string;
  price: number;
  /** ISO 4217 — used when rendering storefront prices from dashboard inventory. */
  currency?: string;
  costPrice?: number;
  countInStock: number;
  sold?: number;
  rating?: number;
  numReviews?: number;
};
