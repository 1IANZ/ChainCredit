use calamine::{open_workbook_auto, Reader};
use rust_xlsxwriter::{workbook::Workbook, Format};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CompanyData {
    #[serde(rename = "企业ID")]
    company_id: String,
    #[serde(rename = "企业名称")]
    company_name: String,
    #[serde(rename = "行业")]
    industry: String,
    #[serde(rename = "营业收入(万元)")]
    revenue: f64,
    #[serde(rename = "净利润(万元)")]
    net_profit: f64,
    #[serde(rename = "资产总额(万元)")]
    total_assets: f64,
    #[serde(rename = "负债总额(万元)")]
    total_liabilities: f64,
    #[serde(rename = "资产负债率(%)")]
    debt_to_asset_ratio: f64,
    #[serde(rename = "研发投入占比(%)")]
    r_and_d_ratio: f64,
    #[serde(rename = "专利数量")]
    patent_count: i32,
    #[serde(rename = "上游核心企业数量")]
    upstream_core_companies: i32,
    #[serde(rename = "下游客户数量")]
    downstream_customers: i32,
    #[serde(rename = "历史逾期次数")]
    overdue_count: i32,
    #[serde(rename = "法律诉讼次数")]
    legal_disputes_count: i32,
}

#[derive(Serialize)]
pub struct CompanyWithScore {
    #[serde(flatten)]
    company_data: CompanyData,
    credit_score: f64,
    credit_rating: String, // AAA, AA, A, BBB, BB, B, CCC, CC, C
    credit_limit: String,  // 授信额度建议
    risk_level: String,    // 低、中、高、极高

    score_details: ScoreDetails,
}

#[derive(Serialize)]
pub struct ScoreDetails {
    financial_score: f64,     // 财务健康度得分
    innovation_score: f64,    // 创新能力得分
    supply_chain_score: f64,  // 供应链稳定性得分
    risk_score: f64,          // 风险记录得分
    industry_adjustment: f64, // 行业调整分
}

#[derive(Serialize)]
pub struct ExcelResult {
    file: String,
    sheet_name: String,
    total_companies: usize,
    companies: Vec<CompanyWithScore>,
}

fn calculate_credit_score(company: &CompanyData) -> (f64, ScoreDetails) {
    let mut details = ScoreDetails {
        financial_score: 0.0,
        innovation_score: 0.0,
        supply_chain_score: 0.0,
        risk_score: 0.0,
        industry_adjustment: 0.0,
    };

    // 1. 财务健康度评分 (40分)
    // 1.1 盈利能力 (15分)
    let profit_margin = if company.revenue > 0.0 {
        company.net_profit / company.revenue
    } else {
        0.0
    };

    details.financial_score += match profit_margin {
        x if x >= 0.15 => 15.0,
        x if x >= 0.10 => 12.0,
        x if x >= 0.05 => 8.0,
        x if x >= 0.0 => 5.0,
        _ => 0.0,
    };

    // 1.2 资产负债率 (15分)
    details.financial_score += match company.debt_to_asset_ratio {
        x if x <= 30.0 => 15.0,
        x if x <= 50.0 => 12.0,
        x if x <= 70.0 => 8.0,
        x if x <= 85.0 => 4.0,
        _ => 0.0,
    };

    // 1.3 资产规模 (10分)
    details.financial_score += match company.total_assets {
        x if x >= 50000.0 => 10.0,
        x if x >= 20000.0 => 8.0,
        x if x >= 10000.0 => 6.0,
        x if x >= 5000.0 => 4.0,
        _ => 2.0,
    };

    // 2. 创新能力评分 (30分)
    // 2.1 研发投入占比 (15分)
    details.innovation_score += match company.r_and_d_ratio {
        x if x >= 15.0 => 15.0,
        x if x >= 10.0 => 12.0,
        x if x >= 5.0 => 8.0,
        x if x >= 3.0 => 5.0,
        _ => 2.0,
    };

    // 2.2 专利数量 (15分)
    details.innovation_score += match company.patent_count {
        x if x >= 50 => 15.0,
        x if x >= 20 => 12.0,
        x if x >= 10 => 9.0,
        x if x >= 5 => 6.0,
        x if x >= 1 => 3.0,
        _ => 0.0,
    };

    // 3. 供应链稳定性评分 (20分)
    // 3.1 上游核心企业 (10分)
    details.supply_chain_score += match company.upstream_core_companies {
        x if x >= 5 => 10.0,
        x if x >= 3 => 8.0,
        x if x >= 2 => 6.0,
        x if x >= 1 => 4.0,
        _ => 0.0,
    };

    // 3.2 下游客户数量 (10分)
    details.supply_chain_score += match company.downstream_customers {
        x if x >= 20 => 10.0,
        x if x >= 10 => 8.0,
        x if x >= 5 => 6.0,
        x if x >= 3 => 4.0,
        _ => 2.0,
    };

    // 4. 风险记录评分 (10分)
    details.risk_score = 10.0;
    details.risk_score -= (company.overdue_count as f64 * 2.0).min(10.0);
    details.risk_score -= (company.legal_disputes_count as f64 * 3.0).min(10.0);
    details.risk_score = details.risk_score.max(0.0);

    // 5. 行业调整分 (±5分)
    details.industry_adjustment = match company.industry.as_str() {
        "人工智能" | "新能源" | "生物医药" | "新材料" => 5.0,
        "高端制造" | "信息技术" | "节能环保" => 3.0,
        "传统制造" | "房地产" => -3.0,
        "高污染" | "高能耗" => -5.0,
        _ => 0.0,
    };

    let total_score = details.financial_score
        + details.innovation_score
        + details.supply_chain_score
        + details.risk_score
        + details.industry_adjustment;

    (total_score.max(0.0).min(100.0), details)
}

// 根据评分确定信用等级
fn get_credit_rating(score: f64) -> (String, String, String) {
    let (rating, limit, risk) = match score {
        x if x >= 90.0 => ("AAA", "1000万以上", "低"),
        x if x >= 85.0 => ("AA", "800-1000万", "低"),
        x if x >= 80.0 => ("A", "500-800万", "低"),
        x if x >= 70.0 => ("BBB", "300-500万", "中"),
        x if x >= 60.0 => ("BB", "100-300万", "中"),
        x if x >= 50.0 => ("B", "50-100万", "高"),
        x if x >= 40.0 => ("CCC", "50万以下", "高"),
        x if x >= 30.0 => ("CC", "需要担保", "极高"),
        _ => ("C", "拒绝授信", "极高"),
    };

    (rating.to_string(), limit.to_string(), risk.to_string())
}

#[tauri::command]
pub fn process_excel(paths: Vec<String>) -> Result<Vec<ExcelResult>, String> {
    let mut all_results = Vec::new();

    for path in paths {
        let mut workbook =
            open_workbook_auto(&path).map_err(|e| format!("无法打开文件 {}: {}", path, e))?;

        // 获取所有工作表名称
        let sheet_names = workbook.sheet_names().to_owned();

        for sheet_name in sheet_names {
            let range = workbook
                .worksheet_range(&sheet_name)
                .map_err(|e| format!("读取工作表 {} 失败: {}", sheet_name, e))?;

            // 检查是否有数据
            if range.is_empty() {
                continue;
            }

            let mut rows: calamine::Rows<'_, calamine::Data> = range.rows();

            // 读取表头
            let headers: Vec<String> = match rows.next() {
                Some(header_row) => header_row.iter().map(|cell| cell.to_string()).collect(),
                None => continue,
            };

            // 创建列名到索引的映射
            let header_map: HashMap<String, usize> = headers
                .iter()
                .enumerate()
                .map(|(i, h)| (h.trim().to_string(), i))
                .collect();

            let mut companies = Vec::new();

            // 处理数据行
            for row in rows {
                let mut row_data = HashMap::new();

                for (col_name, &col_idx) in &header_map {
                    if col_idx < row.len() {
                        let value = row[col_idx].to_string();
                        row_data.insert(col_name.clone(), value);
                    }
                }

                // 构建公司数据
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

#[tauri::command]
pub async fn generate_template_excel(
    file_path: String,
    headers: Vec<String>,
    template_row: Option<Vec<String>>,
) -> Result<(), String> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    // 创建居中格式
    let center_format = Format::new()
        .set_align(rust_xlsxwriter::FormatAlign::Center)
        .set_align(rust_xlsxwriter::FormatAlign::VerticalCenter);

    // 创建表头格式（居中+加粗）
    let header_format = Format::new()
        .set_align(rust_xlsxwriter::FormatAlign::Center)
        .set_align(rust_xlsxwriter::FormatAlign::VerticalCenter)
        .set_bold();

    // 写入表头
    for (col, header) in headers.iter().enumerate() {
        worksheet
            .write_string_with_format(0, col as u16, header, &header_format)
            .map_err(|e| format!("写入表头失败: {}", e))?;
    }

    // 写入模板数据
    if let Some(template_data) = template_row {
        let data_count = template_data.len().min(headers.len());

        for (col, value) in template_data.iter().take(data_count).enumerate() {
            if let Ok(num) = value.parse::<f64>() {
                worksheet
                    .write_number_with_format(1, col as u16, num, &center_format)
                    .map_err(|e| format!("写入数字失败: {}", e))?;
            } else {
                worksheet
                    .write_string_with_format(1, col as u16, value, &center_format)
                    .map_err(|e| format!("写入字符串失败: {}", e))?;
            }
        }
    }

    // 设置列宽
    for col in 0..headers.len() {
        worksheet
            .set_column_width(col as u16, 15.0)
            .map_err(|e| format!("设置列宽失败: {}", e))?;
    }

    workbook
        .save(&file_path)
        .map_err(|e| format!("保存文件失败: {}", e))?;
    Ok(())
}
