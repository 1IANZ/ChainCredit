use anchor_lang::prelude::*;

declare_id!("98hRPJ2D9Dmuaa5DSm1qF2WZC6U5tJgkcGZgRHzR9SAC");

#[program]
pub mod credit {
    use super::*;

    pub fn initialize_company(
        ctx: Context<InitializeCompany>,
        company_id: String,
        company_name: String,
        credit_score: u32,
        credit_rating: String,
        credit_limit: String,
        risk_level: String,
    ) -> Result<()> {
        let company = &mut ctx.accounts.company;

        company.company_id = company_id;
        company.company_name = company_name;
        company.credit_score = credit_score;
        company.credit_rating = credit_rating;
        company.credit_limit = credit_limit;
        company.risk_level = risk_level;
        company.authority = ctx.accounts.authority.key();
        company.timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn update_company(
        ctx: Context<UpdateCompany>,
        credit_score: u32,
        credit_rating: String,
        credit_limit: String,
        risk_level: String,
    ) -> Result<()> {
        let company = &mut ctx.accounts.company;

        require_keys_eq!(
            company.authority,
            ctx.accounts.authority.key(),
            CreditError::Unauthorized
        );

        company.credit_score = credit_score;
        company.credit_rating = credit_rating;
        company.credit_limit = credit_limit;
        company.risk_level = risk_level;
        company.timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn delete_company(ctx: Context<DeleteCompany>) -> Result<()> {
        let company = &mut ctx.accounts.company;
        require_keys_eq!(
            company.authority,
            ctx.accounts.authority.key(),
            CreditError::Unauthorized
        );
        let authority = &mut ctx.accounts.authority;
        company.close(authority.to_account_info())?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_id: String)]
pub struct InitializeCompany<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Company::MAX_SIZE,
        seeds = [b"company", company_id.as_bytes()],
        bump
    )]
    pub company: Account<'info, Company>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCompany<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCompany<'info> {
    #[account(mut, close = authority)]
    pub company: Account<'info, Company>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Company {
    pub company_id: String,
    pub company_name: String,
    pub credit_score: u32,
    pub credit_rating: String,
    pub credit_limit: String,
    pub risk_level: String,
    pub authority: Pubkey,
    pub timestamp: i64,
}

impl Company {
    pub const MAX_SIZE: usize = 4 + 64 +   // company_id
        4 + 64 +   // company_name
        4 +        // credit_score (u32)
        4 + 16 +   // credit_rating
        4 + 64 +   // credit_limit
        4 + 16 +   // risk_level
        32 +       // authority (Pubkey)
        8; // timestamp (i64)
}

/// 自定义错误
#[error_code]
pub enum CreditError {
    #[msg("未授权操作")]
    Unauthorized,
}
