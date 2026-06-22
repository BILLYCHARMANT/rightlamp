import { redirect } from "next/navigation";

/** Production PV-GRID lands staff on `/pos` after sign-in — route to our dashboard. */
export default function PosEntryPage() {
  redirect("/dashboard");
}
