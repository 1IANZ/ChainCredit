mod calc;
mod types;

use std::collections::HashMap;
use std::sync::LazyLock;
use std::time::Duration;

use crate::excel::calc::{extract_companies_from_excel, parse_credit_limit};
use crate::excel::types::{CompanyData, CompanyWithScoreEn, ExcelResult};
use crate::excel::{calc::process_excel_internal, types::ExcelResultEn};
use rust_xlsxwriter::{Format, FormatAlign, Workbook};
use tokio::sync::Mutex;

static BANK_LIMIT_DB: LazyLock<Mutex<HashMap<String, f64>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub fn process_excel(paths: Vec<String>) -> Result<Vec<ExcelResultEn>, String> {
    let results_cn = process_excel_internal(paths)?;
    Ok(results_cn.into_iter().map(|r| r.into()).collect())
}
#[tauri::command]
pub async fn generate_template_excel(
    file_path: String,
    headers: Vec<String>,
    template_row: Option<Vec<String>>,
) -> Result<(), String> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    let center_format = Format::new()
        .set_align(rust_xlsxwriter::FormatAlign::Center)
        .set_align(rust_xlsxwriter::FormatAlign::VerticalCenter);

    let header_format = Format::new()
        .set_align(rust_xlsxwriter::FormatAlign::Center)
        .set_align(rust_xlsxwriter::FormatAlign::VerticalCenter)
        .set_bold();

    for (col, header) in headers.iter().enumerate() {
        worksheet
            .write_string_with_format(0, col as u16, header, &header_format)
            .map_err(|e| e.to_string())?;
    }

    if let Some(template_data) = template_row {
        let data_count = template_data.len().min(headers.len());
        for (col, value) in template_data.iter().take(data_count).enumerate() {
            if let Ok(num) = value.parse::<f64>() {
                worksheet
                    .write_number_with_format(1, col as u16, num, &center_format)
                    .map_err(|e| e.to_string())?;
            } else {
                worksheet
                    .write_string_with_format(1, col as u16, value, &center_format)
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    for col in 0..headers.len() {
        worksheet
            .set_column_width(col as u16, 15.0)
            .map_err(|e| e.to_string())?;
    }

    workbook.save(&file_path).map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn generate_single_report(
    file_path: String,
    company: CompanyWithScoreEn,
) -> Result<(), String> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    let header_format = Format::new().set_bold().set_font_size(14.0);
    let key_format = Format::new().set_bold();
    let value_format = Format::new().set_align(FormatAlign::Left);

    worksheet
        .set_column_width(0, 20.0)
        .map_err(|e| e.to_string())?;
    worksheet
        .set_column_width(1, 30.0)
        .map_err(|e| e.to_string())?;

    let mut row = 0;

    worksheet
        .merge_range(
            row,
            0,
            row,
            1,
            &format!("{} - 信用评估报告", company.company_data.company_name),
            &header_format.clone().set_align(FormatAlign::Center),
        )
        .map_err(|e| e.to_string())?;
    row += 2;

    worksheet
        .write_string_with_format(row, 0, "信用评分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(row, 1, company.credit_score, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "信用评级", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string_with_format(row, 1, &company.credit_rating, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "建议信用额度", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string_with_format(row, 1, &company.credit_limit, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "风险等级", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string_with_format(row, 1, &company.risk_level, &value_format)
        .map_err(|e| e.to_string())?;
    row += 2;

    worksheet
        .write_string_with_format(row, 0, "各项得分详情", &header_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "财务评分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(row, 1, company.score_details.financial_score, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "创新评分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(
            row,
            1,
            company.score_details.innovation_score,
            &value_format,
        )
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "供应链评分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(
            row,
            1,
            company.score_details.supply_chain_score,
            &value_format,
        )
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "风险评分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(row, 1, company.score_details.risk_score, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "行业调整分", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(
            row,
            1,
            company.score_details.industry_adjustment,
            &value_format,
        )
        .map_err(|e| e.to_string())?;
    row += 2;

    worksheet
        .write_string_with_format(row, 0, "企业原始数据", &header_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "营业收入(万元)", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(row, 1, company.company_data.revenue, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "净利润(万元)", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(row, 1, company.company_data.net_profit, &value_format)
        .map_err(|e| e.to_string())?;
    row += 1;
    worksheet
        .write_string_with_format(row, 0, "专利数量", &key_format)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number_with_format(
            row,
            1,
            company.company_data.patent_count as f64,
            &value_format,
        )
        .map_err(|e| e.to_string())?;

    workbook.save(&file_path).map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub fn get_companies_raw_data(paths: Vec<String>) -> Result<Vec<CompanyData>, String> {
    extract_companies_from_excel(paths)
}
#[tauri::command]
pub fn get_company_by_id(
    company_id: String,
    all_results: Vec<ExcelResult>,
) -> Result<Option<types::CompanyData>, String> {
    for result in all_results {
        for company in result.companies {
            if company.company_data.company_id == company_id {
                return Ok(Some(company.company_data));
            }
        }
    }
    Ok(None)
}
#[tauri::command]
pub async fn submit_to_bank(
    company_id: String,
    company_name: String,
    credit_score: f64,
    credit_rating: String,
    credit_limit: String,
    risk_level: String,
) -> Result<f64, String> {
    println!(
        "[河北银行] 收到提交请求:公司ID={},名称={},评分={},评级={},额度={},风险等级={}",
        company_id, company_name, credit_score, credit_rating, credit_limit, risk_level
    );
    let mut db = BANK_LIMIT_DB.lock().await;
    if let Some(&limit) = db.get(&company_id) {
        return Ok(limit);
    }

    // 模拟银行审批延迟
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 解析额度字符串
    let base_limit = parse_credit_limit(&credit_limit);

    // 根据风险等级和信用评分计算额度
    let risk_factor = match risk_level.as_str() {
        "低" => 1.05,
        "中" => 0.9,
        "高" => 0.75,
        "极高" => 0.5,
        _ => 1.0,
    };
    let score_factor = (credit_score / 100.0).clamp(0.3, 1.2);

    let rating_factor = match credit_rating.as_str() {
        "AAA" => 1.1,
        "AA" => 1.05,
        "A" => 1.0,
        _ => 0.9,
    };

    let approved_limit = (base_limit * risk_factor * score_factor * rating_factor).round();

    db.insert(company_id.clone(), approved_limit);

    println!(
        "[河北银行] 批复完成:公司={},额度={} 万元",
        company_name, approved_limit
    );

    Ok(approved_limit)
}
/// 获取公司批复额度
#[tauri::command]
pub async fn get_bank_credit_limit(company_id: String) -> Option<f64> {
    let db = BANK_LIMIT_DB.lock().await;
    db.get(&company_id).cloned()
}
