import Link from "next/link";
import { storeDisplay } from "@/components/store/store-fonts";

export default function CustomProductPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1">
      <h1
        className={`${storeDisplay.className} text-3xl font-semibold text-ink sm:text-4xl`}
      >
        Request a custom product
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Tell us what you need — specifications, quantities, and timeline. Wire
        this form to email or WhatsApp when you are ready.
      </p>

      <form
        className="mt-10 space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
        action="#"
        method="post"
      >
        <label className="block text-sm font-semibold text-ink">
          Name
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Email or phone
          <input
            name="contact"
            required
            className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          What do you need?
          <textarea
            name="details"
            required
            rows={5}
            className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-brand/94 py-3 text-sm font-semibold text-ink shadow-md shadow-brand/8 ring-1 ring-brand/15 hover:bg-brand-hover sm:w-auto sm:px-12"
        >
          Submit request (demo)
        </button>
        <p className="text-xs text-muted-foreground">
          Demo only — connect to Resend, WhatsApp, or your CRM.
        </p>
      </form>

      <p className="mt-10 text-center text-sm">
        <Link href="/shop" className="font-semibold text-accent hover:text-accent-muted">
          Browse standard catalog
        </Link>
      </p>
    </main>
  );
}
