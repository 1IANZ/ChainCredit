mod excel;
mod solana;

use excel::*;
use solana::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Wallet::new())
        .invoke_handler(tauri::generate_handler![
            process_excel,
            generate_template_excel,
            generate_single_report,
            set_private_key,
            get_public_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
