import { SESSION_COOKIE_NAMES } from "@/lib/auth/session-token";
import { apiOk } from "@/lib/http/api-response";

export async function POST() {
  const response = apiOk({ message: "Logged out successfully" });

  // Clear all session cookies
  for (const cookieName of SESSION_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });
  }

  return response;
}
