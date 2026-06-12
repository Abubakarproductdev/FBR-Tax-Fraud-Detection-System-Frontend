"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Gauge, LayoutDashboard, RadioTower, Server, ShieldCheck, Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL, fetchMetrics } from "@/lib/api";

const navigation = [
  {
    href: "/pipeline",
    label: "Pipeline Deck",
    icon: Workflow
  },
  {
    href: "/",
    label: "Intelligence Grid",
    icon: LayoutDashboard
  }
];

type HealthState = "checking" | "online" | "offline";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthState>("checking");
  const [lastChecked, setLastChecked] = useState<string>("Booting handshake");

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      setHealth((current) => (current === "online" ? "online" : "checking"));
      try {
        await fetchMetrics();
        if (!active) return;
        setHealth("online");
        setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (!active) return;
        setHealth("offline");
        setLastChecked("Backend unreachable");
      }
    }

    checkHealth();
    const interval = window.setInterval(checkHealth, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const healthTone =
    health === "online"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      : health === "checking"
        ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
        : "border-rose-400/40 bg-rose-400/10 text-rose-200";

  return (
    <div className="min-h-screen bg-command-950 text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-800/90 bg-command-900/95 px-5 py-6 backdrop-blur xl:block">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center border border-emerald-400/50 bg-emerald-400/10 text-emerald-300 shadow-emerald-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-300">FBR</p>
            <h1 className="text-base font-semibold uppercase tracking-[0.18em] text-white">
              Analytics Labs
            </h1>
          </div>
        </Link>

        <div className="mt-10 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                    : "border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className={`h-1.5 w-1.5 ${active ? "bg-emerald-300" : "bg-zinc-700"}`} />
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-5 right-5 border border-zinc-800 bg-command-850 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
            <span>Endpoint</span>
            <Server className="h-3.5 w-3.5" />
          </div>
          <p className="mt-3 break-all font-mono text-xs text-zinc-300">{API_BASE_URL}</p>
          <div className={`mt-4 flex items-center gap-2 border px-3 py-2 text-xs ${healthTone}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping ${
                  health === "online" ? "bg-emerald-300" : "bg-rose-300"
                } opacity-60`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 ${
                  health === "online" ? "bg-emerald-300" : "bg-rose-300"
                }`}
              />
            </span>
            {health === "online" ? "Operational" : health === "checking" ? "Checking" : "Disconnected"}
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-zinc-800/90 bg-command-950/86 backdrop-blur">
          <div className="flex min-h-16 flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 xl:hidden">
              <div className="grid h-9 w-9 place-items-center border border-emerald-400/50 bg-emerald-400/10 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                  FBR Analytics Labs
                </p>
                <p className="text-sm font-semibold text-white">Forensic Command Center</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <RadioTower className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium text-zinc-200">Global System Health</span>
              <span className="font-mono text-xs text-zinc-500">Last check: {lastChecked}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center gap-2 border px-3 py-2 text-xs ${healthTone}`}>
                <Activity className="h-3.5 w-3.5" />
                API {health === "online" ? "linked" : health === "checking" ? "probing" : "offline"}
              </div>
              <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300">
                <Gauge className="h-3.5 w-3.5 text-emerald-300" />
                Live fetch mode
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
