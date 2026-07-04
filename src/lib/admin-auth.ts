import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

const ADMIN_COOKIE = "nancys_admin";
const ADMIN_SESSION_MESSAGE = "nancys-castalla-admin-session-v1";

function adminSessionToken() {
  return createHmac("sha256", env.adminPassword).update(ADMIN_SESSION_MESSAGE).digest("hex");
}

export function adminCredentialsMatch(email: string, password: string) {
  if (!env.adminEmail || !env.adminPassword) return false;
  const suppliedEmail = email.trim().toLowerCase();
  const expectedEmail = env.adminEmail.trim().toLowerCase();
  const suppliedPassword = Buffer.from(password);
  const expectedPassword = Buffer.from(env.adminPassword);
  const emailMatches = suppliedEmail === expectedEmail;
  const passwordMatches = suppliedPassword.length === expectedPassword.length
    && timingSafeEqual(suppliedPassword, expectedPassword);
  return emailMatches && passwordMatches;
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!env.adminPassword || !token) return false;
  const expected = adminSessionToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
