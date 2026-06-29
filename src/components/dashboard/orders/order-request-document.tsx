"use client";

import Image from "next/image";
import type { OrderRow } from "@/lib/dashboard/order-types";
import type { OrderRequestDetails } from "@/lib/orders/order-request-details";
import { company } from "@/lib/company/site-content";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { formatOrderDateShort } from "@/components/dashboard/orders/orders-utils";

type Props = {
  order: OrderRow;
  details: OrderRequestDetails;
};

function FieldRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 min-h-[1.25rem] border-b border-slate-300 pb-1 text-sm text-slate-900">
        {value || "—"}
      </dd>
    </div>
  );
}

function CheckOption({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-800">
      <span
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border border-slate-500 text-[10px] font-bold ${
          checked ? "bg-slate-900 text-white" : "bg-white text-transparent"
        }`}
        aria-hidden
      >
        ✓
      </span>
      {label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="order-request-doc-section">
      <h3 className="border-b border-slate-900 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function OrderRequestDocument({ order, details }: Props) {
  const isCompany = details.applicantType === "company";
  const attachmentCount = details.attachments?.length ?? 0;

  return (
    <article
      id={`order-request-doc-${order.id}`}
      className="order-request-document mx-auto w-full max-w-[210mm] bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
    >
      <header className="border-b-2 border-slate-900 px-8 pb-5 pt-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src={BRAND_LOGO}
              alt={BRAND_LOGO_ALT}
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <div>
              <p className="text-lg font-bold leading-tight">{company.name}</p>
              <p className="text-xs text-slate-600">{company.location}</p>
              <p className="text-xs text-slate-600">
                {company.phoneDisplay} · {company.email}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-mono text-sm font-bold text-slate-900">
              {order.id}
            </p>
            <p>Submitted {formatOrderDateShort(order.placedAt)}</p>
          </div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold tracking-tight">
          Product Order Request Form
        </h2>
      </header>

      <div className="space-y-6 px-8 py-6">
        <Section title="Applicant Type">
          <div className="flex flex-wrap gap-6">
            <CheckOption
              checked={!isCompany}
              label="Individual"
            />
            <CheckOption
              checked={isCompany}
              label="Company / Organization"
            />
          </div>
        </Section>

        <Section
          title={
            isCompany ? "Applicant Information — Company" : "Applicant Information — Individual"
          }
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            {isCompany ? (
              <>
                <FieldRow label="Company / Organization Name" value={details.companyName} />
                <FieldRow label="Contact Person" value={details.contactPerson} />
                <FieldRow label="Position / Title" value={details.contactTitle} />
                <FieldRow label="Email Address" value={order.customerEmail} />
                <FieldRow label="Phone Number" value={order.customerPhone} />
                <FieldRow label="Company Address" value={details.companyAddress} wide />
              </>
            ) : (
              <>
                <FieldRow label="Full Name" value={details.fullName} />
                <FieldRow label="Phone Number" value={order.customerPhone} />
                <FieldRow label="Email Address" value={order.customerEmail} />
                <FieldRow
                  label="National ID / Passport"
                  value={details.nationalId}
                />
                <FieldRow label="Address" value={details.address} wide />
              </>
            )}
            <FieldRow label="Country" value={details.country} />
          </dl>
        </Section>

        <Section title="Order Details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <FieldRow
              label="Product(s) Requested"
              value={order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}
              wide
            />
            <FieldRow label="Product Category" value={details.productCategory} />
            <FieldRow
              label="Quantity"
              value={order.items.reduce((sum, item) => sum + item.quantity, 0)}
            />
            <FieldRow
              label="Order Total"
              value={formatMoneyFromCents(order.totalCents, order.currency)}
            />
            <FieldRow
              label="Preferred Specifications"
              value={details.preferredSpecifications}
              wide
            />
          </dl>
          <div className="mt-4 flex flex-wrap gap-6">
            <CheckOption
              checked={details.customizationRequired}
              label="Customization required — Yes"
            />
            <CheckOption
              checked={!details.customizationRequired}
              label="Customization required — No"
            />
          </div>
          {details.customizationRequired && details.customizationDescription ? (
            <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed">
              {details.customizationDescription}
            </p>
          ) : null}
        </Section>

        <Section title="Delivery Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Delivery Address" value={details.deliveryAddress} wide />
            <FieldRow
              label="Preferred Delivery Date"
              value={
                details.preferredDeliveryDate
                  ? formatOrderDateShort(details.preferredDeliveryDate)
                  : null
              }
            />
            <FieldRow
              label="Special Delivery Instructions"
              value={details.specialDeliveryInstructions}
              wide
            />
          </dl>
        </Section>

        <Section title="Payment Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <FieldRow
              label="Preferred Payment Method"
              value={details.preferredPaymentMethod}
            />
            <FieldRow
              label="Purchase Order Number"
              value={details.purchaseOrderNumber}
            />
          </dl>
        </Section>

        {details.additionalNotes?.trim() ? (
          <Section title="Additional Information">
            <p className="text-sm leading-relaxed text-slate-800">
              {details.additionalNotes.trim()}
            </p>
          </Section>
        ) : null}

        {attachmentCount > 0 ? (
          <Section title="Attachments">
            <ul className="space-y-2 text-sm">
              {details.attachments!.map((file) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-200 py-2"
                >
                  <span>
                    {file.name}{" "}
                    <span className="text-slate-500">
                      ({Math.max(1, Math.round(file.size / 1024))} KB)
                    </span>
                  </span>
                  {file.dataUrl ? (
                    <a
                      href={file.dataUrl}
                      download={file.name}
                      className="order-request-doc-attachment-link text-xs font-semibold text-brand underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Metadata only</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section title="Declaration">
          <p className="text-sm leading-relaxed text-slate-700">
            I certify that the information provided is accurate and understand
            that submitting this form is a request for quotation/order and does
            not guarantee immediate acceptance.
          </p>
          <div className="mt-4 flex flex-wrap gap-6">
            <CheckOption checked={details.agreedToTerms} label="I agree to the Terms and Conditions" />
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <FieldRow label="Name" value={details.declarationName} />
            <FieldRow label="Signature" value="On file (electronic submission)" />
            <FieldRow
              label="Date"
              value={formatOrderDateShort(details.declarationDate)}
            />
          </dl>
        </Section>
      </div>

      <footer className="border-t border-slate-200 px-8 py-4 text-center text-[10px] text-slate-500">
        {company.name} · Product order request · {order.id} · Generated from
        dashboard
      </footer>
    </article>
  );
}

export function printOrderRequestDocument(orderId: string) {
  const root = document.getElementById(`order-request-doc-${orderId}`);
  if (!root) {
    window.print();
    return;
  }

  document.body.classList.add("order-request-printing");
  root.classList.add("order-request-document--printing");
  window.print();
  window.setTimeout(() => {
    document.body.classList.remove("order-request-printing");
    root.classList.remove("order-request-document--printing");
  }, 500);
}
