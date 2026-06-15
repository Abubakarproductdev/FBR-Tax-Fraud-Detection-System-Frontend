"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  Network,
  RadioTower,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { API_BASE_URL, fetchProfiles } from "@/lib/api";

const navigation = [
  { href: "/", label: "Intelligence Matrix", icon: LayoutDashboard },
  { href: "/data-lake", label: "Raw Source Datasets", icon: Database },
  { href: "/architecture", label: "Pipeline Deep Dive", icon: Network },
  { href: "/orchestrator", label: "System Controls", icon: SlidersHorizontal }
];

type HealthState = "checking" | "online" | "offline";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [health, setHealth] = useState<HealthState>("checking");
  const [lastChecked, setLastChecked] = useState("Booting");

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      setHealth((current) => (current === "online" ? "online" : "checking"));
      try {
        await fetchProfiles();
        if (!active) return;
        setHealth("online");
        setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (!active) return;
        setHealth("offline");
        setLastChecked("Offline");
      }
    }

    checkHealth();
    const interval = window.setInterval(checkHealth, 18000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const healthTone =
    health === "online"
      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
      : health === "checking"
        ? "border-sky-300/40 bg-sky-300/10 text-sky-100"
        : "border-rose-300/40 bg-rose-300/10 text-rose-100";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_16%_10%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_84%_4%,rgba(244,63,94,0.1),transparent_24%),linear-gradient(135deg,#020617,#18181b_48%,#0f172a)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <motion.aside
        animate={{ width: collapsed ? 92 : 304 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-slate-950/65 px-4 py-5 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl lg:flex lg:flex-col"
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 shadow-emerald-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-300">FBR</p>
                <h1 className="truncate text-sm font-semibold uppercase tracking-[0.2em] text-white">Forensic AI</h1>
              </div>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 bg-white/5 text-slate-300 transition hover:border-emerald-300/50 hover:text-emerald-100"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className={`flex items-center gap-2 border px-3 py-2 text-xs ${healthTone}`}>
            <Activity className="h-3.5 w-3.5 shrink-0" />
            {!collapsed ? (
              <span>API {health === "online" ? "linked" : health === "checking" ? "probing" : "offline"}</span>
            ) : null}
          </div>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                <RadioTower className="h-3.5 w-3.5 text-emerald-300" />
                Last check: {lastChecked}
              </div>
              <div className="border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <Gauge className="h-3.5 w-3.5 text-emerald-300" />
                  Endpoint
                </div>
                <p className="mt-2 break-all font-mono text-xs text-slate-300">{API_BASE_URL}</p>
              </div>
            </>
          ) : null}
        </div>
      </motion.aside>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">FBR</p>
              <p className="text-sm font-semibold text-white">Forensic AI</p>
            </div>
          </Link>
          <div className={`flex items-center gap-2 border px-3 py-2 text-xs ${healthTone}`}>
            <Activity className="h-3.5 w-3.5" />
            API
          </div>
        </div>
        <nav className="scrollbar-command flex gap-2 overflow-x-auto px-4 pb-3">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border px-3 py-2 text-xs font-semibold ${
                  active
                    ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main
        className={`relative z-10 px-4 py-6 transition-[padding] duration-300 sm:px-6 lg:py-8 ${
          collapsed ? "lg:pl-[116px]" : "lg:pl-[328px]"
        } lg:pr-8`}
      >
        {children}
      </main>
    </div>
  );
}
