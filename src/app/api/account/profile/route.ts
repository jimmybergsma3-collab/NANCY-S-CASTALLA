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
  const metadataLanguage = ["en", "nl", "de", "es", "sv"].includes(user.user_metadata?.language ?? "") ? user.user_metadata?.language : "en";
  return NextResponse.json({ profile: profile ?? { name: user.user_metadata?.name ?? "", email: user.email ?? "", phone: "", address: "", language: metadataLanguage } });
}

export async function PATCH(request: Request) {
  const user = await getCustomerAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdmin()) return NextResponse.json({ message: "Account service is unavailable." }, { status: 503 });
  const body = await request.json() as { name?: string; phone?: string; address?: string; language?: string };
  const existing = await getProfile(user.id);
  const name = body.name?.trim() || existing?.name || user.user_metadata?.name?.trim();
  if (!name) return NextResponse.json({ message: "Name is required." }, { status: 400 });
  const requestedLanguage = body.language ?? existing?.language ?? "en";
  const language = ["en", "nl", "de", "es", "sv"].includes(requestedLanguage) ? requestedLanguage : "en";
  const phone = body.phone === undefined ? existing?.phone ?? "" : body.phone.trim();
  const address = body.address === undefined ? existing?.address ?? "" : body.address.trim();
  if (existing) {
    await supabaseAdminFetch(`customers?id=eq.${existing.id}`, { method: "PATCH", body: { name, phone, address, language, updated_at: new Date().toISOString() } });
  } else {
    await supabaseAdminFetch("customers", { method: "POST", body: { auth_user_id: user.id, name, email: user.email?.toLowerCase() ?? "", phone, address, language } });
  }
  return NextResponse.json({ profile: await getProfile(user.id) });
}
