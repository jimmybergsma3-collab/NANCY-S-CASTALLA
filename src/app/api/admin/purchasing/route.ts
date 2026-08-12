import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import {
  createGoodsReceiptForAdmin,
  createPurchaseOrderForAdmin,
  getPurchasingOverview,
  getPurchasingReports,
  processGoodsReceiptForAdmin,
  uploadSupplierInvoiceForAdmin,
} from "@/services/purchasing/purchasing-service";

function jsonError(error: unknown, diagnosticId: string, status = 500) {
  const message = error instanceof Error ? error.message : "Purchasing request failed.";
  console.error("purchasing_api_error", { diagnosticId, message });
  return NextResponse.json({ ok: false, errorCode: "purchasing_request_failed", message, diagnosticId }, { status });
}

function actorFrom(value: unknown) {
  return typeof value === "string" && value.trim().length >= 3 ? value.trim() : env.adminEmail || "admin";
}

async function requireAdminJson(diagnosticId: string) {
  if (await isAdminSession()) return null;
  return NextResponse.json({ ok: false, errorCode: "unauthorized", message: "Unauthorized", diagnosticId }, { status: 401 });
}

export async function GET(request: Request) {
  const diagnosticId = crypto.randomUUID();
  const unauthorized = await requireAdminJson(diagnosticId);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "reports") {
      const report = await getPurchasingReports();
      return NextResponse.json({ ok: true, diagnosticId, report });
    }
    const overview = await getPurchasingOverview();
    return NextResponse.json({ ok: true, diagnosticId, overview });
  } catch (error) {
    return jsonError(error, diagnosticId);
  }
}

export async function POST(request: Request) {
  const diagnosticId = crypto.randomUUID();
  const unauthorized = await requireAdminJson(diagnosticId);
  if (unauthorized) return unauthorized;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const result = await uploadSupplierInvoiceForAdmin(formData, actorFrom(formData.get("actor")));
      return NextResponse.json({ ok: true, diagnosticId, ...result });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ ok: false, errorCode: "invalid_json", message: "Invalid JSON body.", diagnosticId }, { status: 400 });
    }

    const action = typeof body.action === "string" ? body.action : "";
    const actor = actorFrom(body.actor);
    if (action === "create_purchase_order") {
      const result = await createPurchaseOrderForAdmin(
        (body.purchaseOrder ?? body) as Parameters<typeof createPurchaseOrderForAdmin>[0],
        actor,
      );
      return NextResponse.json({ ok: true, diagnosticId, ...result });
    }
    if (action === "create_goods_receipt") {
      const result = await createGoodsReceiptForAdmin(
        (body.goodsReceipt ?? body) as Parameters<typeof createGoodsReceiptForAdmin>[0],
        actor,
      );
      return NextResponse.json({ ok: true, diagnosticId, ...result });
    }
    if (action === "process_goods_receipt") {
      const goodsReceiptId = typeof body.goodsReceiptId === "string" ? body.goodsReceiptId : "";
      if (!goodsReceiptId) {
        return NextResponse.json({ ok: false, errorCode: "missing_goods_receipt_id", message: "Goods receipt id is required.", diagnosticId }, { status: 400 });
      }
      const result = await processGoodsReceiptForAdmin(goodsReceiptId, actor);
      return NextResponse.json({ ok: true, diagnosticId, result });
    }

    return NextResponse.json({ ok: false, errorCode: "unknown_action", message: "Unknown purchasing action.", diagnosticId }, { status: 400 });
  } catch (error) {
    return jsonError(error, diagnosticId);
  }
}
