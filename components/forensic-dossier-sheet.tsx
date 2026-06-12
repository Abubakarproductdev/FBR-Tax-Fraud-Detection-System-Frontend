"use client";

import { AlertTriangle, BadgeCheck, FileText, Scale, Send, SignalHigh, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency, formatScore, riskTone } from "@/lib/format";
import { updateProfileStatus } from "@/lib/api";
import type { Profile } from "@/types/domain";

const statusOptions = [
  "Dispatch Notice",
  "Flag for Further Review",
  "Escalate to Field Audit",
  "Hold for Evidence Intake"
];

export function ForensicDossierSheet({
  profile,
  onClose,
  onStatusUpdated
}: {
  profile: Profile | null;
  onClose: () => void;
  onStatusUpdated: (canonicalId: string, status: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wealthIncomeRatio = useMemo(() => {
    if (!profile?.total_declared_income) return 0;
    return profile.total_visible_wealth_pkr / profile.total_declared_income;
  }, [profile]);

  async function handleStatusChange(status: string) {
    if (!profile || !status) return;

    setPending(true);
    setError(null);
    setNotice(null);

    try {
      await updateProfileStatus(profile.canonical_id, status);
      onStatusUpdated(profile.canonical_id, status);
      setNotice(`Administrative milestone updated: ${status}`);
      window.setTimeout(() => setNotice(null), 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update audit status.");
    } finally {
      setPending(false);
    }
  }

  const open = Boolean(profile);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <section
        aria-label="Forensic case dossier"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-zinc-800 bg-command-900 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {profile ? (
          <>
            <header className="border-b border-zinc-800 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Forensic Dossier</p>
                  <h2 className="mt-2 font-mono text-2xl font-semibold text-white">{profile.canonical_id}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 place-items-center border border-zinc-700 text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                  aria-label="Close dossier"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`border px-3 py-1.5 text-xs font-semibold ${riskTone(profile.final_hybrid_risk_score)}`}>
                  Hybrid risk {formatScore(profile.final_hybrid_risk_score)}
                </span>
                <span className="border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300">
                  Status: {profile.audit_status || "Unassigned"}
                </span>
              </div>
            </header>

            <div className="scrollbar-command flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <DossierMetric
                  icon={Scale}
                  label="Declared Income"
                  value={formatCurrency(profile.total_declared_income)}
                />
                <DossierMetric
                  icon={SignalHigh}
                  label="Visible Wealth"
                  value={formatCurrency(profile.total_visible_wealth_pkr)}
                />
                <DossierMetric
                  icon={AlertTriangle}
                  label="Wealth Ratio"
                  value={`${wealthIncomeRatio.toFixed(1)}x`}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="border border-zinc-800 bg-command-850 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Utility Bill Footprint</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {formatCurrency(profile.annual_utility_bill_pkr)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Annual household consumption signal used as a lifestyle consistency marker.
                  </p>
                </div>
                <div className="border border-zinc-800 bg-command-850 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">GNN Anomaly Breakdown</p>
                  <div className="mt-4 h-2 overflow-hidden bg-zinc-800">
                    <div
                      className="h-full bg-emerald-300 transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, profile.gnn_structural_anomaly_score))}%`
                      }}
                    />
                  </div>
                  <p className="mt-3 font-mono text-2xl font-semibold text-emerald-200">
                    {formatScore(profile.gnn_structural_anomaly_score)}
                  </p>
                </div>
              </div>

              <div className="mt-5 border border-emerald-400/40 bg-emerald-400/[0.06]">
                <div className="flex items-center gap-3 border-b border-emerald-400/20 px-4 py-3 text-emerald-100">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">AI-Generated Forensic Audit Justification Notice</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-emerald-200">
                    Section 111 reference: Income Tax Ordinance, 2001
                  </p>
                  <textarea
                    readOnly
                    value={profile.audit_justification_notice || "No notice generated by the backend yet."}
                    className="mt-3 min-h-64 w-full resize-none border border-zinc-700 bg-zinc-950/70 p-4 text-sm leading-7 text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 border border-zinc-800 bg-command-850 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Administrative Action</p>
                    <p className="mt-2 text-sm text-zinc-300">Update the active audit milestone for this dossier.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-emerald-300" />
                    <select
                      disabled={pending}
                      defaultValue=""
                      onChange={(event) => handleStatusChange(event.target.value)}
                      className="min-w-56 border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition hover:border-emerald-400/60 disabled:cursor-wait disabled:opacity-60"
                    >
                      <option value="" disabled>
                        Select milestone
                      </option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {notice ? (
                  <div className="mt-4 flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                    <BadgeCheck className="h-4 w-4" />
                    {notice}
                  </div>
                ) : null}
                {error ? (
                  <div className="mt-4 border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

function DossierMetric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-zinc-800 bg-command-850 p-4">
      <div className="flex items-center justify-between text-zinc-500">
        <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <p className="mt-3 break-words text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
