import { redirect } from "next/navigation";

export default function DashboardProductsNewRedirectPage() {
  redirect("/dashboard/products?create=1");
}
