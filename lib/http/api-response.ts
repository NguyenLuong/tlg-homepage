import { NextResponse } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/http/error-messages";
import type { PublicLocale } from "@/lib/i18n/public-locales";
import { logApiError } from "@/lib/monitoring/error-logger";
import {
  BadRequestValidationError,
  InvalidPublishTransitionError,
  InvalidScheduleDateError,
  InvalidScheduleTransitionError,
  ValidationError,
} from "@/lib/validation/schemas";

type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_ERROR";

type ApiErrorEnvelope = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

type ApiSuccessEnvelope<T> = {
  data: T;
};

export type ApiErrorResponse = ApiErrorEnvelope;
export type ApiSuccessResponse<T> = ApiSuccessEnvelope<T>;
export type AdminApiErrorResponse = ApiErrorEnvelope;
export type AdminApiSuccessResponse<T> = ApiSuccessEnvelope<T>;

type PrismaKnownRequestErrorLike = {
  name: "PrismaClientKnownRequestError";
  code: string;
  meta?: {
    target?: unknown;
    field_name?: unknown;
  };
};

function isPrismaKnownRequestError(
  error: unknown,
): error is PrismaKnownRequestErrorLike {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as Record<string, unknown>;
  return (
    value.name === "PrismaClientKnownRequestError" &&
    typeof value.code === "string"
  );
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return apiAdminOk(data, init);
}

export function apiCreated<T>(data: T, init?: ResponseInit) {
  return apiAdminCreated(data, init);
}

export function apiNoContent(init?: ResponseInit) {
  return new NextResponse(null, { status: 204, ...init });
}

/**
 * Create an API error response with optional localization
 *
 * @param status - HTTP status code
 * @param code - Error code
 * @param message - Error message (can be localized)
 * @param details - Optional error details
 * @param init - Optional response init
 * @param locale - Optional locale for error message localization
 */
export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
  init?: ResponseInit,
  locale?: PublicLocale | string,
) {
  // Use localized message if locale is provided and message matches error code
  const localizedMessage =
    locale && code === message ? getErrorMessage(code, locale) : message;

  return apiAdminError(status, code, localizedMessage, details, init);
}

/**
 * Create an API error response from unknown error with optional localization
 *
 * @param error - Unknown error object
 * @param locale - Optional locale for error message localization
 * @param request - Optional request object for logging
 */
export function apiErrorFromUnknown(
  error: unknown,
  locale?: PublicLocale | string,
  request?: Request,
) {
  // Log error with context
  logApiError(error, request, {
    context: "PublicAPI",
    metadata: { locale },
  });

  if (error instanceof ValidationError) {
    return apiError(
      400,
      "BAD_REQUEST",
      getErrorMessage("VALIDATION_ERROR", locale),
      { field: error.field },
      undefined,
      locale,
    );
  }

  if (error instanceof UnauthorizedError) {
    return apiError(
      401,
      "UNAUTHORIZED",
      getErrorMessage("UNAUTHORIZED", locale),
      undefined,
      undefined,
      locale,
    );
  }

  if (error instanceof ForbiddenError) {
    return apiError(
      403,
      "FORBIDDEN",
      getErrorMessage("FORBIDDEN", locale),
      undefined,
      undefined,
      locale,
    );
  }

  if (error instanceof SyntaxError) {
    return apiError(
      400,
      "BAD_REQUEST",
      getErrorMessage("INVALID_JSON", locale),
      undefined,
      undefined,
      locale,
    );
  }

  if (isPrismaKnownRequestError(error)) {
    if (error.code === "P2025") {
      return apiError(
        404,
        "NOT_FOUND",
        getErrorMessage("RESOURCE_NOT_FOUND", locale),
        undefined,
        undefined,
        locale,
      );
    }

    if (error.code === "P2002") {
      return apiError(
        409,
        "CONFLICT",
        getErrorMessage("RESOURCE_EXISTS", locale),
        { target: error.meta?.target },
        undefined,
        locale,
      );
    }

    if (error.code === "P2003") {
      return apiError(
        422,
        "UNPROCESSABLE_ENTITY",
        getErrorMessage("VALIDATION_ERROR", locale),
        { field: error.meta?.field_name },
        undefined,
        locale,
      );
    }
  }

  return apiError(
    500,
    "INTERNAL_ERROR",
    getErrorMessage("INTERNAL_ERROR", locale),
    undefined,
    undefined,
    locale,
  );
}

export function apiAdminOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<AdminApiSuccessResponse<T>>(
    { data },
    { status: 200, ...init },
  );
}

export function apiAdminCreated<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<AdminApiSuccessResponse<T>>(
    { data },
    { status: 201, ...init },
  );
}

export function apiAdminError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
  init?: ResponseInit,
) {
  return NextResponse.json<AdminApiErrorResponse>(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status, ...init },
  );
}

export function apiAdminErrorFromUnknown(error: unknown, request?: Request) {
  // Log error with context
  logApiError(error, request, {
    context: "AdminAPI",
  });

  if (error instanceof BadRequestValidationError) {
    return apiAdminError(400, "BAD_REQUEST", error.message, {
      field: error.field,
    });
  }

  if (error instanceof ValidationError) {
    return apiAdminError(422, "UNPROCESSABLE_ENTITY", error.message, {
      field: error.field,
    });
  }

  if (error instanceof InvalidPublishTransitionError) {
    return apiAdminError(409, "CONFLICT", error.message);
  }

  if (error instanceof InvalidScheduleTransitionError) {
    return apiAdminError(409, "CONFLICT", error.message);
  }

  if (error instanceof InvalidScheduleDateError) {
    return apiAdminError(422, "UNPROCESSABLE_ENTITY", error.message, {
      field: error.field,
    });
  }

  if (error instanceof UnauthorizedError) {
    return apiAdminError(401, "UNAUTHORIZED", error.message);
  }

  if (error instanceof ForbiddenError) {
    return apiAdminError(403, "FORBIDDEN", error.message);
  }

  if (error instanceof SyntaxError) {
    return apiAdminError(400, "BAD_REQUEST", "Invalid JSON payload.");
  }

  if (isPrismaKnownRequestError(error)) {
    if (error.code === "P2025") {
      return apiAdminError(
        404,
        "NOT_FOUND",
        "Requested resource was not found.",
      );
    }

    if (error.code === "P2002") {
      return apiAdminError(409, "CONFLICT", "Resource already exists.", {
        target: error.meta?.target,
      });
    }

    if (error.code === "P2003") {
      return apiAdminError(
        422,
        "UNPROCESSABLE_ENTITY",
        "Referenced resource does not exist.",
        { field: error.meta?.field_name },
      );
    }
  }

  return apiAdminError(500, "INTERNAL_ERROR", "Internal server error.");
}
