import { redirect } from "next/navigation";

/** Legacy quote URL — order requests now live at /request-order */
export default async function CustomProductPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.product ? `?product=${encodeURIComponent(sp.product)}` : "";
  redirect(`/request-order${q}`);
}
