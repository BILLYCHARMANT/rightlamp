export type ApplicantType = "individual" | "company";

export type OrderRequestAttachment = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

export type OrderRequestDetails = {
  applicantType: ApplicantType;
  fullName?: string;
  nationalId?: string;
  address?: string;
  country?: string;
  companyName?: string;
  contactPerson?: string;
  contactTitle?: string;
  companyAddress?: string;
  productCategory?: string;
  preferredSpecifications?: string;
  customizationRequired: boolean;
  customizationDescription?: string;
  deliveryAddress: string;
  preferredDeliveryDate?: string;
  specialDeliveryInstructions?: string;
  preferredPaymentMethod: string;
  purchaseOrderNumber?: string;
  additionalNotes?: string;
  agreedToTerms: boolean;
  declarationName: string;
  declarationDate: string;
  attachments?: OrderRequestAttachment[];
};

export const PAYMENT_METHOD_OPTIONS = [
  "Bank transfer",
  "Mobile money",
  "Cash on delivery",
  "Cheque",
  "Purchase order / invoice",
  "Other",
] as const;

export function emptyOrderRequestDetails(): OrderRequestDetails {
  const today = new Date().toISOString().slice(0, 10);
  return {
    applicantType: "individual",
    customizationRequired: false,
    deliveryAddress: "",
    preferredPaymentMethod: PAYMENT_METHOD_OPTIONS[0],
    agreedToTerms: false,
    declarationName: "",
    declarationDate: today,
  };
}

export function validateOrderRequestDetails(
  details: OrderRequestDetails,
): string | null {
  if (details.applicantType === "individual") {
    if (!details.fullName?.trim()) return "Full name is required.";
    if (!details.address?.trim()) return "Address is required.";
  } else {
    if (!details.companyName?.trim()) return "Company name is required.";
    if (!details.contactPerson?.trim()) return "Contact person is required.";
    if (!details.companyAddress?.trim()) return "Company address is required.";
  }

  if (!details.country?.trim()) return "Country is required.";
  if (!details.deliveryAddress?.trim()) return "Delivery address is required.";
  if (!details.preferredPaymentMethod?.trim()) {
    return "Preferred payment method is required.";
  }

  if (details.customizationRequired && !details.customizationDescription?.trim()) {
    return "Describe your customization requirements.";
  }

  if (!details.agreedToTerms) {
    return "You must agree to the terms and conditions.";
  }
  if (!details.declarationName?.trim()) return "Declaration name is required.";
  if (!details.declarationDate?.trim()) return "Declaration date is required.";

  return null;
}

export function resolveCustomerNameFromDetails(
  details: OrderRequestDetails,
): string {
  if (details.applicantType === "company") {
    return details.contactPerson?.trim() || details.companyName?.trim() || "";
  }
  return details.fullName?.trim() || "";
}

export function buildRequestDetailsNotes(
  details: OrderRequestDetails,
  productSummary: string,
): string {
  const lines: string[] = [
    "── Product order request ──",
    `Applicant: ${details.applicantType === "company" ? "Company / Organization" : "Individual"}`,
  ];

  if (details.applicantType === "individual") {
    lines.push(
      `Name: ${details.fullName ?? "—"}`,
      `ID/Passport: ${details.nationalId?.trim() || "—"}`,
      `Address: ${details.address ?? "—"}`,
    );
  } else {
    lines.push(
      `Organization: ${details.companyName ?? "—"}`,
      `Contact: ${details.contactPerson ?? "—"} (${details.contactTitle?.trim() || "—"})`,
      `Company address: ${details.companyAddress ?? "—"}`,
    );
  }

  lines.push(
    `Country: ${details.country ?? "—"}`,
    "",
    "── Order ──",
    productSummary,
    `Category: ${details.productCategory?.trim() || "—"}`,
    `Specifications: ${details.preferredSpecifications?.trim() || "—"}`,
    `Customization: ${details.customizationRequired ? "Yes" : "No"}`,
  );

  if (details.customizationRequired && details.customizationDescription?.trim()) {
    lines.push(`Customization notes: ${details.customizationDescription.trim()}`);
  }

  lines.push(
    "",
    "── Delivery ──",
    `Address: ${details.deliveryAddress}`,
    `Preferred date: ${details.preferredDeliveryDate?.trim() || "—"}`,
    `Instructions: ${details.specialDeliveryInstructions?.trim() || "—"}`,
    "",
    "── Payment ──",
    `Method: ${details.preferredPaymentMethod}`,
    `PO number: ${details.purchaseOrderNumber?.trim() || "—"}`,
  );

  if (details.additionalNotes?.trim()) {
    lines.push("", "── Additional notes ──", details.additionalNotes.trim());
  }

  if (details.attachments?.length) {
    lines.push(
      "",
      "── Attachments ──",
      ...details.attachments.map((file) => `• ${file.name} (${Math.round(file.size / 1024)} KB)`),
    );
  }

  lines.push(
    "",
    "── Declaration ──",
    `Signed: ${details.declarationName} · ${details.declarationDate}`,
  );

  return lines.join("\n");
}

export function parseOrderRequestDetails(
  raw: unknown,
): OrderRequestDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const details = raw as Partial<OrderRequestDetails>;
  if (
    details.applicantType !== "individual" &&
    details.applicantType !== "company"
  ) {
    return null;
  }
  if (!details.deliveryAddress?.trim()) return null;
  return details as OrderRequestDetails;
}

export function orderHasRequestDocument(
  order: { requestDetails?: OrderRequestDetails | null },
): boolean {
  return Boolean(order.requestDetails);
}

export function resolveRequestApplicantLabel(
  details: OrderRequestDetails,
): string {
  if (details.applicantType === "company") {
    return details.companyName?.trim() || details.contactPerson?.trim() || "—";
  }
  return details.fullName?.trim() || "—";
}

/** Strip large base64 payloads before persisting — keep metadata only in DB. */
export function sanitizeAttachmentsForStorage(
  attachments: OrderRequestAttachment[] | undefined,
): OrderRequestAttachment[] | undefined {
  if (!attachments?.length) return undefined;
  return attachments.map(({ name, mimeType, size }) => ({
    name,
    mimeType,
    size,
    dataUrl: "",
  }));
}
