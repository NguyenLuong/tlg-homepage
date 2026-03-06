import type { AuthRole, AuthenticatedUser } from "@/lib/auth/config";

export type { AuthenticatedUser };

export const ADMIN_ROLE: AuthRole = "ADMIN";
export const EDITOR_ROLE: AuthRole = "EDITOR";
export const AUTH_ROLES = [ADMIN_ROLE, EDITOR_ROLE] as const;

type SessionLikeUser = Partial<AuthenticatedUser> & {
  role?: string;
};

export type SessionLike =
  | {
      user?: SessionLikeUser | null;
    }
  | null
  | undefined;

export class UnauthorizedError extends Error {
  readonly statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

function isAuthRole(role: string | undefined): role is AuthRole {
  return role === ADMIN_ROLE || role === EDITOR_ROLE;
}

function toSessionUser(
  user: SessionLikeUser | null | undefined,
): AuthenticatedUser | null {
  if (!user || typeof user.id !== "string" || typeof user.email !== "string") {
    return null;
  }

  if (!isAuthRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: typeof user.name === "string" ? user.name : null,
    role: user.role,
  };
}

export function getSessionUser(session: SessionLike): AuthenticatedUser | null {
  return toSessionUser(session?.user);
}

export function requireSessionUser(session: SessionLike): AuthenticatedUser {
  const user = getSessionUser(session);

  if (!user) {
    throw new UnauthorizedError("Authentication is required.");
  }

  return user;
}

export function hasRole(
  role: AuthRole | undefined,
  requiredRole: AuthRole,
): boolean {
  if (!role) {
    return false;
  }

  if (requiredRole === EDITOR_ROLE) {
    return role === EDITOR_ROLE || role === ADMIN_ROLE;
  }

  return role === ADMIN_ROLE;
}

export function requireRole(
  session: SessionLike,
  requiredRole: AuthRole,
): AuthenticatedUser {
  const user = requireSessionUser(session);

  if (!hasRole(user.role, requiredRole)) {
    throw new ForbiddenError(`Requires ${requiredRole} role.`);
  }

  return user;
}

export function isAdmin(session: SessionLike): boolean {
  const user = getSessionUser(session);
  return hasRole(user?.role, ADMIN_ROLE);
}

export function isEditor(session: SessionLike): boolean {
  const user = getSessionUser(session);
  return hasRole(user?.role, EDITOR_ROLE);
}
