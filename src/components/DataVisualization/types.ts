export interface CompanyData {
  company_id: string;
  company_name: string;
  industry: string;
  revenue: number;
  net_profit: number;
  total_assets: number;
  total_liabilities: number;
  debt_to_asset_ratio: number;
  r_and_d_ratio: number;
  patent_count: number;
  upstream_core_companies: number;
  downstream_customers: number;
  overdue_count: number;
  legal_disputes_count: number;
}

export interface ScoreDetails {
  financial_score: number;
  innovation_score: number;
  supply_chain_score: number;
  risk_score: number;
  industry_adjustment: number;
}

export interface Company {
  company_data: CompanyData;
  credit_score: number;
  credit_rating: string;
  credit_limit: string;
  risk_level: string;
  score_details: ScoreDetails;
}

export interface ExcelResult {
  file: string;
  sheet_name: string;
  total_companies: number;
  companies: Company[];
}
