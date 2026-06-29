"use client";

import { useRef } from "react";
import type { OrderRequestDetails } from "@/lib/orders/order-request-details";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/orders/order-request-details";
import {
  OrderRequestSectionTitle,
  orderRequestFieldBox,
  orderRequestFieldInput,
  orderRequestFieldLabel,
} from "@/components/orders/order-request-form";
import type { OrderPickupBranch } from "@/lib/dashboard/order-types";
import { formatBranchLocationOption } from "@/lib/dashboard/order-types";
import { MapPin } from "lucide-react";

type Props = {
  details: OrderRequestDetails;
  onChange: (patch: Partial<OrderRequestDetails>) => void;
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  branchId: string;
  onBranchChange: (value: string) => void;
  branches: OrderPickupBranch[];
  requiresBranch: boolean;
  productCategoryHint?: string;
};

function RadioOption({
  name,
  value,
  checked,
  label,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 border-slate-300 text-brand focus:ring-brand/30"
      />
      {label}
    </label>
  );
}

const MAX_FILES = 5;
const MAX_FILE_BYTES = 1_500_000;

export function OrderRequestDetailsStep({
  details,
  onChange,
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  branchId,
  onBranchChange,
  branches,
  requiresBranch,
  productCategoryHint,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const existing = details.attachments ?? [];
    const next = [...existing];

    for (const file of Array.from(files)) {
      if (next.length >= MAX_FILES) break;
      if (file.size > MAX_FILE_BYTES) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      next.push({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
      });
    }

    onChange({ attachments: next });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeAttachment(index: number) {
    const next = [...(details.attachments ?? [])];
    next.splice(index, 1);
    onChange({ attachments: next });
  }

  return (
    <div className="space-y-10">
      <section>
        <OrderRequestSectionTitle>Applicant type</OrderRequestSectionTitle>
        <div className="flex flex-wrap gap-6">
          <RadioOption
            name="applicantType"
            value="individual"
            checked={details.applicantType === "individual"}
            label="Individual"
            onChange={(value) =>
              onChange({ applicantType: value as OrderRequestDetails["applicantType"] })
            }
          />
          <RadioOption
            name="applicantType"
            value="company"
            checked={details.applicantType === "company"}
            label="Company / Organization"
            onChange={(value) =>
              onChange({ applicantType: value as OrderRequestDetails["applicantType"] })
            }
          />
        </div>
      </section>

      <section>
        <OrderRequestSectionTitle>Applicant information</OrderRequestSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          {details.applicantType === "individual" ? (
            <>
              <label className="block sm:col-span-2">
                <span className={orderRequestFieldLabel}>Full name</span>
                <input
                  required
                  value={details.fullName ?? ""}
                  onChange={(e) => onChange({ fullName: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block">
                <span className={orderRequestFieldLabel}>National ID / Passport (optional)</span>
                <input
                  value={details.nationalId ?? ""}
                  onChange={(e) => onChange({ nationalId: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block">
                <span className={orderRequestFieldLabel}>Country</span>
                <input
                  required
                  value={details.country ?? ""}
                  onChange={(e) => onChange({ country: e.target.value })}
                  placeholder="Rwanda"
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={orderRequestFieldLabel}>Address</span>
                <input
                  required
                  value={details.address ?? ""}
                  onChange={(e) => onChange({ address: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
            </>
          ) : (
            <>
              <label className="block sm:col-span-2">
                <span className={orderRequestFieldLabel}>Company / organization name</span>
                <input
                  required
                  value={details.companyName ?? ""}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block">
                <span className={orderRequestFieldLabel}>Contact person</span>
                <input
                  required
                  value={details.contactPerson ?? ""}
                  onChange={(e) => onChange({ contactPerson: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block">
                <span className={orderRequestFieldLabel}>Position / title</span>
                <input
                  value={details.contactTitle ?? ""}
                  onChange={(e) => onChange({ contactTitle: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={orderRequestFieldLabel}>Company address</span>
                <input
                  required
                  value={details.companyAddress ?? ""}
                  onChange={(e) => onChange({ companyAddress: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
              <label className="block">
                <span className={orderRequestFieldLabel}>Country</span>
                <input
                  required
                  value={details.country ?? ""}
                  onChange={(e) => onChange({ country: e.target.value })}
                  className={orderRequestFieldInput}
                />
              </label>
            </>
          )}

          <label className="block">
            <span className={orderRequestFieldLabel}>Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={orderRequestFieldInput}
            />
          </label>
          <label className="block">
            <span className={orderRequestFieldLabel}>Phone number</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className={orderRequestFieldInput}
            />
          </label>
        </div>
      </section>

      <section>
        <OrderRequestSectionTitle hint="Specifications for the products you selected in step 1.">
          Order details
        </OrderRequestSectionTitle>
        <div className="grid gap-5">
          <label className="block">
            <span className={orderRequestFieldLabel}>Product category</span>
            <input
              value={details.productCategory ?? productCategoryHint ?? ""}
              onChange={(e) => onChange({ productCategory: e.target.value })}
              placeholder="e.g. Solar, Lighting, Cables"
              className={orderRequestFieldBox}
            />
          </label>
          <label className="block">
            <span className={orderRequestFieldLabel}>
              Preferred specifications (size, color, material, dimensions…)
            </span>
            <textarea
              rows={3}
              value={details.preferredSpecifications ?? ""}
              onChange={(e) => onChange({ preferredSpecifications: e.target.value })}
              className={`${orderRequestFieldBox} resize-y`}
            />
          </label>
          <div>
            <p className={orderRequestFieldLabel}>Customization required?</p>
            <div className="mt-2 flex flex-wrap gap-6">
              <RadioOption
                name="customization"
                value="no"
                checked={!details.customizationRequired}
                label="No"
                onChange={() => onChange({ customizationRequired: false })}
              />
              <RadioOption
                name="customization"
                value="yes"
                checked={details.customizationRequired}
                label="Yes"
                onChange={() => onChange({ customizationRequired: true })}
              />
            </div>
          </div>
          {details.customizationRequired ? (
            <label className="block">
              <span className={orderRequestFieldLabel}>Customization requirements</span>
              <textarea
                required
                rows={3}
                value={details.customizationDescription ?? ""}
                onChange={(e) => onChange({ customizationDescription: e.target.value })}
                className={`${orderRequestFieldBox} resize-y`}
              />
            </label>
          ) : null}
        </div>
      </section>

      <section>
        <OrderRequestSectionTitle>Delivery information</OrderRequestSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          {branches.length > 0 ? (
            <label className="block sm:col-span-2">
              <span className={orderRequestFieldLabel}>
                Nearest branch / pickup location
                {requiresBranch ? (
                  <span className="text-[#c55316]"> *</span>
                ) : null}
              </span>
              <div className="relative mt-1">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <select
                  required={requiresBranch}
                  value={branchId}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className={`${orderRequestFieldBox} pl-9`}
                >
                  {!branchId ? (
                    <option value="" disabled>
                      Select branch
                    </option>
                  ) : null}
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {formatBranchLocationOption(branch)}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          ) : null}
          <label className="block sm:col-span-2">
            <span className={orderRequestFieldLabel}>Delivery address</span>
            <input
              required
              value={details.deliveryAddress}
              onChange={(e) => onChange({ deliveryAddress: e.target.value })}
              className={orderRequestFieldBox}
            />
          </label>
          <label className="block">
            <span className={orderRequestFieldLabel}>Preferred delivery date</span>
            <input
              type="date"
              value={details.preferredDeliveryDate ?? ""}
              onChange={(e) => onChange({ preferredDeliveryDate: e.target.value })}
              className={orderRequestFieldBox}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={orderRequestFieldLabel}>
              Special delivery instructions (optional)
            </span>
            <textarea
              rows={2}
              value={details.specialDeliveryInstructions ?? ""}
              onChange={(e) => onChange({ specialDeliveryInstructions: e.target.value })}
              className={`${orderRequestFieldBox} resize-y`}
            />
          </label>
        </div>
      </section>

      <section>
        <OrderRequestSectionTitle>Payment information</OrderRequestSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={orderRequestFieldLabel}>Preferred payment method</span>
            <select
              required
              value={details.preferredPaymentMethod}
              onChange={(e) => onChange({ preferredPaymentMethod: e.target.value })}
              className={orderRequestFieldBox}
            >
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          {details.applicantType === "company" ? (
            <label className="block">
              <span className={orderRequestFieldLabel}>
                Purchase order number (optional)
              </span>
              <input
                value={details.purchaseOrderNumber ?? ""}
                onChange={(e) => onChange({ purchaseOrderNumber: e.target.value })}
                className={orderRequestFieldBox}
              />
            </label>
          ) : null}
        </div>
      </section>

      <section>
        <OrderRequestSectionTitle>Additional information</OrderRequestSectionTitle>
        <label className="block">
          <span className={orderRequestFieldLabel}>
            Any other requirements or notes
          </span>
          <textarea
            rows={3}
            value={details.additionalNotes ?? ""}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            className={`${orderRequestFieldBox} resize-y`}
          />
        </label>
      </section>

      <section>
        <OrderRequestSectionTitle hint="Design files, logos, drawings, specs, or PO (max 1.5 MB each, up to 5 files).">
          Attachments (optional)
        </OrderRequestSectionTitle>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.doc,.docx,.dwg,.dxf"
          onChange={(e) => onFilesSelected(e.target.files)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-sm file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-slate-200"
        />
        {details.attachments?.length ? (
          <ul className="mt-3 space-y-2">
            {details.attachments.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-sm border border-slate-200 bg-slate-50/80 p-5">
        <OrderRequestSectionTitle>Declaration</OrderRequestSectionTitle>
        <p className="text-sm leading-relaxed text-slate-600">
          I certify that the information provided is accurate and understand that
          submitting this form is a request for quotation/order and does not
          guarantee immediate acceptance.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            required
            checked={details.agreedToTerms}
            onChange={(e) => onChange({ agreedToTerms: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
          />
          <span className="text-sm text-ink">I agree to the Terms and Conditions.</span>
        </label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={orderRequestFieldLabel}>Name</span>
            <input
              required
              value={details.declarationName}
              onChange={(e) => onChange({ declarationName: e.target.value })}
              className={orderRequestFieldBox}
            />
          </label>
          <label className="block">
            <span className={orderRequestFieldLabel}>Date</span>
            <input
              type="date"
              required
              value={details.declarationDate}
              onChange={(e) => onChange({ declarationDate: e.target.value })}
              className={orderRequestFieldBox}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
