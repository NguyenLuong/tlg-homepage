import { type NextRequest } from "next/server";

import { createContactSubmission } from "@/lib/db/repositories/contact-submissions";
import { apiError, apiErrorFromUnknown, apiOk } from "@/lib/http/api-response";
import { sendContactNotification } from "@/lib/notifications/contact-email";
import { JAPAN_PREFECTURE_VALUES } from "@/lib/public-content/japan-prefectures";
import {
  ValidationError,
  parseContactSubmitPayload,
} from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const payload = parseContactSubmitPayload(body, {
      allowedPrefectures: JAPAN_PREFECTURE_VALUES,
    });

    const submission = await createContactSubmission(payload);

    try {
      await sendContactNotification(submission);
    } catch (emailError) {
      console.error("[contact] email notification failed", emailError);
    }

    return apiOk({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "BAD_REQUEST", error.message, {
        field: error.field,
      });
    }

    return apiErrorFromUnknown(error);
  }
}
