import { redirect } from "next/navigation";

/** Legacy route — same entry as Pod Café “new product” from the catalog hub. */
export default function DashboardCreateRedirectPage() {
  redirect("/dashboard/products?create=1");
}
