#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, token, Address, Env, Vec};

/// Error codes for the batch payroll contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PayrollError {
    /// Payroll batch not found.
    PayrollNotFound = 1,
    /// Caller is not authorized.
    Unauthorized = 2,
    /// Payroll is not in the expected status.
    InvalidStatus = 3,
    /// Recipients and amounts arrays must have matching lengths.
    LengthMismatch = 4,
    /// Payroll has already been executed.
    AlreadyExecuted = 5,
}

/// Status of a payroll batch.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PayrollStatus {
    /// Created and funded — ready to execute.
    Funded,
    /// All payments disbursed.
    Executed,
    /// Cancelled and refunded.
    Cancelled,
}

/// A batch payroll record.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Payroll {
    /// Company/payer address.
    pub company: Address,
    /// Token contract address (XLM SAC).
    pub token: Address,
    /// List of recipient addresses.
    pub recipients: Vec<Address>,
    /// Corresponding amounts for each recipient (in stroops).
    pub amounts: Vec<i128>,
    /// Total amount locked.
    pub total_amount: i128,
    /// Current status.
    pub status: PayrollStatus,
}

/// Storage keys.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Admin address.
    Admin,
    /// Maps payroll_id (u64) to Payroll.
    Payroll(u64),
    /// Auto-incrementing payroll counter.
    PayrollCounter,
}

#[contract]
pub struct BatchPayrollContract;

#[contractimpl]
impl BatchPayrollContract {
    /// Initialize the contract.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PayrollCounter, &0u64);
    }

    /// Create a payroll batch and fund it in a single call.
    ///
    /// `company` — the payer address.
    /// `token` — the XLM SAC contract address.
    /// `recipients` — list of employee/recipient addresses.
    /// `amounts` — corresponding XLM amount for each recipient.
    ///
    /// The total is transferred from the company to the contract upon creation.
    /// Returns the payroll ID.
    pub fn create_payroll(
        env: Env,
        company: Address,
        token: Address,
        recipients: Vec<Address>,
        amounts: Vec<i128>,
    ) -> Result<u64, PayrollError> {
        company.require_auth();

        if recipients.len() != amounts.len() {
            return Err(PayrollError::LengthMismatch);
        }

        // Calculate total.
        let mut total: i128 = 0;
        for amount in amounts.iter() {
            if amount <= 0 {
                panic!("amount must be positive");
            }
            total += amount;
        }

        // Transfer total XLM from company to contract.
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&company, &env.current_contract_address(), &total);

        let payroll_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PayrollCounter)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::PayrollCounter, &(payroll_id + 1));

        let payroll = Payroll {
            company,
            token,
            recipients,
            amounts,
            total_amount: total,
            status: PayrollStatus::Funded,
        };
        env.storage()
            .instance()
            .set(&DataKey::Payroll(payroll_id), &payroll);

        Ok(payroll_id)
    }

    /// Execute a funded payroll — disburse XLM to all recipients.
    ///
    /// Iterates through recipients and transfers each amount from the contract.
    pub fn execute_payroll(env: Env, payroll_id: u64) -> Result<(), PayrollError> {
        let mut payroll: Payroll = env
            .storage()
            .instance()
            .get(&DataKey::Payroll(payroll_id))
            .ok_or(PayrollError::PayrollNotFound)?;

        if payroll.status != PayrollStatus::Funded {
            return Err(PayrollError::InvalidStatus);
        }

        // Only the company can execute.
        payroll.company.require_auth();

        let token_client = token::Client::new(&env, &payroll.token);
        let contract_addr = env.current_contract_address();

        // Batch transfer to each recipient.
        for i in 0..payroll.recipients.len() {
            let recipient = payroll.recipients.get(i).unwrap();
            let amount = payroll.amounts.get(i).unwrap();
            token_client.transfer(&contract_addr, &recipient, &amount);
        }

        payroll.status = PayrollStatus::Executed;
        env.storage()
            .instance()
            .set(&DataKey::Payroll(payroll_id), &payroll);

        Ok(())
    }

    /// Query a payroll batch by ID.
    pub fn get_payroll(env: Env, payroll_id: u64) -> Result<Payroll, PayrollError> {
        env.storage()
            .instance()
            .get(&DataKey::Payroll(payroll_id))
            .ok_or(PayrollError::PayrollNotFound)
    }

    // ──────────────────────────────────────────────
    // TODO (remaining 60%):
    // - cancel_payroll: company cancels and gets refund
    // - partial_execute: execute for a subset of recipients
    // - update_payroll: modify amounts before execution
    // - recurring_payroll: schedule recurring disbursements
    // - extend_ttl: manage state archival
    // - events: emit lifecycle events
    // - gas optimization: batch transfer optimization
    // ──────────────────────────────────────────────
}

#[cfg(test)]
mod test;
