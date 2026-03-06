import type { NextRequest } from "next/server";

import type { PublicLocale } from "@/lib/i18n/public-locales";

type ErrorMessageKey =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_ERROR"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_EXISTS"
  | "INVALID_CREDENTIALS";

type LocalizedErrorMessages = Readonly<Record<ErrorMessageKey, string>>;

/**
 * Error messages in Vietnamese
 */
const ERROR_MESSAGES_VI: LocalizedErrorMessages = {
  BAD_REQUEST: "Yêu cầu không hợp lệ",
  UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này",
  NOT_FOUND: "Không tìm thấy tài nguyên được yêu cầu",
  CONFLICT: "Tài nguyên đã tồn tại hoặc xung đột",
  UNPROCESSABLE_ENTITY: "Không thể xử lý dữ liệu được cung cấp",
  INTERNAL_ERROR: "Đã xảy ra lỗi máy chủ nội bộ",
  INVALID_JSON: "Dữ liệu JSON không hợp lệ",
  VALIDATION_ERROR: "Dữ liệu xác thực không hợp lệ",
  RESOURCE_NOT_FOUND: "Không tìm thấy tài nguyên được yêu cầu",
  RESOURCE_EXISTS: "Tài nguyên đã tồn tại",
  INVALID_CREDENTIALS: "Thông tin đăng nhập không chính xác",
};

/**
 * Error messages in Japanese
 */
const ERROR_MESSAGES_JA: LocalizedErrorMessages = {
  BAD_REQUEST: "リクエストが無効です",
  UNAUTHORIZED: "この操作を行うにはログインが必要です",
  FORBIDDEN: "このリソースへのアクセス権限がありません",
  NOT_FOUND: "要求されたリソースが見つかりません",
  CONFLICT: "リソースが既に存在するか競合しています",
  UNPROCESSABLE_ENTITY: "提供されたデータを処理できません",
  INTERNAL_ERROR: "内部サーバーエラーが発生しました",
  INVALID_JSON: "無効なJSONデータです",
  VALIDATION_ERROR: "検証データが無効です",
  RESOURCE_NOT_FOUND: "要求されたリソースが見つかりません",
  RESOURCE_EXISTS: "リソースは既に存在します",
  INVALID_CREDENTIALS: "ログイン情報が正しくありません",
};

/**
 * Error messages in English (fallback)
 */
const ERROR_MESSAGES_EN: LocalizedErrorMessages = {
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "You need to log in to perform this action",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Requested resource not found",
  CONFLICT: "Resource already exists or conflict occurred",
  UNPROCESSABLE_ENTITY: "Unable to process the provided data",
  INTERNAL_ERROR: "Internal server error occurred",
  INVALID_JSON: "Invalid JSON data",
  VALIDATION_ERROR: "Validation data is invalid",
  RESOURCE_NOT_FOUND: "Requested resource not found",
  RESOURCE_EXISTS: "Resource already exists",
  INVALID_CREDENTIALS: "Invalid login credentials",
};

/**
 * Get error message collection for a specific locale
 */
function getErrorMessagesForLocale(
  locale: PublicLocale | string,
): LocalizedErrorMessages {
  switch (locale) {
    case "vi":
      return ERROR_MESSAGES_VI;
    case "ja":
      return ERROR_MESSAGES_JA;
    default:
      return ERROR_MESSAGES_EN;
  }
}

/**
 * Get localized error message by key and locale
 *
 * @param key - Error message key
 * @param locale - Locale code (vi, ja, or fallback to en)
 * @returns Localized error message
 *
 * @example
 * getErrorMessage('NOT_FOUND', 'vi') // => "Không tìm thấy tài nguyên được yêu cầu"
 * getErrorMessage('UNAUTHORIZED', 'ja') // => "この操作を行うにはログインが必要です"
 */
export function getErrorMessage(
  key: ErrorMessageKey,
  locale: PublicLocale | string = "vi",
): string {
  const messages = getErrorMessagesForLocale(locale);
  return messages[key];
}

/**
 * Get all error messages for a specific locale
 *
 * @param locale - Locale code (vi, ja, or fallback to en)
 * @returns All localized error messages
 */
export function getAllErrorMessages(
  locale: PublicLocale | string = "vi",
): LocalizedErrorMessages {
  return getErrorMessagesForLocale(locale);
}

/**
 * Extract locale from API request
 *
 * Checks in order:
 * 1. `locale` query parameter
 * 2. `Accept-Language` header
 * 3. Defaults to 'vi'
 *
 * @param request - Next.js request object
 * @returns Locale string (vi, ja, or en)
 *
 * @example
 * // From query: /api/jobs?locale=ja
 * getLocaleFromRequest(request) // => 'ja'
 *
 * // From header: Accept-Language: ja
 * getLocaleFromRequest(request) // => 'ja'
 */
export function getLocaleFromRequest(request: NextRequest): string {
  // Check query parameter first
  const queryLocale = request.nextUrl.searchParams.get("locale");
  if (queryLocale === "vi" || queryLocale === "ja") {
    return queryLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    if (acceptLanguage.includes("ja")) {
      return "ja";
    }
    if (acceptLanguage.includes("vi")) {
      return "vi";
    }
  }

  // Default to Vietnamese
  return "vi";
}
