#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(MilestoneEscrowContract, ());
    let client = MilestoneEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
}

#[test]
fn test_create_task() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MilestoneEscrowContract, ());
    let client = MilestoneEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let solver = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin);

    let milestone_amounts = vec![&env, 100_i128, 200_i128, 300_i128];
    let task_id = client.create_task(&creator, &token, &solver, &milestone_amounts);

    assert_eq!(task_id, 0);

    let task = client.get_task(&task_id);
    assert_eq!(task.creator, creator);
    assert_eq!(task.solver, solver);
    assert_eq!(task.total_amount, 600);
    assert_eq!(task.released_amount, 0);
    assert_eq!(task.status, TaskStatus::Open);
    assert_eq!(task.milestones.len(), 3);
}
