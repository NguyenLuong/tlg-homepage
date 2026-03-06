const PREVIEW_PARAM_KEY = "preview";
const PREVIEW_TOKEN_PARAM_KEY = "token";

type SearchParamValue = string | string[] | undefined;

export type PreviewSearchParams =
  | URLSearchParams
  | Record<string, SearchParamValue>;

export class PreviewAccessError extends Error {
  readonly statusCode = 401;

  constructor(message = "Invalid preview token.") {
    super(message);
    this.name = "PreviewAccessError";
  }
}

function toFirstString(value: SearchParamValue): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return null;
}

function readParam(searchParams: PreviewSearchParams, key: string): string | null {
  if (searchParams instanceof URLSearchParams) {
    const value = searchParams.get(key);
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return toFirstString(searchParams[key]);
}

export function isPreviewRequested(searchParams: PreviewSearchParams): boolean {
  const preview = readParam(searchParams, PREVIEW_PARAM_KEY);
  if (!preview) {
    return false;
  }

  const normalized = preview.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function getPreviewToken(searchParams: PreviewSearchParams): string | null {
  return readParam(searchParams, PREVIEW_TOKEN_PARAM_KEY);
}

export function hasPreviewSecret(): boolean {
  const secret = process.env.PREVIEW_TOKEN;
  return typeof secret === "string" && secret.trim().length > 0;
}

export function isValidPreviewToken(token: string | null | undefined): boolean {
  if (typeof token !== "string") {
    return false;
  }

  const normalized = token.trim();
  if (!normalized) {
    return false;
  }

  const secret = process.env.PREVIEW_TOKEN;
  if (!secret || !secret.trim()) {
    return false;
  }

  return normalized === secret;
}

export function canAccessPreview(searchParams: PreviewSearchParams): boolean {
  if (!isPreviewRequested(searchParams)) {
    return false;
  }

  return isValidPreviewToken(getPreviewToken(searchParams));
}

export function requirePreviewAccess(searchParams: PreviewSearchParams): void {
  if (!canAccessPreview(searchParams)) {
    throw new PreviewAccessError();
  }
}
