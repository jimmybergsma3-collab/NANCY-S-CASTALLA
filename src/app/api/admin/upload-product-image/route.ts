import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { env, hasSupabaseAdmin } from "@/lib/env";

function extensionFromFile(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  return file.type.split("/").pop() || "jpg";
}

function safeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function ensureBucket() {
  const response = await fetch(`${env.supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: env.productImagesBucket,
      name: env.productImagesBucket,
      public: true,
    }),
  });

  if (response.ok || response.status === 409 || response.status === 400) {
    return;
  }

  throw new Error(await response.text());
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const productId = String(formData.get("productId") || "product");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Choose an image file first." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "Only image files are supported." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: "Image is too large. Maximum size is 5MB." }, { status: 400 });
  }

  await ensureBucket();

  const extension = extensionFromFile(file);
  const path = `${safeName(productId) || "product"}/${Date.now()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const upload = await fetch(`${env.supabaseUrl}/storage/v1/object/${env.productImagesBucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: bytes,
  });

  if (!upload.ok) {
    return NextResponse.json({ ok: false, message: await upload.text() }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    imageUrl: `${env.supabaseUrl}/storage/v1/object/public/${env.productImagesBucket}/${path}`,
  });
}
