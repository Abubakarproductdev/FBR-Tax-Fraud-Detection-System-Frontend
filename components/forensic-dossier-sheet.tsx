"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Car,
  FileText,
  Gauge,
  Home,
  Scale,
  Send,
  SignalHigh,
  UserRound,
  X,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { updateProfileStatus } from "@/lib/api";
import { formatCompactPkr, formatCurrency, formatScore, riskTone } from "@/lib/format";
import type { Profile } from "@/types/domain";

const statusOptions = [
  "Dispatch Notice",
  "Flag for Further Review",
  "Escalate to Field Audit",
  "Hold for Evidence Intake"
];

const topologyNodes = [
  {
    id: "person",
    label: "Person",
    detail: "Resolved entity",
    x: 50,
    y: 46,
    tone: "fill-emerald-300",
    icon: UserRound
  },
  {
    id: "vehicle",
    label: "Vehicle",
    detail: "Excise signal",
    x: 18,
    y: 22,
    tone: "fill-sky-300",
    icon: Car
  },
  {
    id: "property",
    label: "Property",
    detail: "Registry deed",
    x: 82,
    y: 24,
    tone: "fill-amber-300",
    icon: Building2
  },
  {
    id: "meter",
    label: "Meter",
    detail: "Utility bill",
    x: 24,
    y: 78,
    tone: "fill-rose-300",
    icon: Zap
  },
  {
    id: "return",
    label: "TaxReturn",
    detail: "Declared income",
    x: 78,
    y: 78,
    tone: "fill-zinc-300",
    icon: FileText
  }
];

const topologyEdges = [
  { from: "person", to: "vehicle", color: "rgba(125, 211, 252, 0.55)" },
  { from: "person", to: "property", color: "rgba(252, 211, 77, 0.55)" },
  { from: "person", to: "meter", color: "rgba(253, 164, 175, 0.55)" },
  { from: "person", to: "return", color: "rgba(212, 212, 216, 0.45)" }
];

export function ForensicDossierSheet({
  profile,
  entityAlias,
  assetMismatchDelta,
  onClose,
  onStatusUpdated
}: {
  profile: Profile | null;
  entityAlias: string;
  assetMismatchDelta: number;
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
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        aria-label="Forensic case dossier"
        className={`fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col border border-zinc-800 bg-command-900 shadow-2xl transition duration-300 lg:sticky lg:top-24 lg:z-10 lg:h-[calc(100vh-7rem)] lg:min-w-0 ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-8 opacity-0 lg:hidden"
        }`}
      >
        {profile ? (
          <>
            <header className="border-b border-zinc-800 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Forensic Verification Layer</p>
                  <h2 className="mt-2 truncate text-2xl font-semibold text-white">{entityAlias}</h2>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-500">{profile.canonical_id}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-700 text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                  aria-label="Close dossier"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`border px-3 py-1.5 text-xs font-semibold ${riskTone(profile.final_hybrid_risk_score)}`}>
                  Hybrid risk {formatScore(profile.final_hybrid_risk_score)}
                </span>
                <span className="border border-rose-300/40 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
                  Delta {formatCompactPkr(assetMismatchDelta)}
                </span>
                <span className="border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300">
                  Status: {profile.audit_status || "Unassigned"}
                </span>
              </div>
            </header>

            <div className="scrollbar-command flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
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

              <section className="mt-4 border border-zinc-800 bg-command-850">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Network Topology Canvas</h3>
                    <p className="mt-1 text-xs text-zinc-500">Person-centered graph of linked evidence nodes.</p>
                  </div>
                  <Gauge className="h-4 w-4 text-emerald-300" />
                </div>
                <NetworkTopologyCanvas profile={profile} entityAlias={entityAlias} />
              </section>

              <section className="mt-4 border border-rose-300/40 bg-rose-400/[0.06]">
                <div className="flex items-center gap-3 border-b border-rose-300/20 px-4 py-3 text-rose-100">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">Automated Audit Justification & Section 111 Analysis</h3>
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-200/80">Reason</p>
                  <p className="mt-3 border-l-2 border-rose-300/70 bg-zinc-950/60 px-4 py-3 text-sm leading-7 text-zinc-100">
                    {profile.audit_justification_notice || "No audit justification notice generated by the backend yet."}
                  </p>
                </div>
              </section>

              <section className="mt-4 border border-zinc-800 bg-command-850 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start 2xl:flex-row 2xl:items-center">
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
              </section>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function NetworkTopologyCanvas({ profile, entityAlias }: { profile: Profile; entityAlias: string }) {
  const nodeById = Object.fromEntries(topologyNodes.map((node) => [node.id, node]));

  return (
    <div className="relative min-h-[320px] overflow-hidden bg-zinc-950/65 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.12),transparent_35%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Evidence graph">
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {topologyEdges.map((edge) => {
          const from = nodeById[edge.from];
          const to = nodeById[edge.to];

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={edge.color}
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
          );
        })}
        {topologyNodes.map((node) => (
          <g key={node.id} filter="url(#nodeGlow)">
            <circle cx={node.x} cy={node.y} r={node.id === "person" ? 6.5 : 5.1} className={node.tone} />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.id === "person" ? 10 : 7.5}
              fill="transparent"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </svg>

      <div className="relative grid min-h-[288px] grid-cols-3 grid-rows-3 gap-3">
        {topologyNodes.map((node) => {
          const Icon = node.icon;
          const gridPlacement =
            node.id === "person"
              ? "col-start-2 row-start-2 place-self-center"
              : node.id === "vehicle"
                ? "col-start-1 row-start-1"
                : node.id === "property"
                  ? "col-start-3 row-start-1"
                  : node.id === "meter"
                    ? "col-start-1 row-start-3 self-end"
                    : "col-start-3 row-start-3 self-end";

          return (
            <div
              key={node.id}
              className={`${gridPlacement} w-full max-w-36 border border-zinc-700/80 bg-command-900/90 p-3 shadow-2xl`}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-zinc-700 bg-zinc-950 text-emerald-200">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {node.id === "person" ? entityAlias : node.label}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">{node.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-3 grid gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-400 sm:grid-cols-2">
        <span>Utility: {formatCompactPkr(profile.annual_utility_bill_pkr)}</span>
        <span>Risk: {formatScore(profile.final_hybrid_risk_score)}</span>
      </div>
    </div>
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
