import { env } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

export async function logAdminAction(input: {
  recordType: string;
  recordId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdminFetch("admin_audit_log", {
      method: "POST",
      body: {
        admin_email: env.adminEmail || "",
        record_type: input.recordType,
        record_id: input.recordId,
        action: input.action,
        metadata: input.metadata ?? {},
      },
    });
  } catch (error) {
    console.warn("Admin audit log failed", {
      recordType: input.recordType,
      recordId: input.recordId,
      action: input.action,
      message: error instanceof Error ? error.message : "Unknown audit error",
    });
  }
}
