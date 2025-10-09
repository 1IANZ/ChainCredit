mod ai;
mod excel;
mod solana;
use ai::*;
use excel::*;
use solana::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Wallet::default())
        .invoke_handler(tauri::generate_handler![
            process_excel,
            generate_template_excel,
            generate_single_report,
            set_private_key,
            get_public_key,
            initialize_company,
            update_company,
            delete_company,
            get_all_companies,
            clear_private_key,
            get_companies_raw_data,
            get_company_by_id,
            submit_to_bank,
            get_bank_credit_limit,
            call_deepseek_api_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
