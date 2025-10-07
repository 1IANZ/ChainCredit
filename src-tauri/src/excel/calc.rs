use crate::excel::types::{CompanyData, CompanyWithScore, ExcelResult, ScoreDetails};
use calamine::{open_workbook_auto, Reader};
use std::collections::HashMap;
pub fn calculate_credit_score(company: &CompanyData) -> (f64, ScoreDetails) {
    let mut raw_details = ScoreDetails {
        financial_score: 0.0,
        innovation_score: 0.0,
        supply_chain_score: 0.0,
        risk_score: 0.0,
        industry_adjustment: 0.0,
    };

    // 财务评分
    let profit_margin = if company.revenue > 0.0 {
        company.net_profit / company.revenue
    } else {
        0.0
    };
    raw_details.financial_score += match profit_margin {
        x if x >= 0.15 => 15.0,
        x if x >= 0.10 => 12.0,
        x if x >= 0.05 => 8.0,
        x if x >= 0.0 => 5.0,
        _ => 0.0,
    };
    raw_details.financial_score += match company.debt_to_asset_ratio {
        x if x <= 30.0 => 15.0,
        x if x <= 50.0 => 12.0,
        x if x <= 70.0 => 8.0,
        x if x <= 85.0 => 4.0,
        _ => 0.0,
    };
    raw_details.financial_score += match company.total_assets {
        x if x >= 50000.0 => 10.0,
        x if x >= 20000.0 => 8.0,
        x if x >= 10000.0 => 6.0,
        x if x >= 5000.0 => 4.0,
        _ => 2.0,
    };

    // 创新评分
    raw_details.innovation_score += match company.r_and_d_ratio {
        x if x >= 15.0 => 15.0,
        x if x >= 10.0 => 12.0,
        x if x >= 5.0 => 8.0,
        x if x >= 3.0 => 5.0,
        _ => 2.0,
    };
    raw_details.innovation_score += match company.patent_count {
        x if x >= 50 => 15.0,
        x if x >= 20 => 12.0,
        x if x >= 10 => 9.0,
        x if x >= 5 => 6.0,
        x if x >= 1 => 3.0,
        _ => 0.0,
    };

    // 供应链评分
    raw_details.supply_chain_score += match company.upstream_core_companies {
        x if x >= 5 => 10.0,
        x if x >= 3 => 8.0,
        x if x >= 2 => 6.0,
        x if x >= 1 => 4.0,
        _ => 0.0,
    };
    raw_details.supply_chain_score += match company.downstream_customers {
        x if x >= 20 => 10.0,
        x if x >= 10 => 8.0,
        x if x >= 5 => 6.0,
        x if x >= 3 => 4.0,
        _ => 2.0,
    };

    // 风险评分
    let mut risk_score = 10.0;
    risk_score -= 2.0 * (company.overdue_count as f64).min(5.0).sqrt();
    risk_score -= 3.0 * (company.legal_disputes_count as f64).min(5.0).sqrt();
    raw_details.risk_score = risk_score.max(2.0);

    // 行业调整分
    raw_details.industry_adjustment = match company.industry.as_str() {
        "人工智能" | "新能源" | "生物医药" | "新材料" => 5.0,
        "高端制造" | "信息技术" | "节能环保" => 3.0,
        "传统制造" | "房地产" => -3.0,
        "高污染" | "高能耗" => -5.0,
        _ => 0.0,
    };

    let total_score = raw_details.financial_score
        + raw_details.innovation_score
        + raw_details.supply_chain_score
        + raw_details.risk_score
        + raw_details.industry_adjustment;

    // 归一化百分制显示
    let normalized_details = ScoreDetails {
        financial_score: (raw_details.financial_score / 40.0) * 100.0,
        innovation_score: (raw_details.innovation_score / 30.0) * 100.0,
        supply_chain_score: (raw_details.supply_chain_score / 20.0) * 100.0,
        risk_score: (raw_details.risk_score / 10.0) * 100.0,
        industry_adjustment: raw_details.industry_adjustment,
    };

    (total_score.max(0.0).min(100.0), normalized_details)
}

pub fn get_credit_rating(score: f64) -> (String, String, String) {
    match score {
        x if x >= 90.0 => ("AAA".into(), "1000万以上".into(), "低".into()),
        x if x >= 85.0 => ("AA".into(), "800-1000万".into(), "低".into()),
        x if x >= 80.0 => ("A".into(), "500-800万".into(), "低".into()),
        x if x >= 70.0 => ("BBB".into(), "300-500万".into(), "中".into()),
        x if x >= 60.0 => ("BB".into(), "100-300万".into(), "中".into()),
        x if x >= 50.0 => ("B".into(), "50-100万".into(), "高".into()),
        x if x >= 40.0 => ("CCC".into(), "50万以下".into(), "高".into()),
        x if x >= 30.0 => ("CC".into(), "需要担保".into(), "极高".into()),
        _ => ("C".into(), "拒绝授信".into(), "极高".into()),
    }
}

pub fn process_excel_internal(paths: Vec<String>) -> Result<Vec<ExcelResult>, String> {
    let mut all_results = Vec::new();

    for path in paths {
        let mut workbook =
            open_workbook_auto(&path).map_err(|e| format!("无法打开文件 {}: {}", path, e))?;

        for sheet_name in workbook.sheet_names().to_owned() {
            let range = workbook
                .worksheet_range(&sheet_name)
                .map_err(|e| format!("读取工作表 {} 失败: {}", sheet_name, e))?;

            if range.is_empty() {
                continue;
            }

            let mut rows = range.rows();
            let headers: Vec<String> = match rows.next() {
                Some(header_row) => header_row.iter().map(|c| c.to_string()).collect(),
                None => continue,
            };

            let header_map: HashMap<String, usize> = headers
                .iter()
                .enumerate()
                .map(|(i, h)| (h.trim().to_string(), i))
                .collect();

            let mut companies = Vec::new();

            for row in rows {
                let mut row_data = HashMap::new();
                for (col_name, &col_idx) in &header_map {
                    if col_idx < row.len() {
                        row_data.insert(col_name.clone(), row[col_idx].to_string());
                    }
                }

                let company = CompanyData {
                    company_id: row_data.get("企业ID").cloned().unwrap_or_default(),
                    company_name: row_data.get("企业名称").cloned().unwrap_or_default(),
                    industry: row_data.get("行业").cloned().unwrap_or_default(),
                    revenue: row_data
                        .get("营业收入(万元)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    net_profit: row_data
                        .get("净利润(万元)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    total_assets: row_data
                        .get("资产总额(万元)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    total_liabilities: row_data
                        .get("负债总额(万元)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    debt_to_asset_ratio: row_data
                        .get("资产负债率(%)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    r_and_d_ratio: row_data
                        .get("研发投入占比(%)")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0.0),
                    patent_count: row_data
                        .get("专利数量")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0),
                    upstream_core_companies: row_data
                        .get("上游核心企业数量")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0),
                    downstream_customers: row_data
                        .get("下游客户数量")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0),
                    overdue_count: row_data
                        .get("历史逾期次数")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0),
                    legal_disputes_count: row_data
                        .get("法律诉讼次数")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(0),
                };

                if company.company_id.is_empty() && company.company_name.is_empty() {
                    continue;
                }

                let (credit_score, score_details) = calculate_credit_score(&company);
                let (credit_rating, credit_limit, risk_level) = get_credit_rating(credit_score);

                companies.push(CompanyWithScore {
                    company_data: company,
                    credit_score,
                    credit_rating,
                    credit_limit,
                    risk_level,
                    score_details,
                });
            }

            if !companies.is_empty() {
                all_results.push(ExcelResult {
                    file: path.clone(),
                    sheet_name,
                    total_companies: companies.len(),
                    companies,
                });
            }
        }
    }

    Ok(all_results)
}
