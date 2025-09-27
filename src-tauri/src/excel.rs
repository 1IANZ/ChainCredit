mod calc;
mod types;

use crate::excel::types::CompanyWithScoreEn;
use crate::excel::{calc::process_excel_internal, types::ExcelResultEn};
use rust_xlsxwriter::{Format, FormatAlign, Workbook};

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
        .write_string_with_format(row, 0, "各项得分详情 (100分制)", &header_format)
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
