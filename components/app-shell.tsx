"use client";

import Link from "next/link";
import { Activity, Gauge, RadioTower, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL, fetchProfiles } from "@/lib/api";

type HealthState = "checking" | "online" | "offline";

export function AppShell({ children }: { children: React.ReactNode }) {
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
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 shadow-emerald-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-300">FBR</p>
              <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Forensic AI</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 text-xs font-semibold text-slate-300 md:flex">
            <a href="#ingestion" className="border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/50 hover:text-emerald-100">
              Intake
            </a>
            <a href="#pipeline" className="border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/50 hover:text-emerald-100">
              Pipeline
            </a>
            <a href="#intelligence" className="border border-white/10 bg-white/5 px-3 py-2 transition hover:border-emerald-300/50 hover:text-emerald-100">
              Matrix
            </a>
            <Link href="/pipeline" className="border border-white/10 bg-white/5 px-3 py-2 transition hover:border-sky-300/50 hover:text-sky-100">
              Legacy Deck
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className={`hidden items-center gap-2 border px-3 py-2 text-xs sm:flex ${healthTone}`}>
              <Activity className="h-3.5 w-3.5" />
              API {health === "online" ? "linked" : health === "checking" ? "probing" : "offline"}
            </div>
            <div className="hidden items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 lg:flex">
              <RadioTower className="h-3.5 w-3.5 text-emerald-300" />
              {lastChecked}
            </div>
            <div className="hidden items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 xl:flex">
              <Gauge className="h-3.5 w-3.5 text-emerald-300" />
              <span className="max-w-48 truncate">{API_BASE_URL}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16">{children}</div>
    </div>
  );
}
