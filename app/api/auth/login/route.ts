import { createHash, timingSafeEqual } from "node:crypto";

import { type NextRequest } from "next/server";

import { apiError, apiErrorFromUnknown, apiOk } from "@/lib/http/api-response";
import { createSessionToken } from "@/lib/auth/session-token";
import { findUserByEmail, updateLastLogin } from "@/lib/db/repositories/users";
import { parseLoginPayload } from "@/lib/validation/schemas";

const SESSION_COOKIE_NAME = "next-auth.session-token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function safeCompareHash(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const payload = parseLoginPayload(await request.json());
    const user = await findUserByEmail(payload.email);

    if (
      !user ||
      !safeCompareHash(hashPassword(payload.password), user.passwordHash)
    ) {
      return apiError(401, "UNAUTHORIZED", "Invalid email or password.");
    }

    await updateLastLogin(user.id);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const sessionToken = await createSessionToken({
      sub: user.id,
      role: user.role,
      iat: nowInSeconds,
      exp: nowInSeconds + SESSION_TTL_SECONDS,
    });

    const response = apiOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
