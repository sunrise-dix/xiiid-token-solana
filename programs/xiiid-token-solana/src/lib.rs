use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("J6fKvYJvvaZ1RvYYBMy7L7jpUaLkWUzzZXKEfr5UfBrr");

// --- Constants & Space Calculation ---
const MAX_CLASS_ID: usize = 64;
const MAX_TITLE: usize = 128;
const MAX_DESC: usize = 256;
const MAX_CATEGORY: usize = 64;
const MAX_TOPIC: usize = 64;
const MAX_DIFFICULTY: usize = 32;
const MAX_QUESTION_ID: usize = 64;
const MAX_PRIORITY: usize = 32;
const MAX_CLASS_RESULT_ID: usize = 64;
const MAX_REPORT_ID: usize = 64;

fn str_len(len: usize) -> usize {
    4 + len
}

#[program]
pub mod xiiid_token_solana {
    use super::*;

    /// 1. 글로벌 설정 초기화 (Owner 및 Mint 설정)
    pub fn initialize_config(ctx: Context<InitializeConfig>, cap: u64) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.owner = ctx.accounts.owner.key();
        cfg.mint = ctx.accounts.mint.key();
        cfg.cap = cap;
        cfg.bump = ctx.bumps.config;
        Ok(())
    }

    /// 2. Class 생성 (Solidity의 create 함수)
    pub fn create_class(ctx: Context<CreateClass>, args: CreateClassArgs) -> Result<()> {
        let class = &mut ctx.accounts.class;
        class.class_id = args.class_id;
        class.title = args.title;
        class.description = args.description;
        class.category = args.category;
        class.topic = args.topic;
        class.difficulty = args.difficulty;
        class.reward = args.reward;
        class.question_count = args.question_count;
        class.time_limit = args.time_limit;
        class.is_private = args.is_private;
        class.creator = args.creator_address;
        class.completion_count = 0;
        class.bump = ctx.bumps.class;

        Ok(())
    }

    /// 3. 강의 완료 기록 (Solidity의 complete 함수 - onlyOwner)
    pub fn complete_class(ctx: Context<CompleteClass>, class_result_id: String, title: String, score: u32) -> Result<()> {
        let completion = &mut ctx.accounts.completion;

        completion.class_result_id = class_result_id;
        completion.student = ctx.accounts.student.key();
        completion.title = title;
        completion.score = score;
        completion.bump = ctx.bumps.completion;

        Ok(())
    }

    /// 4. 버그 리포트 (Solidity의 report 함수 - onlyOwner)
    pub fn report_bug(ctx: Context<ReportBug>, args: ReportBugArgs) -> Result<()> {
        let report = &mut ctx.accounts.report;

        report.report_id = args.report_id;
        report.question_id = args.question_id;
        report.title = args.title;
        report.description = args.description;
        report.category = args.category;
        report.priority = args.priority;
        report.user = args.user_address;
        report.bump = ctx.bumps.report;

        Ok(())
    }
}

// --- Accounts Structures ---

#[account]
pub struct Config {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub cap: u64,
    pub bump: u8,
}

#[account]
pub struct ClassAccount {
    pub class_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub topic: String,
    pub difficulty: String,
    pub reward: u64,
    pub question_count: u32,
    pub time_limit: u32,
    pub is_private: bool,
    pub creator: Pubkey,
    pub completion_count: u64,
    pub bump: u8,
}

#[account]
pub struct CompletionAccount {
    pub class_result_id: String,
    pub title: String,
    pub student: Pubkey,
    pub score: u32,
    pub bump: u8,
}

#[account]
pub struct ReportAccount {
    pub report_id: String,
    pub question_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub priority: String,
    pub user: Pubkey,
    pub bump: u8,
}

// --- Instructions Context ---

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + 8 + 1, seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: CreateClassArgs)]
pub struct CreateClass<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + str_len(MAX_CLASS_ID) + str_len(MAX_TITLE) + str_len(MAX_DESC) + str_len(MAX_CATEGORY) + str_len(MAX_TOPIC) + str_len(MAX_DIFFICULTY) + 8 + 4 + 4 + 1 + 32 + 8 + 1,
        seeds = [b"class", args.class_id.as_bytes()],
        bump
    )]
    pub class: Account<'info, ClassAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(class_result_id: String, title: String)]
pub struct CompleteClass<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(mut, address = config.owner)] // onlyOwner 검증
    pub owner: Signer<'info>,
    pub class: Account<'info, ClassAccount>,
    #[account(
        init,
        payer = owner,
        space = 8 + str_len(MAX_CLASS_RESULT_ID) + str_len(MAX_TITLE) + 32 + 4 + 1,
        seeds = [b"completion", class.key().as_ref(), student.key().as_ref()],
        bump
    )]
    pub completion: Account<'info, CompletionAccount>,
    pub student: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: ReportBugArgs)]
pub struct ReportBug<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(mut, address = config.owner)] // onlyOwner 검증
    pub owner: Signer<'info>,
    pub class: Account<'info, ClassAccount>,
    #[account(
        init,
        payer = owner,
        space = 8 + str_len(MAX_REPORT_ID) + str_len(MAX_QUESTION_ID) + str_len(MAX_TITLE) + str_len(MAX_DESC) + str_len(MAX_CATEGORY) + str_len(MAX_PRIORITY) + 32 + 1,
        seeds = [b"report", class.key().as_ref(), args.report_id.as_bytes(), args.user_address.as_ref()],
        bump
    )]
    pub report: Account<'info, ReportAccount>,
    pub system_program: Program<'info, System>,
}

// --- Arguments Data Structure ---

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateClassArgs {
    pub class_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub topic: String,
    pub difficulty: String,
    pub reward: u64,
    pub question_count: u32,
    pub time_limit: u32,
    pub is_private: bool,
    pub creator_address: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ReportBugArgs {
    pub report_id: String,
    pub question_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub priority: String,
    pub user_address: Pubkey,
}