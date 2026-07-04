import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { adminCredentialsMatch, setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!env.adminEmail || !env.adminPassword) {
    return NextResponse.json(
      { ok: false, message: "Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel environment variables first." },
      { status: 503 },
    );
  }

  if (!adminCredentialsMatch(body.email ?? "", body.password ?? "")) {
    return NextResponse.json({ ok: false, message: "Invalid admin login." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
