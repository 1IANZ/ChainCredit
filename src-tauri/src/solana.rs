mod types;
use anchor_client::{
    solana_client::{rpc_config::RpcSendTransactionConfig, rpc_filter::RpcFilterType},
    solana_sdk::{
        commitment_config::{CommitmentConfig, CommitmentLevel},
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
    },
    Client, Cluster,
};

use credit::Company;
use std::sync::Arc;
use tauri::State;
pub use types::CompanyChainData;
pub use types::Wallet;

pub fn get_company_pda(company_id: &str, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"company", company_id.as_bytes()], program_id)
}

#[tauri::command]
pub async fn set_private_key(
    state: State<'_, Wallet>,
    secret_base58: String,
) -> Result<String, String> {
    if secret_base58.len() != 88 {
        return Err("Invalid private key length".into());
    }

    let keypair = Keypair::from_base58_string(&secret_base58);
    let pubkey = keypair.pubkey();

    let signer = Arc::new(keypair);
    let cluster = Cluster::Devnet;
    let client = Client::new_with_options(cluster, signer.clone(), CommitmentConfig::confirmed());
    let program_pubkey = "98hRPJ2D9Dmuaa5DSm1qF2WZC6U5tJgkcGZgRHzR9SAC"
        .parse::<Pubkey>()
        .map_err(|_| "Invalid program ID".to_string())?;

    let program = client.program(program_pubkey).map_err(|e| e.to_string())?;

    {
        let mut private_key_lock = state.private_key.lock().await;
        *private_key_lock = Some(signer.clone());

        let mut public_key_lock = state.public_key.lock().await;
        *public_key_lock = Some(pubkey);

        let mut program_lock = state.program.lock().await;
        *program_lock = Some(Arc::new(program));
    }

    Ok(pubkey.to_string())
}

#[tauri::command]
pub async fn get_public_key(state: State<'_, Wallet>) -> Result<Option<String>, String> {
    let public_key = state.public_key.lock().await;
    Ok(public_key.as_ref().map(|k| k.to_string()))
}

#[tauri::command]
pub async fn initialize_company(
    state: State<'_, Wallet>,
    company_id: String,
    company_name: String,
    credit_score: u32,
    credit_rating: String,
    credit_limit: String,
    risk_level: String,
) -> Result<CompanyChainData, String> {
    let program_lock = state.program.lock().await;
    let program = program_lock
        .as_ref()
        .ok_or("Program not initialized")?
        .clone();
    drop(program_lock);

    let (company_pda, _bump) = get_company_pda(&company_id, &program.id());
    let payer = program.payer();

    let company_id_clone = company_id.clone();
    let company_name_clone = company_name.clone();
    let credit_rating_clone = credit_rating.clone();
    let credit_limit_clone = credit_limit.clone();
    let risk_level_clone = risk_level.clone();

    tokio::task::spawn_blocking(move || {
        let tx_config = RpcSendTransactionConfig {
            skip_preflight: false,
            preflight_commitment: Some(CommitmentLevel::Confirmed),
            ..RpcSendTransactionConfig::default()
        };

        program
            .request()
            .accounts(credit::accounts::InitializeCompany {
                company: company_pda,
                authority: payer,
                system_program: anchor_client::solana_sdk::system_program::ID,
            })
            .args(credit::instruction::InitializeCompany {
                company_id: company_id_clone,
                company_name: company_name_clone,
                credit_score,
                credit_rating: credit_rating_clone,
                credit_limit: credit_limit_clone,
                risk_level: risk_level_clone,
            })
            .send_with_spinner_and_config(tx_config)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
    .map_err(|e| format!("Transaction error: {}", e))?;

    Ok(CompanyChainData {
        company_id,
        company_name,
        credit_score,
        credit_rating,
        credit_limit,
        risk_level,
        authority: payer.to_string(),
        timestamp: 0,
    })
}

#[tauri::command]
pub async fn update_company(
    state: State<'_, Wallet>,
    company_id: String,
    company_name: String,
    credit_score: u32,
    credit_rating: String,
    credit_limit: String,
    risk_level: String,
) -> Result<CompanyChainData, String> {
    let program_lock = state.program.lock().await;
    let program = program_lock
        .as_ref()
        .ok_or("Program not initialized")?
        .clone();
    drop(program_lock);

    let (company_pda, _bump) = get_company_pda(&company_id, &program.id());
    let payer = program.payer();

    let credit_rating_clone = credit_rating.clone();
    let credit_limit_clone = credit_limit.clone();
    let risk_level_clone = risk_level.clone();

    tokio::task::spawn_blocking(move || {
        let tx_config = RpcSendTransactionConfig {
            skip_preflight: false,
            preflight_commitment: Some(CommitmentLevel::Confirmed),
            ..RpcSendTransactionConfig::default()
        };

        program
            .request()
            .accounts(credit::accounts::UpdateCompany {
                company: company_pda,
                authority: payer,
            })
            .args(credit::instruction::UpdateCompany {
                credit_score,
                credit_rating: credit_rating_clone,
                credit_limit: credit_limit_clone,
                risk_level: risk_level_clone,
            })
            .send_with_spinner_and_config(tx_config)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
    .map_err(|e| {
        eprintln!("update_company error: {:?}", e);
        format!("Transaction error: {}", e)
    })?;

    Ok(CompanyChainData {
        company_id,
        company_name,
        credit_score,
        credit_rating,
        credit_limit,
        risk_level,
        authority: payer.to_string(),
        timestamp: 0,
    })
}

#[tauri::command]
pub async fn delete_company(state: State<'_, Wallet>, company_id: String) -> Result<(), String> {
    let program_lock = state.program.lock().await;
    let program = program_lock
        .as_ref()
        .ok_or("Program not initialized")?
        .clone();
    drop(program_lock);

    let (company_pda, _bump) = get_company_pda(&company_id, &program.id());
    let payer = program.payer();

    tokio::task::spawn_blocking(move || {
        let tx_config = RpcSendTransactionConfig {
            skip_preflight: false,
            preflight_commitment: Some(CommitmentLevel::Confirmed),
            ..RpcSendTransactionConfig::default()
        };

        program
            .request()
            .accounts(credit::accounts::DeleteCompany {
                company: company_pda,
                authority: payer,
            })
            .args(credit::instruction::DeleteCompany {})
            .send_with_spinner_and_config(tx_config)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
    .map_err(|e| {
        eprintln!("delete_company error: {:?}", e);
        format!("Transaction error: {}", e)
    })?;

    Ok(())
}

#[tauri::command]
pub async fn get_all_companies(state: State<'_, Wallet>) -> Result<Vec<CompanyChainData>, String> {
    let program_lock = state.program.lock().await;
    let program = program_lock
        .as_ref()
        .ok_or("Program not initialized")?
        .clone();
    drop(program_lock);

    let results = tokio::task::spawn_blocking(move || {
        let filters: Vec<RpcFilterType> = vec![];

        let accounts_with_pubkeys: Vec<(Pubkey, Company)> = program
            .accounts::<Company>(filters)
            .map_err(|e| e.to_string())?;

        let results: Vec<CompanyChainData> = accounts_with_pubkeys
            .into_iter()
            .map(|(_pubkey, account)| CompanyChainData {
                company_id: account.company_id,
                company_name: account.company_name,
                credit_score: account.credit_score,
                credit_rating: account.credit_rating,
                credit_limit: account.credit_limit,
                risk_level: account.risk_level,
                authority: account.authority.to_string(),
                timestamp: account.timestamp,
            })
            .collect();

        Ok::<Vec<CompanyChainData>, String>(results)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
    .map_err(|e| format!("Query error: {}", e))?;

    Ok(results)
}

#[tauri::command]
pub async fn clear_private_key(state: State<'_, Wallet>) -> Result<(), String> {
    let resources = {
        let mut private_key_lock = state.private_key.lock().await;
        let mut public_key_lock = state.public_key.lock().await;
        let mut program_lock = state.program.lock().await;

        (
            private_key_lock.take(),
            public_key_lock.take(),
            program_lock.take(),
        )
    };
    tokio::task::spawn_blocking(move || {
        drop(resources);
    })
    .await
    .map_err(|e| format!("Failed to clear resources: {}", e))?;

    Ok(())
}
