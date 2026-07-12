"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArchiveRestore, FileSpreadsheet, RotateCcw, UploadCloud } from "lucide-react";
import type { SupplierImportKind, SupplierImportPreviewReport } from "@/types/imports";

type ImportRun = {
  id: string;
  supplier_name: string;
  source_filename: string;
  import_batch: string;
  file_type: string;
  status: string;
  dry_run: boolean;
  source_row_count: number;
  parsed_product_count: number;
  created_product_count: number;
  updated_offer_count: number;
  skipped_count: number;
  conflict_count: number;
  warning_count: number;
  error_count: number;
  created_at: string;
};

type DryRunResponse = {
  ok: boolean;
  message?: string;
  dryRun?: boolean;
  writes?: {
    productsBefore: number;
    productsAfter: number;
    changedProducts: number;
    supplierOffersWritten: number;
  };
  preview?: SupplierImportPreviewReport;
};

const supplierOptions: Array<{ value: SupplierImportKind; label: string; batch: string; accept: string }> = [
  { value: "europfoods", label: "Europ Foods", batch: "IMPORT_2026_LIVE_EUROPFOODS_JULY", accept: ".pdf,application/pdf" },
  { value: "tindale", label: "Tindale", batch: "IMPORT_2026_LIVE_TINDALE_JULY", accept: ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
];

const numberFormat = new Intl.NumberFormat("en-GB");

function MetricCard({ label, tone = "normal", value }: { label: string; tone?: "normal" | "warning" | "danger" | "good"; value: number | string }) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "warning"
        ? "border-brass/40 bg-cream text-coffee"
        : tone === "good"
          ? "border-forest/15 bg-white text-forest"
          : "border-forest/10 bg-white text-forest";
  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold">{typeof value === "number" ? numberFormat.format(value) : value}</p>
    </div>
  );
}

function ImportHistory({ runs }: { runs: ImportRun[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-forest/10 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-forest text-cream">
          <tr>
            <th className="p-3">Supplier</th>
            <th className="p-3">Batch</th>
            <th className="p-3">File</th>
            <th className="p-3">Status</th>
            <th className="p-3">Rows</th>
            <th className="p-3">Parsed</th>
            <th className="p-3">Conflicts</th>
            <th className="p-3">Created</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr className="border-t border-forest/10" key={run.id}>
              <td className="p-3 font-bold text-forest">{run.supplier_name || "-"}</td>
              <td className="p-3">{run.import_batch}</td>
              <td className="p-3">{run.source_filename}</td>
              <td className="p-3">
                <span className="rounded-full bg-cream px-2 py-1 text-xs font-bold text-forest">{run.status}</span>
              </td>
              <td className="p-3">{run.source_row_count}</td>
              <td className="p-3">{run.parsed_product_count}</td>
              <td className="p-3">{run.conflict_count}</td>
              <td className="p-3">{run.created_product_count}</td>
              <td className="p-3">{run.created_at ? new Date(run.created_at).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {runs.length === 0 ? <p className="p-5 text-sm text-forest/60">No import history yet. Dry-runs do not write records by design.</p> : null}
    </div>
  );
}

function PreviewReport({ preview, writes }: { preview: SupplierImportPreviewReport; writes?: DryRunResponse["writes"] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-forest/10 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-coffee">Dry-run preview</p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-forest">{preview.supplier} - {preview.sourceFilename}</h3>
          </div>
          <span className="w-fit rounded-full bg-cream px-3 py-1 text-xs font-bold text-forest">{preview.importBatch}</span>
        </div>
        <p className="mt-3 text-sm text-forest/65">
          Next available Nancy product code: <strong>{preview.nextProductCode}</strong>. Dry-run writes: products changed{" "}
          <strong>{writes?.changedProducts ?? 0}</strong>, supplier offers written <strong>{writes?.supplierOffersWritten ?? 0}</strong>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Source rows" value={preview.sourceRowCount} />
        <MetricCard label="Parsed products" value={preview.parsedProductCount} tone="good" />
        <MetricCard label="Sections" value={preview.sectionHeadings.length} />
        <MetricCard label="Database products" value={preview.databaseProductCount} />
        <MetricCard label="Duplicate supplier codes" value={preview.duplicateSupplierCodeCount} tone={preview.duplicateSupplierCodeCount ? "warning" : "normal"} />
        <MetricCard label="Missing EAN" value={preview.missingEanCount} tone={preview.missingEanCount ? "warning" : "normal"} />
        <MetricCard label="Unclear package" value={preview.unclearPackageCount} tone={preview.unclearPackageCount ? "warning" : "normal"} />
        <MetricCard label="Missing price" value={preview.missingPriceCount} tone={preview.missingPriceCount ? "danger" : "normal"} />
        <MetricCard label="Active matches" value={preview.possibleActiveMatches} tone={preview.possibleActiveMatches ? "warning" : "normal"} />
        <MetricCard label="Archived matches" value={preview.possibleArchivedMatches} tone={preview.possibleArchivedMatches ? "warning" : "normal"} />
        <MetricCard label="In-file duplicates" value={preview.possibleInFileDuplicates} tone={preview.possibleInFileDuplicates ? "warning" : "normal"} />
        <MetricCard label="Parse issues" value={preview.warnings.length + preview.errors.length} tone={preview.errors.length ? "danger" : preview.warnings.length ? "warning" : "normal"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h4 className="font-serif text-xl font-bold text-forest">Review flags</h4>
          <div className="mt-4 grid gap-2 text-sm text-forest/75">
            <p><strong>Tax review:</strong> {preview.taxReviewRequiredCount}</p>
            <p><strong>Category review:</strong> {preview.categoryReviewRequiredCount}</p>
            <p><strong>Image review:</strong> {preview.imageReviewRequiredCount}</p>
            <p><strong>Translation review:</strong> {preview.translationReviewRequiredCount}</p>
          </div>
        </div>
        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h4 className="font-serif text-xl font-bold text-forest">Section headings</h4>
          <div className="mt-4 max-h-48 overflow-y-auto text-sm text-forest/70">
            {preview.sectionHeadings.slice(0, 40).map((heading) => <p key={heading}>{heading}</p>)}
            {preview.sectionHeadings.length > 40 ? <p className="mt-2 font-bold">+ {preview.sectionHeadings.length - 40} more</p> : null}
            {preview.sectionHeadings.length === 0 ? <p>No sections detected.</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-forest/10 bg-white p-5">
        <h4 className="font-serif text-xl font-bold text-forest">Conflict samples</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-cream text-forest">
              <tr>
                <th className="p-3">Supplier code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Package</th>
                <th className="p-3">Matches</th>
              </tr>
            </thead>
            <tbody>
              {preview.conflictSamples.map((sample, index) => (
                <tr className="border-t border-forest/10" key={`${sample.incoming.supplierCode}-${index}`}>
                  <td className="p-3 font-bold text-forest">{sample.incoming.supplierCode || "-"}</td>
                  <td className="p-3">{sample.incoming.name}</td>
                  <td className="p-3">{sample.incoming.packageDescription || "-"}</td>
                  <td className="p-3">
                    {sample.matches.map((match) => (
                      <p key={`${match.type}-${match.reason}`}>
                        <strong>{match.type}</strong>{match.productIds?.length ? `: ${match.productIds.join(", ")}` : ""} - {match.reason}
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.conflictSamples.length === 0 ? <p className="py-4 text-sm text-forest/60">No conflict samples in this preview.</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h4 className="font-serif text-xl font-bold text-forest">Duplicate supplier-code groups</h4>
          <div className="mt-4 max-h-56 overflow-y-auto text-sm text-forest/70">
            {preview.duplicateSupplierCodeGroups.slice(0, 20).map((group) => (
              <div className="border-b border-forest/10 py-2" key={group.supplierCode}>
                <p className="font-bold text-forest">{group.supplierCode || "No code"} ({group.count})</p>
                <p>{group.samples.join(" | ")}</p>
              </div>
            ))}
            {preview.duplicateSupplierCodeGroups.length === 0 ? <p>No duplicate supplier-code groups detected.</p> : null}
          </div>
        </div>
        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h4 className="font-serif text-xl font-bold text-forest">Warnings and errors</h4>
          <div className="mt-4 max-h-56 overflow-y-auto text-sm text-forest/70">
            {[...preview.errors, ...preview.warnings].slice(0, 30).map((issue, index) => (
              <div className="border-b border-forest/10 py-2" key={`${issue.reason}-${index}`}>
                <p className="font-bold text-forest">{issue.severity ?? "warning"} - {issue.reason}</p>
                <p className="truncate">{issue.sourceRow}</p>
              </div>
            ))}
            {preview.errors.length + preview.warnings.length === 0 ? <p>No parser warnings.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupplierImportsPanel() {
  const [supplier, setSupplier] = useState<SupplierImportKind>("europfoods");
  const [importBatch, setImportBatch] = useState(supplierOptions[0].batch);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<SupplierImportPreviewReport | null>(null);
  const [writes, setWrites] = useState<DryRunResponse["writes"]>();
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [actionBatch, setActionBatch] = useState("");
  const [publishConfirmation, setPublishConfirmation] = useState("");
  const [rollbackConfirmation, setRollbackConfirmation] = useState("");
  const [rollbackTarget, setRollbackTarget] = useState<"draft" | "archived">("draft");

  const selectedSupplier = useMemo(() => supplierOptions.find((option) => option.value === supplier) ?? supplierOptions[0], [supplier]);

  async function loadHistory() {
    const response = await fetch("/api/admin/imports", { cache: "no-store" });
    const data = await response.json() as { ok: boolean; runs?: ImportRun[]; message?: string };
    setRuns(data.runs ?? []);
    if (data.message) setMessage(data.message);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeSupplier(value: SupplierImportKind) {
    const next = supplierOptions.find((option) => option.value === value) ?? supplierOptions[0];
    setSupplier(next.value);
    setImportBatch(next.batch);
    setFile(null);
    setPreview(null);
    setWrites(undefined);
  }

  async function runDryRun(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("Choose a supplier file first.");
      return;
    }
    setLoading(true);
    setMessage("");
    setPreview(null);
    setWrites(undefined);
    const formData = new FormData();
    formData.set("action", "dry-run");
    formData.set("supplier", supplier);
    formData.set("importBatch", importBatch);
    formData.set("file", file);
    try {
      const response = await fetch("/api/admin/imports", { method: "POST", body: formData });
      const data = await response.json() as DryRunResponse;
      if (!response.ok || !data.ok || !data.preview) {
        setMessage(data.message ?? "Dry-run failed.");
        return;
      }
      setPreview(data.preview);
      setWrites(data.writes);
      setActionBatch(data.preview.importBatch);
      setMessage("Dry-run complete. No database records were written.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Dry-run failed.");
    } finally {
      setLoading(false);
    }
  }

  async function guardedConfirmedImport() {
    const formData = new FormData();
    formData.set("action", "confirm-import");
    formData.set("supplier", supplier);
    formData.set("importBatch", importBatch);
    if (file) formData.set("file", file);
    const response = await fetch("/api/admin/imports", { method: "POST", body: formData });
    const data = await response.json() as { message?: string };
    setMessage(data.message ?? (response.ok ? "Import started." : "Confirmed import is not available yet."));
  }

  async function runBatchAction(action: "publish-batch" | "rollback-batch") {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/imports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          importBatch: actionBatch,
          targetStatus: rollbackTarget,
          confirmation: action === "publish-batch" ? publishConfirmation : rollbackConfirmation,
        }),
      });
      const data = await response.json() as { ok: boolean; message?: string; publishedCount?: number; affectedCount?: number };
      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Batch action failed.");
        return;
      }
      setMessage(action === "publish-batch" ? `Published products: ${data.publishedCount ?? 0}` : `Batch products changed: ${data.affectedCount ?? 0}`);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Batch action failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-md border border-brass/30 bg-cream p-4 text-sm leading-6 text-forest">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 shrink-0 text-coffee" size={18} />
          <p>
            This import workflow is safe-first. Dry-run writes nothing. Confirmed import is intentionally guarded until a reviewed preview is approved. Archived products are treated as historical data and are never restored automatically.
          </p>
        </div>
      </div>

      <form className="rounded-md border border-forest/10 bg-white p-5 shadow-soft" onSubmit={runDryRun}>
        <div className="grid gap-4 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-forest">
            Supplier
            <select className="rounded-md border border-forest/15 bg-white px-3 py-2 font-normal" onChange={(event) => changeSupplier(event.target.value as SupplierImportKind)} value={supplier}>
              {supplierOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-forest lg:col-span-2">
            Import batch
            <input className="rounded-md border border-forest/15 bg-white px-3 py-2 font-normal" onChange={(event) => setImportBatch(event.target.value)} value={importBatch} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-forest">
            Supplier file
            <input accept={selectedSupplier.accept} className="rounded-md border border-forest/15 bg-white px-3 py-2 font-normal" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-cream disabled:bg-forest/45" disabled={loading} type="submit">
            <FileSpreadsheet size={17} /> {loading ? "Analysing..." : "Dry run preview"}
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-bold text-forest disabled:opacity-50" disabled={loading || !file} onClick={guardedConfirmedImport} type="button">
            <UploadCloud size={17} /> Confirm import
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-forest/60">
          Confirm import is present for workflow clarity, but the current endpoint deliberately refuses it until a reviewed go-ahead is given. Accepted files: Europ Foods PDF, Tindale XLS/XLSX.
        </p>
      </form>

      {message ? <div className="rounded-md border border-forest/10 bg-white p-4 text-sm font-bold text-forest">{message}</div> : null}
      {preview ? <PreviewReport preview={preview} writes={writes} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h3 className="font-serif text-2xl font-bold text-forest">Publish approved import batch</h3>
          <p className="mt-2 text-sm text-forest/65">Only draft products in the batch that are explicitly ready and review-clean can become active and visible.</p>
          <input className="mt-4 w-full rounded-md border border-forest/15 px-3 py-2 text-sm" onChange={(event) => setActionBatch(event.target.value)} placeholder="IMPORT_2026_LIVE_EUROPFOODS_JULY" value={actionBatch} />
          <input className="mt-3 w-full rounded-md border border-forest/15 px-3 py-2 text-sm" onChange={(event) => setPublishConfirmation(event.target.value)} placeholder="Type PUBLISH APPROVED IMPORT BATCH" value={publishConfirmation} />
          <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-cream disabled:bg-forest/45" disabled={loading} onClick={() => void runBatchAction("publish-batch")} type="button">
            <UploadCloud size={17} /> Publish batch
          </button>
        </div>

        <div className="rounded-md border border-forest/10 bg-white p-5">
          <h3 className="font-serif text-2xl font-bold text-forest">Rollback batch safely</h3>
          <p className="mt-2 text-sm text-forest/65">Rollback never deletes. It hides batch products and deactivates supplier offers from that batch.</p>
          <select className="mt-4 w-full rounded-md border border-forest/15 px-3 py-2 text-sm" onChange={(event) => setRollbackTarget(event.target.value as "draft" | "archived")} value={rollbackTarget}>
            <option value="draft">Back to draft</option>
            <option value="archived">Archive batch</option>
          </select>
          <input className="mt-3 w-full rounded-md border border-forest/15 px-3 py-2 text-sm" onChange={(event) => setRollbackConfirmation(event.target.value)} placeholder="Type ROLLBACK IMPORT BATCH" value={rollbackConfirmation} />
          <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-bold text-forest disabled:opacity-50" disabled={loading} onClick={() => void runBatchAction("rollback-batch")} type="button">
            <ArchiveRestore size={17} /> Rollback batch
          </button>
        </div>
      </div>

      <div className="rounded-md border border-forest/10 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-forest">Import history</h3>
            <p className="mt-1 text-sm text-forest/60">Shows confirmed import runs once the migration is applied and imports are recorded.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={() => void loadHistory()} type="button">
            <RotateCcw size={16} /> Refresh
          </button>
        </div>
        <ImportHistory runs={runs} />
      </div>
    </div>
  );
}
