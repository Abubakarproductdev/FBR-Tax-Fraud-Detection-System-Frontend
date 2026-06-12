export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatCompactPkr(value: number) {
  const absolute = Math.abs(value || 0);

  if (absolute >= 1_000_000_000) {
    return `PKR ${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (absolute >= 1_000_000) {
    return `PKR ${(value / 1_000_000).toFixed(2)}M`;
  }

  return formatCurrency(value);
}

export function formatScore(value: number) {
  return `${Math.round(value || 0)}/100`;
}

export function riskTone(score: number) {
  if (score >= 80) {
    return "border-emerald-400/50 bg-emerald-400/10 text-emerald-200";
  }

  if (score >= 60) {
    return "border-amber-400/50 bg-amber-400/10 text-amber-100";
  }

  return "border-zinc-600 bg-zinc-900/70 text-zinc-300";
}
