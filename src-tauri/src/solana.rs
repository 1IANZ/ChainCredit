use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};
use std::sync::Mutex;
use tauri::State;
pub struct Wallet {
    private_key: Mutex<Option<Keypair>>,
    public_key: Mutex<Option<Pubkey>>,
}
impl Wallet {
    pub fn new() -> Self {
        Self {
            private_key: Mutex::new(None),
            public_key: Mutex::new(None),
        }
    }
}
#[tauri::command]
pub fn set_private_key(state: State<'_, Wallet>, secret_base58: String) -> String {
    if secret_base58.len() != 88 {
        return "Error".to_string();
    }

    let keypair = Keypair::from_base58_string(&secret_base58);
    let mut private_key = state.private_key.lock().unwrap();
    let mut public_key = state.public_key.lock().unwrap();
    *private_key = Some(keypair);
    let pubkey = private_key.as_ref().unwrap().pubkey();
    *public_key = Some(pubkey);

    pubkey.to_string()
}
#[tauri::command]
pub fn get_public_key(state: State<'_, Wallet>) -> String {
    let public_key = state.public_key.lock().unwrap();
    match public_key.as_ref() {
        Some(key) => key.to_string(),
        None => "".to_string(),
    }
}
