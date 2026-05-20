import {
  DEFAULT_PUBLIC_LOCALE,
  type PublicLocale,
  PUBLIC_LOCALES,
} from "@/lib/i18n/public-locales";

/**
 * Base validation error for field-level validation failures.
 * Maps to 400 BAD_REQUEST in public APIs and 422 UNPROCESSABLE_ENTITY in admin APIs.
 */
export class ValidationError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * Validation error for bad request parameters (e.g., query params).
 * Always maps to 400 BAD_REQUEST in all APIs.
 * Use for validation of URL parameters, query strings, and request-level validation
 * that should fail fast before processing payload or business logic.
 */
export class BadRequestValidationError extends ValidationError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = "BadRequestValidationError";
  }
}

/**
 * Business logic error for invalid publish state transitions in CMS operations.
 * Maps to 409 CONFLICT.
 * Throw when attempting to publish content from a status that doesn't allow publishing
 * (e.g., CLOSED jobs or ARCHIVED news cannot be published).
 */
export class InvalidPublishTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPublishTransitionError";
  }
}

/**
 * Business logic error for invalid schedule state transitions in CMS operations.
 * Maps to 409 CONFLICT.
 * Throw when attempting to schedule content from a status that doesn't allow scheduling
 * (e.g., CLOSED jobs or ARCHIVED news cannot be scheduled).
 */
export class InvalidScheduleTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidScheduleTransitionError";
  }
}

/**
 * Validation error for schedule date constraints in CMS operations.
 * Maps to 422 UNPROCESSABLE_ENTITY with field "scheduledAt".
 * Throw when scheduledAt is not in the future or is otherwise invalid.
 */
export class InvalidScheduleDateError extends Error {
  public readonly field: string;

  constructor(message: string) {
    super(message);
    this.name = "InvalidScheduleDateError";
    this.field = "scheduledAt";
  }
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type SchedulePayload = {
  scheduledAt: Date;
};

export type PayloadEnvelope<T> = {
  payload: T;
};

export type CreatePayloadEnvelope<T> = PayloadEnvelope<T>;

export type UpdatePayloadEnvelope<T> = PayloadEnvelope<T>;

export type SchedulePayloadEnvelope = PayloadEnvelope<SchedulePayload>;

export type NewsQueryParams = {
  page: number;
  pageSize: number;
  locale: PublicLocale;
  category?: string;
  q?: string;
};

export type JobsQueryParams = {
  page: number;
  pageSize: number;
  locale: PublicLocale;
  prefecture?: string;
};

export type PublicDetailParams = {
  slug: string;
};

export type DeleteConfirmationQueryParams = {
  confirm: true;
};

export type AdminNewsCreatePayload = {
  title: string;
  contentRich: Record<string, unknown>;
  categoryId: string;
};

export type AdminNewsUpdatePayload = {
  title?: string;
  contentRich?: Record<string, unknown>;
  categoryId?: string;
};

export type AdminJobCreatePayload = {
  title: string;
  slug: string;
  locationPrefectureId: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  heroImageId?: string;
};

export type AdminJobUpdatePayload = {
  title?: string;
  slug?: string;
  locationPrefectureId?: string;
  salaryText?: string;
  benefits?: string[];
  descriptionRich?: Record<string, unknown>;
  heroImageId?: string | null;
  isFeatured?: boolean;
};

export type AdminJobFeaturePayload = {
  isFeatured: boolean;
};

export type ContactSubmitPayload = {
  name: string;
  furigana: string;
  company?: string;
  email: string;
  postalCode: string;
  prefecture: string;
  addressLine: string;
  inquiryType: "technical-intern" | "specified-skill" | "other";
  message: string;
  sourcePage?: string;
  locale?: PublicLocale;
};

type QueryInput = URLSearchParams | Record<string, unknown>;
type PayloadParser<T> = (payload: unknown) => T;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureObject(
  value: unknown,
  field = "payload",
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ValidationError(field, "must be an object");
  }

  return value;
}

function parseRequiredString(
  value: unknown,
  field: string,
  options?: { minLength?: number; maxLength?: number },
): string {
  if (typeof value !== "string") {
    throw new ValidationError(field, "must be a string");
  }

  const sanitized = value.trim();
  if (!sanitized) {
    throw new ValidationError(field, "is required");
  }

  if (
    options?.minLength !== undefined &&
    sanitized.length < options.minLength
  ) {
    throw new ValidationError(
      field,
      `must be at least ${options.minLength} characters`,
    );
  }

  if (
    options?.maxLength !== undefined &&
    sanitized.length > options.maxLength
  ) {
    throw new ValidationError(
      field,
      `must be at most ${options.maxLength} characters`,
    );
  }

  return sanitized;
}

function parseOptionalString(
  value: unknown,
  field: string,
  options?: { maxLength?: number },
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(field, "must be a string");
  }

  const sanitized = value.trim();
  if (!sanitized) {
    return undefined;
  }

  if (
    options?.maxLength !== undefined &&
    sanitized.length > options.maxLength
  ) {
    throw new ValidationError(
      field,
      `must be at most ${options.maxLength} characters`,
    );
  }

  return sanitized;
}
function parseOptionalQueryInteger(
  value: unknown,
  field: string,
  options?: { min?: number; max?: number },
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  let integerValue: number;
  if (typeof value === "number") {
    integerValue = value;
  } else if (typeof value === "string") {
    const sanitized = value.trim();
    if (!/^-?\d+$/.test(sanitized)) {
      throw new ValidationError(field, "must be an integer");
    }
    integerValue = Number(sanitized);
  } else {
    throw new ValidationError(field, "must be an integer");
  }

  if (!Number.isInteger(integerValue)) {
    throw new ValidationError(field, "must be an integer");
  }

  if (options?.min !== undefined && integerValue < options.min) {
    throw new ValidationError(field, `must be at least ${options.min}`);
  }
  if (options?.max !== undefined && integerValue > options.max) {
    throw new ValidationError(field, `must be at most ${options.max}`);
  }

  return integerValue;
}

function parseQueryLocale(
  value: unknown,
  field: string,
): PublicLocale | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(field, "must be a string");
  }

  const sanitized = value.trim().toLowerCase();
  if (!sanitized) {
    return undefined;
  }

  if (!(PUBLIC_LOCALES as readonly string[]).includes(sanitized)) {
    throw new ValidationError(
      field,
      `must be one of: ${(PUBLIC_LOCALES as readonly string[]).join(", ")}`,
    );
  }

  return sanitized as PublicLocale;
}

function parseQueryBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    throw new ValidationError(field, "must be a boolean");
  }

  const sanitized = value.trim().toLowerCase();
  if (!sanitized) {
    return undefined;
  }

  if (sanitized === "true") {
    return true;
  }

  if (sanitized === "false") {
    return false;
  }

  throw new ValidationError(field, "must be a boolean");
}

function getQueryValue(input: QueryInput, key: string): unknown {
  if (input instanceof URLSearchParams) {
    const value = input.get(key);
    return value === null ? undefined : value;
  }

  return input[key];
}

function parseIsoDate(value: unknown, field: string): Date {
  if (typeof value !== "string") {
    throw new ValidationError(field, "must be an ISO 8601 date-time string");
  }

  const sanitized = value.trim();
  if (!sanitized) {
    throw new ValidationError(field, "is required");
  }

  const match = ISO_DATE_TIME_REGEX.exec(sanitized);
  if (!match) {
    throw new ValidationError(field, "must be an ISO 8601 date-time string");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[8] ? Number(match[8]) : 0;
  const offsetMinute = match[9] ? Number(match[9]) : 0;

  if (month < 1 || month > 12) {
    throw new ValidationError(field, "must be a valid date-time");
  }
  if (hour > 23 || minute > 59 || second > 59) {
    throw new ValidationError(field, "must be a valid date-time");
  }
  if (offsetHour > 23 || offsetMinute > 59) {
    throw new ValidationError(field, "must be a valid date-time");
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() + 1 !== month ||
    utcDate.getUTCDate() !== day
  ) {
    throw new ValidationError(field, "must be a valid date-time");
  }

  const parsed = new Date(sanitized);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(field, "must be a valid date-time");
  }

  return parsed;
}

function parseRequiredObjectValue(
  value: unknown,
  field: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ValidationError(field, "must be an object");
  }

  return value;
}

function unwrapPayloadEnvelope(payload: unknown): unknown {
  const input = ensureObject(payload);
  if (Object.prototype.hasOwnProperty.call(input, "payload")) {
    return input.payload;
  }

  return input;
}

function parseUuid(value: unknown, field: string): string {
  const parsed = parseRequiredString(value, field, { maxLength: 36 });
  if (!UUID_REGEX.test(parsed)) {
    throw new ValidationError(field, "must be a valid UUID");
  }

  return parsed;
}

export function parseLoginPayload(payload: unknown): LoginPayload {
  const input = ensureObject(payload);

  const email = parseRequiredString(input.email, "email", {
    maxLength: 320,
  }).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("email", "must be a valid email address");
  }

  const password = parseRequiredString(input.password, "password", {
    minLength: 1,
    maxLength: 1024,
  });

  return { email, password };
}

export function parseSchedulePayload(payload: unknown): SchedulePayload {
  const input = ensureObject(payload);

  return {
    scheduledAt: parseIsoDate(input.scheduledAt, "scheduledAt"),
  };
}

export function parseCreatePayloadEnvelope<T>(
  payload: unknown,
  parsePayload: PayloadParser<T>,
): CreatePayloadEnvelope<T> {
  return {
    payload: parsePayload(unwrapPayloadEnvelope(payload)),
  };
}

export function parseUpdatePayloadEnvelope<T>(
  payload: unknown,
  parsePayload: PayloadParser<T>,
): UpdatePayloadEnvelope<T> {
  return {
    payload: parsePayload(unwrapPayloadEnvelope(payload)),
  };
}

export function parseSchedulePayloadEnvelope(
  payload: unknown,
): SchedulePayloadEnvelope {
  return parseCreatePayloadEnvelope(payload, parseSchedulePayload);
}

export function parseNewsQueryParams(params: QueryInput): NewsQueryParams {
  const page =
    parseOptionalQueryInteger(getQueryValue(params, "page"), "page", {
      min: 1,
    }) ?? 1;
  const pageSize =
    parseOptionalQueryInteger(getQueryValue(params, "pageSize"), "pageSize", {
      min: 1,
      max: 50,
    }) ?? 10;
  const locale =
    parseQueryLocale(getQueryValue(params, "locale"), "locale") ??
    DEFAULT_PUBLIC_LOCALE;

  return {
    page,
    pageSize,
    locale,
    category: parseOptionalString(
      getQueryValue(params, "category"),
      "category",
      {
        maxLength: 100,
      },
    ),
    q: parseOptionalString(getQueryValue(params, "q"), "q", { maxLength: 200 }),
  };
}

export function parseJobsQueryParams(params: QueryInput): JobsQueryParams {
  const page =
    parseOptionalQueryInteger(getQueryValue(params, "page"), "page", {
      min: 1,
    }) ?? 1;
  const pageSize =
    parseOptionalQueryInteger(getQueryValue(params, "pageSize"), "pageSize", {
      min: 1,
      max: 50,
    }) ?? 10;
  const locale =
    parseQueryLocale(getQueryValue(params, "locale"), "locale") ??
    DEFAULT_PUBLIC_LOCALE;

  return {
    page,
    pageSize,
    locale,
    prefecture: parseOptionalString(
      getQueryValue(params, "prefecture"),
      "prefecture",
      {
        maxLength: 100,
      },
    ),
  };
}

export function parsePublicDetailParams(params: unknown): PublicDetailParams {
  const input = ensureObject(params, "params");
  const slug = parseRequiredString(input.slug, "slug", {
    maxLength: 200,
  }).toLowerCase();

  if (!SLUG_REGEX.test(slug)) {
    throw new ValidationError("slug", "must be kebab-case");
  }

  return { slug };
}

/**
 * Parses and validates delete confirmation query parameter.
 * Enforces explicit confirmation signal (confirm=true) for permanent delete operations.
 * Throws BadRequestValidationError (maps to 400 BAD_REQUEST) if confirmation is missing or false.
 * Used by DELETE endpoints for jobs and news to satisfy FR-012 (explicit delete confirmation).
 *
 * @param params - Query parameters from request (URLSearchParams or object)
 * @returns DeleteConfirmationQueryParams with confirm: true
 * @throws {BadRequestValidationError} When confirm is missing or not true
 */
export function parseDeleteConfirmationQueryParams(
  params: QueryInput,
): DeleteConfirmationQueryParams {
  const confirm = parseQueryBoolean(
    getQueryValue(params, "confirm"),
    "confirm",
  );

  if (confirm !== true) {
    throw new BadRequestValidationError("confirm", "must be true");
  }

  return { confirm: true };
}

export function parseAdminNewsCreatePayload(
  payload: unknown,
): AdminNewsCreatePayload {
  const input = ensureObject(payload);

  return {
    title: parseRequiredString(input.title, "title", { maxLength: 200 }),
    contentRich: parseRequiredObjectValue(input.contentRich, "contentRich"),
    categoryId: parseUuid(input.categoryId, "categoryId"),
  };
}

export function parseAdminJobCreatePayload(
  payload: unknown,
): AdminJobCreatePayload {
  const input = ensureObject(payload);

  const slug = parseRequiredString(input.slug, "slug", {
    maxLength: 200,
  }).toLowerCase();
  if (!SLUG_REGEX.test(slug)) {
    throw new ValidationError("slug", "must be kebab-case");
  }

  const benefitsValue = input.benefits;
  if (!Array.isArray(benefitsValue)) {
    throw new ValidationError("benefits", "must be an array");
  }
  if (benefitsValue.length > 3) {
    throw new ValidationError("benefits", "must contain at most 3 items");
  }
  const benefits = benefitsValue.map((benefit, index) =>
    parseRequiredString(benefit, `benefits[${index}]`, { maxLength: 160 }),
  );

  const heroImageIdValue = parseOptionalString(
    input.heroImageId,
    "heroImageId",
    {
      maxLength: 36,
    },
  );
  if (heroImageIdValue && !UUID_REGEX.test(heroImageIdValue)) {
    throw new ValidationError("heroImageId", "must be a valid UUID");
  }

  const descriptionRich = parseRequiredObjectValue(
    input.descriptionRich,
    "descriptionRich",
  );

  return {
    title: parseRequiredString(input.title, "title", { maxLength: 200 }),
    slug,
    locationPrefectureId: parseUuid(
      input.locationPrefectureId,
      "locationPrefectureId",
    ),
    salaryText: parseRequiredString(input.salaryText, "salaryText", {
      maxLength: 200,
    }),
    benefits,
    descriptionRich,
    heroImageId: heroImageIdValue,
  };
}

export function parseAdminJobUpdatePayload(
  payload: unknown,
): AdminJobUpdatePayload {
  const input = ensureObject(payload);
  const output: AdminJobUpdatePayload = {};

  if (Object.prototype.hasOwnProperty.call(input, "title")) {
    output.title = parseRequiredString(input.title, "title", {
      maxLength: 200,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, "slug")) {
    const slug = parseRequiredString(input.slug, "slug", {
      maxLength: 200,
    }).toLowerCase();
    if (!SLUG_REGEX.test(slug)) {
      throw new ValidationError("slug", "must be kebab-case");
    }
    output.slug = slug;
  }

  if (Object.prototype.hasOwnProperty.call(input, "locationPrefectureId")) {
    output.locationPrefectureId = parseUuid(
      input.locationPrefectureId,
      "locationPrefectureId",
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "salaryText")) {
    output.salaryText = parseRequiredString(input.salaryText, "salaryText", {
      maxLength: 200,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, "benefits")) {
    const benefitsValue = input.benefits;
    if (!Array.isArray(benefitsValue)) {
      throw new ValidationError("benefits", "must be an array");
    }
    if (benefitsValue.length > 3) {
      throw new ValidationError("benefits", "must contain at most 3 items");
    }
    output.benefits = benefitsValue.map((benefit, index) =>
      parseRequiredString(benefit, `benefits[${index}]`, { maxLength: 160 }),
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "descriptionRich")) {
    output.descriptionRich = parseRequiredObjectValue(
      input.descriptionRich,
      "descriptionRich",
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "heroImageId")) {
    if (input.heroImageId === null) {
      output.heroImageId = null;
    } else {
      const heroImageIdValue = parseRequiredString(
        input.heroImageId,
        "heroImageId",
        {
          maxLength: 36,
        },
      );
      if (!UUID_REGEX.test(heroImageIdValue)) {
        throw new ValidationError("heroImageId", "must be a valid UUID");
      }
      output.heroImageId = heroImageIdValue;
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, "isFeatured")) {
    if (typeof input.isFeatured !== "boolean") {
      throw new ValidationError("isFeatured", "must be a boolean");
    }
    output.isFeatured = input.isFeatured;
  }

  if (Object.keys(output).length === 0) {
    throw new ValidationError(
      "payload",
      "must contain at least one updatable field",
    );
  }

  return output;
}

export function parseAdminJobFeaturePayload(
  payload: unknown,
): AdminJobFeaturePayload {
  const input = ensureObject(payload);

  if (!Object.prototype.hasOwnProperty.call(input, "isFeatured")) {
    throw new ValidationError("isFeatured", "is required");
  }
  if (typeof input.isFeatured !== "boolean") {
    throw new ValidationError("isFeatured", "must be a boolean");
  }

  return { isFeatured: input.isFeatured as boolean };
}

export function parseUuidValue(value: unknown, field: string): string {
  return parseUuid(value, field);
}

const CONTACT_INQUIRY_TYPES = [
  "technical-intern",
  "specified-skill",
  "other",
] as const;

export function parseContactSubmitPayload(
  payload: unknown,
  options: { allowedPrefectures: ReadonlyArray<string> },
): ContactSubmitPayload {
  const input = ensureObject(payload);

  const name = parseRequiredString(input.name, "name", { maxLength: 200 });
  const furigana = parseRequiredString(input.furigana, "furigana", {
    maxLength: 200,
  });
  const company = parseOptionalString(input.company, "company", {
    maxLength: 200,
  });

  const email = parseRequiredString(input.email, "email", {
    maxLength: 320,
  }).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("email", "must be a valid email address");
  }

  const postalCode = parseRequiredString(input.postalCode, "postalCode", {
    maxLength: 8,
  });
  if (!/^\d{3}-\d{4}$/.test(postalCode)) {
    throw new ValidationError(
      "postalCode",
      "must be in XXX-XXXX format",
    );
  }

  const prefecture = parseRequiredString(input.prefecture, "prefecture", {
    maxLength: 64,
  });
  if (!options.allowedPrefectures.includes(prefecture)) {
    throw new ValidationError("prefecture", "must be a valid prefecture");
  }

  const addressLine = parseRequiredString(input.addressLine, "addressLine", {
    maxLength: 200,
  });

  const inquiryTypeRaw = parseRequiredString(
    input.inquiryType,
    "inquiryType",
    { maxLength: 64 },
  );
  if (
    !(CONTACT_INQUIRY_TYPES as readonly string[]).includes(inquiryTypeRaw)
  ) {
    throw new ValidationError(
      "inquiryType",
      `must be one of: ${CONTACT_INQUIRY_TYPES.join(", ")}`,
    );
  }

  const message = parseRequiredString(input.message, "message", {
    maxLength: 4000,
  });

  const sourcePage = parseOptionalString(input.sourcePage, "sourcePage", {
    maxLength: 200,
  });

  const localeRaw = parseOptionalString(input.locale, "locale", {
    maxLength: 8,
  });
  let locale: PublicLocale | undefined;
  if (localeRaw !== undefined) {
    if (!(PUBLIC_LOCALES as readonly string[]).includes(localeRaw)) {
      throw new ValidationError(
        "locale",
        `must be one of: ${(PUBLIC_LOCALES as readonly string[]).join(", ")}`,
      );
    }
    locale = localeRaw as PublicLocale;
  }

  return {
    name,
    furigana,
    company,
    email,
    postalCode,
    prefecture,
    addressLine,
    inquiryType: inquiryTypeRaw as ContactSubmitPayload["inquiryType"],
    message,
    sourcePage,
    locale,
  };
}

export function parseAdminNewsUpdatePayload(
  payload: unknown,
): AdminNewsUpdatePayload {
  const input = ensureObject(payload);
  const output: AdminNewsUpdatePayload = {};

  if (Object.prototype.hasOwnProperty.call(input, "title")) {
    output.title = parseRequiredString(input.title, "title", {
      maxLength: 200,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, "contentRich")) {
    output.contentRich = parseRequiredObjectValue(
      input.contentRich,
      "contentRich",
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "categoryId")) {
    output.categoryId = parseUuid(input.categoryId, "categoryId");
  }

  if (Object.keys(output).length === 0) {
    throw new ValidationError(
      "payload",
      "must contain at least one updatable field",
    );
  }

  return output;
}

/**
 * Parse and validate locale from query parameter (nullable with fallback)
 * Use for query parameters where locale is optional and should default to a specific value
 */
export function parsePublicLocaleParam(
  value: string | null | undefined,
  fallback: PublicLocale,
): PublicLocale {
  if (!value) {
    return fallback;
  }

  const sanitized = value.trim().toLowerCase();
  if (!sanitized) {
    return fallback;
  }

  if (!(PUBLIC_LOCALES as readonly string[]).includes(sanitized)) {
    throw new BadRequestValidationError(
      "locale",
      `must be one of: ${(PUBLIC_LOCALES as readonly string[]).join(", ")}`,
    );
  }

  return sanitized as PublicLocale;
}
