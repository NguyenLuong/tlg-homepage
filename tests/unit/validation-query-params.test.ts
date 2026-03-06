import { describe, expect, it } from "vitest";

import {
  apiAdminErrorFromUnknown,
  apiErrorFromUnknown,
} from "@/lib/http/api-response";
import {
  BadRequestValidationError,
  ValidationError,
  parseCreatePayloadEnvelope,
  parseDeleteConfirmationQueryParams,
  parseJobsQueryParams,
  parseNewsQueryParams,
  parseSchedulePayloadEnvelope,
  parseUpdatePayloadEnvelope,
} from "@/lib/validation/schemas";

describe("parseNewsQueryParams", () => {
  it("applies defaults for pagination and locale", () => {
    expect(parseNewsQueryParams(new URLSearchParams())).toMatchObject({
      page: 1,
      pageSize: 10,
      locale: "vi",
    });
  });

  it("parses pagination and locale from query", () => {
    const query = new URLSearchParams({
      page: "2",
      pageSize: "20",
      locale: "ja",
      category: "insights",
      q: "tokyo",
    });

    expect(parseNewsQueryParams(query)).toEqual({
      page: 2,
      pageSize: 20,
      locale: "ja",
      category: "insights",
      q: "tokyo",
    });
  });

  it("parses record input with trimmed locale and optional fields", () => {
    expect(
      parseNewsQueryParams({
        page: "4",
        pageSize: "8",
        locale: " ja ",
        category: " updates ",
        q: " osaka ",
      }),
    ).toEqual({
      page: 4,
      pageSize: 8,
      locale: "ja",
      category: "updates",
      q: "osaka",
    });
  });

  it("normalizes locale casing from query", () => {
    expect(
      parseNewsQueryParams(new URLSearchParams({ locale: "JA" })),
    ).toMatchObject({
      locale: "ja",
    });
  });

  it("falls back to defaults when page/pageSize/locale are empty", () => {
    expect(
      parseNewsQueryParams(
        new URLSearchParams({
          page: "",
          pageSize: "",
          locale: " ",
          category: " ",
          q: "",
        }),
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      locale: "vi",
      category: undefined,
      q: undefined,
    });
  });

  it("throws on invalid locale", () => {
    expect(() =>
      parseNewsQueryParams(new URLSearchParams({ locale: "en" })),
    ).toThrow(ValidationError);
  });

  it("throws on invalid page size", () => {
    expect(() =>
      parseNewsQueryParams(new URLSearchParams({ pageSize: "100" })),
    ).toThrow(ValidationError);
  });

  it("throws on invalid page values", () => {
    expect(() =>
      parseNewsQueryParams(new URLSearchParams({ page: "0" })),
    ).toThrow(ValidationError);
    expect(() =>
      parseNewsQueryParams(new URLSearchParams({ page: "1.5" })),
    ).toThrow(ValidationError);
    expect(() => parseNewsQueryParams({ page: true })).toThrow(ValidationError);
  });
});

describe("parseJobsQueryParams", () => {
  it("applies defaults for pagination and locale", () => {
    expect(parseJobsQueryParams(new URLSearchParams())).toMatchObject({
      page: 1,
      pageSize: 10,
      locale: "vi",
    });
  });

  it("parses filtering fields with page/pageSize/locale", () => {
    const query = new URLSearchParams({
      page: "3",
      pageSize: "12",
      locale: "ja",
      prefecture: "tokyo",
    });

    expect(parseJobsQueryParams(query)).toEqual({
      page: 3,
      pageSize: 12,
      locale: "ja",
      prefecture: "tokyo",
    });
  });

  it("parses record input and trims locale/filter values", () => {
    expect(
      parseJobsQueryParams({
        page: "2",
        pageSize: "25",
        locale: " vi ",
        prefecture: " tokyo ",
      }),
    ).toEqual({
      page: 2,
      pageSize: 25,
      locale: "vi",
      prefecture: "tokyo",
    });
  });

  it("normalizes locale casing from query", () => {
    expect(
      parseJobsQueryParams(new URLSearchParams({ locale: "VI" })),
    ).toMatchObject({
      locale: "vi",
    });
  });

  it("falls back to defaults when page/pageSize/locale are empty", () => {
    expect(
      parseJobsQueryParams(
        new URLSearchParams({
          page: "",
          pageSize: "",
          locale: "",
          prefecture: " ",
        }),
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      locale: "vi",
      prefecture: undefined,
    });
  });

  it("throws on non-integer page", () => {
    expect(() =>
      parseJobsQueryParams(new URLSearchParams({ page: "1.5" })),
    ).toThrow(ValidationError);
  });

  it("throws on invalid locale/pageSize", () => {
    expect(() =>
      parseJobsQueryParams(new URLSearchParams({ locale: "en" })),
    ).toThrow(ValidationError);
    expect(() =>
      parseJobsQueryParams(new URLSearchParams({ pageSize: "0" })),
    ).toThrow(ValidationError);
  });
});

describe("parseDeleteConfirmationQueryParams", () => {
  it("accepts confirm=true from URLSearchParams", () => {
    expect(
      parseDeleteConfirmationQueryParams(
        new URLSearchParams({ confirm: "true" }),
      ),
    ).toEqual({
      confirm: true,
    });
  });

  it("accepts trimmed and case-insensitive true values", () => {
    expect(
      parseDeleteConfirmationQueryParams(
        new URLSearchParams({ confirm: " TRUE " }),
      ),
    ).toEqual({
      confirm: true,
    });
  });

  it("accepts record input with boolean true", () => {
    expect(parseDeleteConfirmationQueryParams({ confirm: true })).toEqual({
      confirm: true,
    });
  });

  it("throws when confirm is missing, false, or not boolean", () => {
    expect(() =>
      parseDeleteConfirmationQueryParams(new URLSearchParams()),
    ).toThrow(ValidationError);
    expect(() =>
      parseDeleteConfirmationQueryParams(
        new URLSearchParams({ confirm: "false" }),
      ),
    ).toThrow(ValidationError);
    expect(() =>
      parseDeleteConfirmationQueryParams(
        new URLSearchParams({ confirm: "yes" }),
      ),
    ).toThrow(ValidationError);
  });
});

function parseTitlePayload(payload: unknown): { title: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError("payload", "must be an object");
  }

  const value = payload as Record<string, unknown>;
  if (typeof value.title !== "string" || value.title.trim().length === 0) {
    throw new ValidationError("title", "is required");
  }

  return { title: value.title.trim() };
}

describe("payload envelope parsers", () => {
  it("parseCreatePayloadEnvelope unwraps payload envelopes", () => {
    expect(
      parseCreatePayloadEnvelope(
        { payload: { title: "  Job title  " } },
        parseTitlePayload,
      ),
    ).toEqual({
      payload: { title: "Job title" },
    });
  });

  it("parseCreatePayloadEnvelope accepts direct payload objects", () => {
    expect(
      parseCreatePayloadEnvelope({ title: "News title" }, parseTitlePayload),
    ).toEqual({
      payload: { title: "News title" },
    });
  });

  it("parseUpdatePayloadEnvelope unwraps payload envelopes", () => {
    expect(
      parseUpdatePayloadEnvelope(
        { payload: { title: "  Updated title " } },
        parseTitlePayload,
      ),
    ).toEqual({
      payload: { title: "Updated title" },
    });
  });

  it("parseSchedulePayloadEnvelope parses scheduledAt from payload envelopes", () => {
    const result = parseSchedulePayloadEnvelope({
      payload: { scheduledAt: "2030-01-01T00:00:00.000Z" },
    });

    expect(result.payload.scheduledAt.toISOString()).toBe(
      "2030-01-01T00:00:00.000Z",
    );
  });

  it("parseSchedulePayloadEnvelope throws on invalid schedule payloads", () => {
    expect(() =>
      parseSchedulePayloadEnvelope({
        payload: { scheduledAt: "not-a-date" },
      }),
    ).toThrow(ValidationError);

    expect(() =>
      parseSchedulePayloadEnvelope({
        payload: { scheduledAt: "2030-01-01" },
      }),
    ).toThrow(ValidationError);

    expect(() =>
      parseSchedulePayloadEnvelope({
        payload: { scheduledAt: "2026-02-31T00:00:00Z" },
      }),
    ).toThrow(ValidationError);
  });
});

describe("api unknown error mapping", () => {
  it("maps admin delete-confirmation validation to 400 BAD_REQUEST", async () => {
    const response = apiAdminErrorFromUnknown(
      new BadRequestValidationError("confirm", "must be true"),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "confirm: must be true",
        details: { field: "confirm" },
      },
    });
  });

  it("maps admin validation errors to 422 UNPROCESSABLE_ENTITY", async () => {
    const response = apiAdminErrorFromUnknown(
      new ValidationError("title", "is required"),
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNPROCESSABLE_ENTITY",
        message: "title: is required",
        details: { field: "title" },
      },
    });
  });

  it("maps public validation errors to 400 BAD_REQUEST", async () => {
    const response = apiErrorFromUnknown(
      new ValidationError("email", "must be a valid email address"),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Dữ liệu xác thực không hợp lệ",
        details: { field: "email" },
      },
    });
  });
});
