import { NextResponse } from "next/server";
import { supabaseAuthSignup } from "@/lib/supabase-rest";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; password?: string };

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ ok: false, message: "Name, email and password are required." }, { status: 400 });
  }

  try {
    await supabaseAuthSignup({ name: body.name, email: body.email, password: body.password });
    return NextResponse.json({
      ok: true,
      message: "Account created. Please check your email if confirmation is enabled in Supabase.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Registration failed." },
      { status: 503 },
    );
  }
}
