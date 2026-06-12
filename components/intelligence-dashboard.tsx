"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BadgeAlert,
  Database,
  FileSearch,
  RefreshCw,
  Scale,
  ShieldAlert,
  SignalHigh
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchMetrics, fetchProfiles } from "@/lib/api";
import { formatCompactPkr, formatCurrency, formatScore, riskTone } from "@/lib/format";
import type { Profile, SystemMetrics } from "@/types/domain";
import { ForensicDossierSheet } from "@/components/forensic-dossier-sheet";

export function IntelligenceDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [nextMetrics, nextProfiles] = await Promise.all([fetchMetrics(), fetchProfiles()]);
      setMetrics(nextMetrics);
      setProfiles(nextProfiles);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the FastAPI intelligence service at http://127.0.0.1:8000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => b.final_hybrid_risk_score - a.final_hybrid_risk_score),
    [profiles]
  );

  function updateProfileStatus(canonicalId: string, status: string) {
    setProfiles((current) =>
      current.map((profile) =>
        profile.canonical_id === canonicalId ? { ...profile, audit_status: status } : profile
      )
    );
    setSelectedProfile((current) =>
      current?.canonical_id === canonicalId ? { ...current, audit_status: status } : current
    );
  }

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
      <section className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-300">Network Intelligence Grid</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            High-risk taxpayer network analytics
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Live operational view sourced from FastAPI profiles, metrics, and audit status endpoints.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-400/60 hover:text-emerald-100 disabled:cursor-wait disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      {error ? (
        <div className="flex items-start gap-3 border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Backend connection interrupted</p>
            <p className="mt-1 text-rose-100/80">{error}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={ShieldAlert}
          label="Total Prioritized Networks"
          value={metrics ? metrics.total_high_risk_targets.toLocaleString() : loading ? "..." : "0"}
          caption="Profiles over active audit threshold"
        />
        <MetricCard
          icon={SignalHigh}
          label="Max Network Deviation Risk Score"
          value={metrics ? formatScore(metrics.maximum_hybrid_risk_score) : loading ? "..." : "0/100"}
          caption="Highest hybrid score in current ledger"
        />
        <MetricCard
          icon={Scale}
          label="Cumulative Unexplained Shielded Wealth"
          value={metrics ? formatCompactPkr(metrics.aggregate_unexplained_wealth_pkr) : loading ? "..." : "PKR 0"}
          caption="Aggregate variance for prioritized networks"
        />
      </section>

      <section className="border border-zinc-800 bg-command-900/80">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-white">Main High-Risk Target Ledger</h3>
            <p className="mt-1 text-sm text-zinc-400">Canonical entities ranked by hybrid forensic risk.</p>
          </div>
          <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
            <Database className="h-3.5 w-3.5 text-emerald-300" />
            {profiles.length.toLocaleString()} profiles loaded
          </div>
        </div>

        <div className="scrollbar-command overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-zinc-950/70 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="border-b border-zinc-800 px-4 py-3 font-medium">Canonical ID</th>
                <th className="border-b border-zinc-800 px-4 py-3 font-medium">Declared Income</th>
                <th className="border-b border-zinc-800 px-4 py-3 font-medium">Total Visible Wealth</th>
                <th className="border-b border-zinc-800 px-4 py-3 font-medium">GNN Structural Score</th>
                <th className="border-b border-zinc-800 px-4 py-3 font-medium">Final Hybrid Risk Score</th>
                <th className="border-b border-zinc-800 px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-zinc-800/80">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="h-4 animate-pulse bg-zinc-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedProfiles.length ? (
                sortedProfiles.map((profile) => {
                  const highRisk = profile.final_hybrid_risk_score > 80;

                  return (
                    <tr
                      key={profile.canonical_id}
                      className={`border-b border-zinc-800/80 transition hover:bg-zinc-900/80 ${
                        highRisk ? "bg-emerald-400/[0.035]" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-zinc-100">
                            {profile.canonical_id}
                          </span>
                          {highRisk ? (
                            <span className="inline-flex items-center gap-1 border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                              <BadgeAlert className="h-3 w-3" />
                              Priority
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{formatCurrency(profile.total_declared_income)}</td>
                      <td className="px-4 py-4 text-zinc-300">{formatCurrency(profile.total_visible_wealth_pkr)}</td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-zinc-200">
                          {formatScore(profile.gnn_structural_anomaly_score)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex border px-2.5 py-1 font-mono text-xs ${riskTone(profile.final_hybrid_risk_score)}`}>
                          {formatScore(profile.final_hybrid_risk_score)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedProfile(profile)}
                          className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-emerald-400/60 hover:bg-emerald-400/10 hover:text-emerald-100"
                        >
                          <FileSearch className="h-3.5 w-3.5" />
                          Inspect Dossier
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-zinc-400">
                    No profiles returned by the FastAPI backend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ForensicDossierSheet
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onStatusUpdated={updateProfileStatus}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  caption
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <article className="border border-zinc-800 bg-command-900/80 p-5">
      <div className="flex items-center justify-between text-zinc-500">
        <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <p className="mt-5 break-words text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{caption}</p>
    </article>
  );
}
