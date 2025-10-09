use serde::{Deserialize, Serialize};
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CompanyData {
    #[serde(rename = "企业ID")]
    pub company_id: String,
    #[serde(rename = "企业名称")]
    pub company_name: String,
    #[serde(rename = "行业")]
    pub industry: String,
    #[serde(rename = "营业收入(万元)")]
    pub revenue: f64,
    #[serde(rename = "净利润(万元)")]
    pub net_profit: f64,
    #[serde(rename = "资产总额(万元)")]
    pub total_assets: f64,
    #[serde(rename = "负债总额(万元)")]
    pub total_liabilities: f64,
    #[serde(rename = "资产负债率(%)")]
    pub debt_to_asset_ratio: f64,
    #[serde(rename = "研发投入占比(%)")]
    pub r_and_d_ratio: f64,
    #[serde(rename = "专利数量")]
    pub patent_count: i32,
    #[serde(rename = "上游核心企业数量")]
    pub upstream_core_companies: i32,
    #[serde(rename = "下游客户数量")]
    pub downstream_customers: i32,
    #[serde(rename = "历史逾期次数")]
    pub overdue_count: i32,
    #[serde(rename = "法律诉讼次数")]
    pub legal_disputes_count: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CompanyWithScore {
    #[serde(flatten)]
    pub company_data: CompanyData,
    pub credit_score: f64,
    pub credit_rating: String,
    pub credit_limit: String,
    pub risk_level: String,
    pub score_details: ScoreDetails,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScoreDetails {
    pub financial_score: f64,
    pub innovation_score: f64,
    pub supply_chain_score: f64,
    pub risk_score: f64,
    pub industry_adjustment: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExcelResult {
    pub file: String,
    pub sheet_name: String,
    pub total_companies: usize,
    pub companies: Vec<CompanyWithScore>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CompanyDataEn {
    pub company_id: String,
    pub company_name: String,
    pub industry: String,
    pub revenue: f64,
    pub net_profit: f64,
    pub total_assets: f64,
    pub total_liabilities: f64,
    pub debt_to_asset_ratio: f64,
    pub r_and_d_ratio: f64,
    pub patent_count: i32,
    pub upstream_core_companies: i32,
    pub downstream_customers: i32,
    pub overdue_count: i32,
    pub legal_disputes_count: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ScoreDetailsEn {
    pub financial_score: f64,
    pub innovation_score: f64,
    pub supply_chain_score: f64,
    pub risk_score: f64,
    pub industry_adjustment: f64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CompanyWithScoreEn {
    pub company_data: CompanyDataEn,
    pub credit_score: f64,
    pub credit_rating: String,
    pub credit_limit: String,
    pub risk_level: String,
    pub score_details: ScoreDetailsEn,
}

#[derive(Serialize)]
pub struct ExcelResultEn {
    pub file: String,
    pub sheet_name: String,
    pub total_companies: usize,
    pub companies: Vec<CompanyWithScoreEn>,
}

impl From<CompanyData> for CompanyDataEn {
    fn from(c: CompanyData) -> Self {
        Self {
            company_id: c.company_id,
            company_name: c.company_name,
            industry: c.industry,
            revenue: c.revenue,
            net_profit: c.net_profit,
            total_assets: c.total_assets,
            total_liabilities: c.total_liabilities,
            debt_to_asset_ratio: c.debt_to_asset_ratio,
            r_and_d_ratio: c.r_and_d_ratio,
            patent_count: c.patent_count,
            upstream_core_companies: c.upstream_core_companies,
            downstream_customers: c.downstream_customers,
            overdue_count: c.overdue_count,
            legal_disputes_count: c.legal_disputes_count,
        }
    }
}

impl From<ScoreDetails> for ScoreDetailsEn {
    fn from(s: ScoreDetails) -> Self {
        Self {
            financial_score: s.financial_score,
            innovation_score: s.innovation_score,
            supply_chain_score: s.supply_chain_score,
            risk_score: s.risk_score,
            industry_adjustment: s.industry_adjustment,
        }
    }
}

impl From<CompanyWithScore> for CompanyWithScoreEn {
    fn from(c: CompanyWithScore) -> Self {
        Self {
            company_data: c.company_data.into(),
            credit_score: c.credit_score,
            credit_rating: c.credit_rating,
            credit_limit: c.credit_limit,
            risk_level: c.risk_level,
            score_details: c.score_details.into(),
        }
    }
}

impl From<ExcelResult> for ExcelResultEn {
    fn from(e: ExcelResult) -> Self {
        Self {
            file: e.file,
            sheet_name: e.sheet_name,
            total_companies: e.total_companies,
            companies: e.companies.into_iter().map(|c| c.into()).collect(),
        }
    }
}
