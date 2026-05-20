import "server-only";

import { ContactInquiryType, type ContactSubmission } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import type { ContactSubmitPayload } from "@/lib/validation/schemas";

const INQUIRY_TYPE_MAP: Record<
  ContactSubmitPayload["inquiryType"],
  ContactInquiryType
> = {
  "technical-intern": ContactInquiryType.TECHNICAL_INTERN,
  "specified-skill": ContactInquiryType.SPECIFIED_SKILL,
  other: ContactInquiryType.OTHER,
};

export async function createContactSubmission(
  payload: ContactSubmitPayload,
): Promise<ContactSubmission> {
  return prisma.contactSubmission.create({
    data: {
      name: payload.name,
      furigana: payload.furigana,
      company: payload.company ?? null,
      email: payload.email,
      postalCode: payload.postalCode,
      prefecture: payload.prefecture,
      addressLine: payload.addressLine,
      inquiryType: INQUIRY_TYPE_MAP[payload.inquiryType],
      message: payload.message,
      sourcePage: payload.sourcePage ?? null,
      locale: payload.locale ?? null,
    },
  });
}
