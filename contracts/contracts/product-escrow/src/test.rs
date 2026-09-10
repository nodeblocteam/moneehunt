#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(ProductEscrowContract, ());
    let client = ProductEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
}

#[test]
fn test_create_listing() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(ProductEscrowContract, ());
    let client = ProductEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin);

    let listing_id = client.create_listing(&seller, &token, &500_i128);

    assert_eq!(listing_id, 0);

    let listing = client.get_listing(&listing_id);
    assert_eq!(listing.seller, seller);
    assert_eq!(listing.price, 500);
    assert_eq!(listing.status, ListingStatus::Active);
}
