import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { AuthRole, AuthenticatedUser } from "@/lib/auth/config";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/session";
import type { SessionTokenPayload } from "@/lib/auth/session-token";

// ---------------------------------------------------------------------------
// Global mock: @/lib/config/env
// Prevents eager env-var validation from throwing in test environments
// (transitive imports from image-service, repositories, etc.)
// ---------------------------------------------------------------------------
vi.mock("@/lib/config/env", () => ({
  env: {
    server: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      AUTH_SECRET: "test-auth-secret",
      PREVIEW_TOKEN: "test-preview-token",
      IMAGE_PROVIDER: "CLOUDINARY",
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-api-key",
      CLOUDINARY_API_SECRET: "test-api-secret",
      NODE_ENV: "test",
    },
    client: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
  getEnvConfig: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Global mock: @/lib/media/image-service
// Prevents Cloudinary SDK initialization in test environments
// ---------------------------------------------------------------------------
vi.mock("@/lib/media/image-service", () => ({
  getImageProvider: vi.fn(() => ({
    upload: vi.fn(),
    getBlurDataUrl: vi.fn(async () => "data:image/png;base64,placeholder"),
  })),
  uploadImage: vi.fn(),
  getBlurDataURL: vi.fn(async (url: string) =>
    url ? "data:image/png;base64,placeholder" : undefined,
  ),
  withBlurPlaceholder: vi.fn(async (image: { url: string } | null) =>
    image
      ? { ...image, blurDataURL: "data:image/png;base64,placeholder" }
      : null,
  ),
}));

type MaybePromise<T> = T | Promise<T>;

export const defaultCmsAuthUser: AuthenticatedUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "editor@example.com",
  name: "Editor User",
  role: "EDITOR",
};

type CmsAuthMockState = {
  requireEditor: ReturnType<typeof vi.fn>;
  readSessionToken: ReturnType<typeof vi.fn>;
  parseAndVerifySessionToken: ReturnType<typeof vi.fn>;
};

type CmsAuthUserOverrides = Partial<AuthenticatedUser> & {
  role?: AuthRole;
};

const cmsAuthMocks = vi.hoisted<CmsAuthMockState>(() => ({
  requireEditor: vi.fn(),
  readSessionToken: vi.fn(),
  parseAndVerifySessionToken: vi.fn(),
}));

vi.mock("@/lib/auth/request", () => ({
  requireEditor: cmsAuthMocks.requireEditor,
}));

vi.mock("@/lib/auth/session-token", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/auth/session-token")>();
  return {
    ...actual,
    readSessionToken: cmsAuthMocks.readSessionToken,
    parseAndVerifySessionToken: cmsAuthMocks.parseAndVerifySessionToken,
  };
});

export function createCmsAuthUser(
  overrides: CmsAuthUserOverrides = {},
): AuthenticatedUser {
  return {
    ...defaultCmsAuthUser,
    ...overrides,
  };
}

export function createSessionTokenPayload(
  overrides: Partial<SessionTokenPayload> = {},
): SessionTokenPayload {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return {
    sub: defaultCmsAuthUser.id,
    role: defaultCmsAuthUser.role,
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 60,
    ...overrides,
  };
}

export function mockCmsAuthAuthorized(
  overrides: CmsAuthUserOverrides = {},
): AuthenticatedUser {
  const user = createCmsAuthUser(overrides);
  cmsAuthMocks.requireEditor.mockResolvedValue(user);
  return user;
}

export function mockCmsAuthUnauthorized(
  message = "Authentication is required.",
): void {
  cmsAuthMocks.requireEditor.mockRejectedValue(new UnauthorizedError(message));
}

export function mockCmsAuthForbidden(message = "Requires EDITOR role."): void {
  cmsAuthMocks.requireEditor.mockRejectedValue(new ForbiddenError(message));
}

export function mockCmsSessionAuthorized(
  options: {
    token?: string;
    payload?: Partial<SessionTokenPayload>;
  } = {},
): SessionTokenPayload {
  const token = options.token ?? "mock-session-token";
  const payload = createSessionTokenPayload(options.payload);
  cmsAuthMocks.readSessionToken.mockReturnValue(token);
  cmsAuthMocks.parseAndVerifySessionToken.mockResolvedValue(payload);
  return payload;
}

export function mockCmsSessionMissing(): void {
  cmsAuthMocks.readSessionToken.mockReturnValue(null);
  cmsAuthMocks.parseAndVerifySessionToken.mockResolvedValue(null);
}

export function mockCmsSessionInvalid(token = "invalid-session-token"): void {
  cmsAuthMocks.readSessionToken.mockReturnValue(token);
  cmsAuthMocks.parseAndVerifySessionToken.mockResolvedValue(null);
}

type AppRouterPageParams = Record<string, string>;
type AppRouterPageSearchParams = Record<string, string | string[] | undefined>;

export type AppRouterPageProps<
  TParams extends AppRouterPageParams = AppRouterPageParams,
  TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

type AppRouterPageComponent<
  TParams extends AppRouterPageParams = AppRouterPageParams,
  TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
> = (
  props: AppRouterPageProps<TParams, TSearchParams>,
) => MaybePromise<ReactNode>;

type AppRouterRenderOptions<
  TParams extends AppRouterPageParams = AppRouterPageParams,
  TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
> = {
  params?: TParams;
  searchParams?: TSearchParams;
};

export function createAppRouterPageProps<
  TParams extends AppRouterPageParams = AppRouterPageParams,
  TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
>(
  options: AppRouterRenderOptions<TParams, TSearchParams> = {},
): AppRouterPageProps<TParams, TSearchParams> {
  return {
    params: Promise.resolve((options.params ?? {}) as TParams),
    searchParams: Promise.resolve(
      (options.searchParams ?? {}) as TSearchParams,
    ),
  };
}

export async function renderAppRouterPage<
  TParams extends AppRouterPageParams = AppRouterPageParams,
  TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
>(
  page: AppRouterPageComponent<TParams, TSearchParams>,
  options: AppRouterRenderOptions<TParams, TSearchParams> = {},
) {
  const ui = await page(createAppRouterPageProps(options));
  return render(ui);
}

declare global {
  var createAppRouterPageProps: <
    TParams extends AppRouterPageParams = AppRouterPageParams,
    TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
  >(
    options?: AppRouterRenderOptions<TParams, TSearchParams>,
  ) => AppRouterPageProps<TParams, TSearchParams>;
  var renderAppRouterPage: <
    TParams extends AppRouterPageParams = AppRouterPageParams,
    TSearchParams extends AppRouterPageSearchParams = AppRouterPageSearchParams,
  >(
    page: AppRouterPageComponent<TParams, TSearchParams>,
    options?: AppRouterRenderOptions<TParams, TSearchParams>,
  ) => Promise<ReturnType<typeof render>>;
  var mockCmsAuthAuthorized: (
    overrides?: CmsAuthUserOverrides,
  ) => AuthenticatedUser;
  var mockCmsAuthUnauthorized: (message?: string) => void;
  var mockCmsAuthForbidden: (message?: string) => void;
  var mockCmsSessionAuthorized: (options?: {
    token?: string;
    payload?: Partial<SessionTokenPayload>;
  }) => SessionTokenPayload;
  var mockCmsSessionMissing: () => void;
  var mockCmsSessionInvalid: (token?: string) => void;
}

globalThis.createAppRouterPageProps = createAppRouterPageProps;
globalThis.renderAppRouterPage = renderAppRouterPage;
globalThis.mockCmsAuthAuthorized = mockCmsAuthAuthorized;
globalThis.mockCmsAuthUnauthorized = mockCmsAuthUnauthorized;
globalThis.mockCmsAuthForbidden = mockCmsAuthForbidden;
globalThis.mockCmsSessionAuthorized = mockCmsSessionAuthorized;
globalThis.mockCmsSessionMissing = mockCmsSessionMissing;
globalThis.mockCmsSessionInvalid = mockCmsSessionInvalid;

beforeEach(() => {
  cmsAuthMocks.requireEditor.mockReset();
  cmsAuthMocks.readSessionToken.mockReset();
  cmsAuthMocks.parseAndVerifySessionToken.mockReset();

  mockCmsAuthAuthorized();
  mockCmsSessionAuthorized();
});

afterEach(() => {
  cleanup();
});
