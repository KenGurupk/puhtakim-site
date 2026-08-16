import type { NextRequest } from "next/server";

export const adminSessionCookieName = "pt_admin_session";

const sessionMaxAgeSeconds = 60 * 60 * 8;
const temporaryAdminUsername = "pushtakim-admin";
const temporaryAdminPasswordSalt = "0vUevLYtEyN6tq7ZswEqHA";
const temporaryAdminPasswordHash = "5tVH5ZE6R8NIRw9zm_ZapVbpEIpbwrXxxgElXEn4WCw";
const temporaryAdminPasswordIterations = 210000;

const edgeCredentialNoisePattern = /^[\s\uFEFF\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\u00A0]+|[\s\uFEFF\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\u00A0]+$/g;

function trimCredentialEdges(value: string) {
  return value.replace(edgeCredentialNoisePattern, "");
}

function normalizeCredential(value: string | undefined) {
  const trimmed = trimCredentialEdges(value ?? "").normalize("NFC");

  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith("“") && trimmed.endsWith("”")) ||
      (trimmed.startsWith("‘") && trimmed.endsWith("’")))
  ) {
    return trimCredentialEdges(trimmed.slice(1, -1)).normalize("NFC");
  }

  return trimmed;
}

function getAdminCredentials() {
  return {
    username: normalizeCredential(process.env.ADMIN_USERNAME),
    password: normalizeCredential(process.env.ADMIN_PASSWORD)
  };
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function base64UrlEncode(value: string) {
  if (typeof btoa === "function") {
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  return Buffer.from(value, "utf8").toString("base64url");
}

function bytesToBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

async function hmacSha256(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", textBytes(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, textBytes(value));
  const bytes = Array.from(new Uint8Array(signature));
  const binary = bytes.map((byte) => String.fromCharCode(byte)).join("");
  return base64UrlEncode(binary);
}

async function pbkdf2Sha256(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", textBytes(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: textBytes(salt),
      iterations: temporaryAdminPasswordIterations
    },
    key,
    256
  );

  return bytesToBase64Url(new Uint8Array(bits));
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = textBytes(left);
  const rightBytes = textBytes(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

export function adminAuthConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean((username && password) || (temporaryAdminUsername && temporaryAdminPasswordHash));
}

export async function validateAdminCredentials(username: string, password: string) {
  const expected = getAdminCredentials();
  const normalizedUsername = normalizeCredential(username);
  const normalizedPassword = normalizeCredential(password);

  if (expected.username && expected.password) {
    const envCredentialsMatch =
      timingSafeEqual(normalizedUsername, expected.username) && timingSafeEqual(normalizedPassword, expected.password);

    if (envCredentialsMatch) {
      return true;
    }
  }

  if (!timingSafeEqual(normalizedUsername, temporaryAdminUsername)) {
    return false;
  }

  const submittedHash = await pbkdf2Sha256(normalizedPassword, temporaryAdminPasswordSalt);
  return timingSafeEqual(submittedHash, temporaryAdminPasswordHash);
}

function getAdminSessionIdentity() {
  const { username, password } = getAdminCredentials();

  if (username && password) {
    return {
      username,
      secret: `${username}:${password}`
    };
  }

  return {
    username: temporaryAdminUsername,
    secret: `${temporaryAdminUsername}:${temporaryAdminPasswordHash}`
  };
}

export async function createAdminSessionToken() {
  const { username, secret } = getAdminSessionIdentity();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: username,
    iat: now,
    exp: now + sessionMaxAgeSeconds
  };
  const payloadToken = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(payloadToken, secret);

  return `${payloadToken}.${signature}`;
}

export async function isValidAdminSessionToken(token: string | undefined) {
  if (!token || !adminAuthConfigured()) {
    return false;
  }

  const [payloadToken, signature] = token.split(".");

  if (!payloadToken || !signature) {
    return false;
  }

  const { username, secret } = getAdminSessionIdentity();
  const expectedSignature = await hmacSha256(payloadToken, secret);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadToken)) as { exp?: number; sub?: string };
    return payload.sub === username && typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function hasAdminSession(request: NextRequest) {
  return isValidAdminSessionToken(request.cookies.get(adminSessionCookieName)?.value);
}

export { sessionMaxAgeSeconds };
