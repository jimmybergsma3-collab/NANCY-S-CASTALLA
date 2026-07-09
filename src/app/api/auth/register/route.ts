import { NextResponse } from "next/server";
import { supabaseAuthSignup } from "@/lib/supabase-rest";
import { env } from "@/lib/env";
import { defaultLocale, isLocale } from "@/i18n/config";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; password?: string; locale?: string };

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ ok: false, message: "Name, email and password are required." }, { status: 400 });
  }

  try {
    const locale = isLocale(body.locale) ? body.locale : defaultLocale;
    const baseUrl = env.siteUrl || new URL(request.url).origin;
    const redirectTo = new URL(`/${locale}/login?confirmed=1`, baseUrl).toString();
    await supabaseAuthSignup({ name: body.name, email: body.email, password: body.password, locale, redirectTo });
    return NextResponse.json({
      ok: true,
      message: "Account created. Check your email and confirm your address to activate your account.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.name : "REGISTRATION_FAILED";
    return NextResponse.json(
      { ok: false, code, message: error instanceof Error ? error.message : "Registration failed." },
      { status: 503 },
    );
  }
}
