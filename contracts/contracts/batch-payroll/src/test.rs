#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(BatchPayrollContract, ());
    let client = BatchPayrollContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
}

#[test]
fn test_create_payroll() {
    let env = Env::default();
    env.mock_all_auths();

    // Deploy contract
    let contract_id = env.register(BatchPayrollContract, ());
    let client = BatchPayrollContractClient::new(&env, &contract_id);

    // Initialize
    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Deploy a token and mint to company
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token_contract.address();
    let sac_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);

    let company = Address::generate(&env);
    sac_client.mint(&company, &1_000_000_000); // 100 XLM in stroops

    // Setup recipients
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let recipients = vec![&env, recipient1.clone(), recipient2.clone()];
    let amounts = vec![&env, 300_000_000_i128, 200_000_000_i128];

    // Create payroll
    let payroll_id = client.create_payroll(&company, &token_addr, &recipients, &amounts);
    assert_eq!(payroll_id, 0);

    // Verify stored payroll
    let payroll = client.get_payroll(&payroll_id);
    assert_eq!(payroll.company, company);
    assert_eq!(payroll.total_amount, 500_000_000);
    assert_eq!(payroll.status, PayrollStatus::Funded);
    assert_eq!(payroll.recipients.len(), 2);

    // Verify token was transferred to contract
    let token_client = soroban_sdk::token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&contract_id), 500_000_000);
    assert_eq!(token_client.balance(&company), 500_000_000); // 1B - 500M
}
