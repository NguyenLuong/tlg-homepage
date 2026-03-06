import { type NextRequest } from "next/server";

import {
  type AuthenticatedUser,
  EDITOR_ROLE,
  UnauthorizedError,
  requireRole,
} from "@/lib/auth/session";
import {
  parseAndVerifySessionToken,
  readSessionToken,
} from "@/lib/auth/session-token";
import { findUserById } from "@/lib/db/repositories/users";

/**
 * Enforces editor role access for admin CMS mutation routes.
 *
 * This function extracts and verifies the session token from the request,
 * resolves the authenticated user from the database, and checks that the user
 * has the required EDITOR role (or ADMIN, which inherits EDITOR permissions).
 *
 * @param request - The Next.js request object containing the session token
 * @returns Promise resolving to the authenticated user with editor/admin role
 * @throws {UnauthorizedError} When authentication is missing or invalid
 * @throws {ForbiddenError} When the authenticated user lacks the required role
 */
export async function requireEditor(
  request: NextRequest,
): Promise<AuthenticatedUser> {
  const token = readSessionToken(request);
  if (!token) {
    throw new UnauthorizedError("Authentication is required.");
  }

  const payload = await parseAndVerifySessionToken(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid session token.");
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    throw new UnauthorizedError("Authentication is required.");
  }

  return requireRole({ user }, EDITOR_ROLE);
}
