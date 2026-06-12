export interface Profile {
  canonical_id: string;
  total_declared_income: number;
  total_visible_wealth_pkr: number;
  annual_utility_bill_pkr: number;
  gnn_structural_anomaly_score: number;
  final_hybrid_risk_score: number;
  audit_justification_notice: string;
  audit_status: string;
}

export interface SystemMetrics {
  total_high_risk_targets: number;
  maximum_hybrid_risk_score: number;
  aggregate_unexplained_wealth_pkr: number;
}
