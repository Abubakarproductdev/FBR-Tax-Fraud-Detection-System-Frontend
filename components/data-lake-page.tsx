"use client";

import { motion } from "framer-motion";
import { Building2, Car, FileSpreadsheet, Landmark, Zap } from "lucide-react";
import { useState } from "react";

type DatasetKey = "fbr" | "excise" | "property" | "utility";

const datasets: Record<
  DatasetKey,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    columns: string[];
    rows: string[][];
  }
> = {
  fbr: {
    label: "FBR Filings",
    description: "Declared income, return year, and taxpayer identity fields from synthetic FBR submissions.",
    icon: Landmark,
    columns: ["fbr_id", "taxpayer_name", "reported_address", "declared_income_pkr", "tax_year"],
    rows: [
      ["FBR-2026-001", "Hashir Ahmed", "Gulberg III, Lahore", "0", "2025"],
      ["FBR-2026-017", "Sana Javed", "DHA Phase 6, Karachi", "1,250,000", "2025"],
      ["FBR-2026-044", "Bilal Khan", "Blue Area, Islamabad", "850,000", "2025"],
      ["FBR-2026-088", "Shahzad Ali", "Model Town, Multan", "0", "2025"]
    ]
  },
  excise: {
    label: "Excise Vehicles",
    description: "Vehicle registry evidence that contributes visible asset footprint and lifestyle signals.",
    icon: Car,
    columns: ["vehicle_reg_no", "owner_name", "make_model", "engine_cc", "declared_value_pkr"],
    rows: [
      ["LEA-4477", "Hashir A.", "Toyota Land Cruiser", "3000", "31,500,000"],
      ["BFD-2199", "Sana Javed", "Honda Civic Oriel", "1800", "7,400,000"],
      ["ICT-9071", "Bilal Khan", "Suzuki Alto", "660", "2,850,000"],
      ["MNA-5108", "Shahzad Ali", "Toyota Fortuner", "2700", "18,200,000"]
    ]
  },
  property: {
    label: "Property Registry",
    description: "Registry deeds, buyer names, and parcel valuation records used for asset reconciliation.",
    icon: Building2,
    columns: ["registry_deed_no", "buyer_name", "property_address", "valuation_pkr", "mutation_date"],
    rows: [
      ["REG-LHR-9031", "Hashir Ahmed", "1 Kanal, DHA Lahore", "72,000,000", "2025-03-11"],
      ["REG-KHI-1204", "Sana J.", "Apartment, Clifton Block 8", "38,500,000", "2025-01-22"],
      ["REG-ISB-7712", "B. Khan", "Plot, G-13 Islamabad", "21,300,000", "2024-12-19"],
      ["REG-MUL-3319", "Shahzad Ali", "Commercial Unit, Bosan Road", "47,800,000", "2025-04-03"]
    ]
  },
  utility: {
    label: "Utility DISCOs",
    description: "Annual meter consumption and billing anomalies associated with residential footprints.",
    icon: Zap,
    columns: ["meter_ref_no", "consumer_name", "installation_address", "annual_bill_pkr", "disco_region"],
    rows: [
      ["LESCO-9981", "H Ahmed", "Gulberg III, Lahore", "774,948", "LESCO"],
      ["K-E-1208", "Sana Javed", "DHA Phase 6, Karachi", "486,200", "K-Electric"],
      ["IESCO-5510", "Bilal K.", "Blue Area, Islamabad", "221,450", "IESCO"],
      ["MEPCO-7612", "Shahzad A.", "Model Town, Multan", "651,192", "MEPCO"]
    ]
  }
};

const datasetOrder: DatasetKey[] = ["fbr", "excise", "property", "utility"];

export function DataLakePage() {
  const [activeDataset, setActiveDataset] = useState<DatasetKey>("fbr");
  const dataset = datasets[activeDataset];
  const Icon = dataset.icon;

  return (
    <div className="mx-auto max-w-[1500px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Raw Source Datasets</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
          Evidence before intelligence.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          A judge-friendly look at the messy source records before entity resolution, graph analytics, and Groq audit narrative generation.
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {datasetOrder.map((key) => {
            const item = datasets[key];
            const ItemIcon = item.icon;
            const active = key === activeDataset;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDataset(key)}
                className={`group flex w-full items-center gap-3 border p-4 text-left backdrop-blur-md transition ${
                  active ? "border-emerald-300/50 bg-emerald-300/10" : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/10 bg-slate-950/70 text-emerald-200">
                  <ItemIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{item.rows.length} records previewed</span>
                </span>
              </button>
            );
          })}
        </aside>

        <motion.section
          key={activeDataset}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="min-w-0 border border-white/10 bg-white/5 p-5 backdrop-blur-md"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center border border-white/10 bg-slate-950/70 text-emerald-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{dataset.label}</h3>
                  <p className="mt-1 text-sm text-slate-400">{dataset.description}</p>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" />
              Mock source CSV
            </div>
          </div>

          <div className="scrollbar-command mt-5 max-h-[620px] overflow-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900/95 text-xs uppercase tracking-[0.18em] text-slate-500 backdrop-blur-md">
                <tr>
                  {dataset.columns.map((column) => (
                    <th key={column} className="border-b border-white/10 px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.rows.map((row) => (
                  <tr key={row.join("-")} className="border-b border-white/5 text-slate-300 transition hover:bg-white/[0.035]">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
