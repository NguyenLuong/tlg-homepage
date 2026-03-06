import type { NextRequest } from "next/server";

import type { AuthRole } from "@/lib/auth/config";

export const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

const SESSION_TOKEN_VERSION = "v2";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export type SessionTokenPayload = {
  sub: string;
  role: AuthRole;
  iat: number;
  exp: number;
};

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SessionTokenPayload).sub === "string" &&
    ((value as SessionTokenPayload).role === "ADMIN" ||
      (value as SessionTokenPayload).role === "EDITOR") &&
    typeof (value as SessionTokenPayload).iat === "number" &&
    typeof (value as SessionTokenPayload).exp === "number"
  );
}

function toBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  const base64 =
    typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary =
    typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "dev-auth-secret";
}

async function sign(value: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) {
    return false;
  }

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = fromBase64Url(signature);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, signatureBytes as BufferSource, textEncoder.encode(value));
}

export async function createSessionToken(payload: SessionTokenPayload): Promise<string> {
  const payloadEncoded = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signedValue = `${payloadEncoded}.${SESSION_TOKEN_VERSION}`;
  const signature = await sign(signedValue);

  if (!signature) {
    throw new Error("Missing AUTH_SECRET.");
  }

  return `${payloadEncoded}.${signature}.${SESSION_TOKEN_VERSION}`;
}

export async function parseAndVerifySessionToken(
  token: string,
): Promise<SessionTokenPayload | null> {
  const [payloadEncoded, signature, version] = token.split(".");
  if (!payloadEncoded || !signature || version !== SESSION_TOKEN_VERSION) {
    return null;
  }

  const isValidSignature = await verify(`${payloadEncoded}.${version}`, signature);
  if (!isValidSignature) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(textDecoder.decode(fromBase64Url(payloadEncoded))) as unknown;
  } catch {
    return null;
  }

  if (!isSessionTokenPayload(payload)) {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function readSessionToken(request: NextRequest): string | null {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = request.cookies.get(cookieName)?.value;
    if (token) {
      return token;
    }
  }

  return null;
}
