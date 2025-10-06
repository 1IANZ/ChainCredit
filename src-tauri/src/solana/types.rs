use anchor_client::{
    solana_sdk::{pubkey::Pubkey, signature::Keypair},
    Program,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompanyChainData {
    pub company_id: String,
    pub company_name: String,
    pub credit_score: u32,
    pub credit_rating: String,
    pub credit_limit: String,
    pub risk_level: String,
    pub authority: String,
    pub timestamp: i64,
}

pub struct Wallet {
    pub private_key: Arc<Mutex<Option<Arc<Keypair>>>>,
    pub public_key: Arc<Mutex<Option<Pubkey>>>,
    pub program: Arc<Mutex<Option<Arc<Program<Arc<Keypair>>>>>>,
}

impl Default for Wallet {
    fn default() -> Self {
        Self {
            private_key: Arc::new(Mutex::new(None)),
            public_key: Arc::new(Mutex::new(None)),
            program: Arc::new(Mutex::new(None)),
        }
    }
}
