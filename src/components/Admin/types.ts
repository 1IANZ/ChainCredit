export interface CompanyChainData {
  company_id: string;
  company_name: string;
  credit_score: number;
  credit_rating: string;
  credit_limit: number;
  risk_level: string;
  timestamp?: number;
  transaction_hash?: string;
}

export type SortField = keyof CompanyChainData;
export type SortOrder = 'asc' | 'desc';
