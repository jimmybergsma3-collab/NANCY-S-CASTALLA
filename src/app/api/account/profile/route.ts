import { NextResponse } from "next/server";
import { getCustomerAuthUser } from "@/lib/customer-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

type CustomerProfile = { id: string; name: string; email: string; phone: string; address: string; language: string };

async function getProfile(userId: string) {
  const rows = await supabaseAdminFetch<CustomerProfile[]>(`customers?select=id,name,email,phone,address,language&auth_user_id=eq.${userId}&limit=1`);
  return rows[0];
}

export async function GET(request: Request) {
  const user = await getCustomerAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdmin()) return NextResponse.json({ message: "Account service is unavailable." }, { status: 503 });
  const profile = await getProfile(user.id);
  return NextResponse.json({ profile: profile ?? { name: user.user_metadata?.name ?? "", email: user.email ?? "", phone: "", address: "", language: "en" } });
}

export async function PATCH(request: Request) {
  const user = await getCustomerAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdmin()) return NextResponse.json({ message: "Account service is unavailable." }, { status: 503 });
  const body = await request.json() as { name?: string; phone?: string; address?: string; language?: string };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ message: "Name is required." }, { status: 400 });
  const language = ["en", "nl", "de", "es", "sv"].includes(body.language ?? "") ? body.language : "en";
  const existing = await getProfile(user.id);
  if (existing) {
    await supabaseAdminFetch(`customers?id=eq.${existing.id}`, { method: "PATCH", body: { name, phone: body.phone?.trim() ?? "", address: body.address?.trim() ?? "", language, updated_at: new Date().toISOString() } });
  } else {
    await supabaseAdminFetch("customers", { method: "POST", body: { auth_user_id: user.id, name, email: user.email?.toLowerCase() ?? "", phone: body.phone?.trim() ?? "", address: body.address?.trim() ?? "", language } });
  }
  return NextResponse.json({ profile: await getProfile(user.id) });
}
