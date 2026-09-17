#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, token, Address, Env};

/// Error codes for the product escrow contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ProductError {
    /// Listing not found.
    ListingNotFound = 1,
    /// Caller is not authorized.
    Unauthorized = 2,
    /// Listing is not in the expected status.
    InvalidStatus = 3,
    /// Purchase amount doesn't match listing price.
    PriceMismatch = 4,
    /// Listing has already been purchased.
    AlreadyPurchased = 5,
}

/// Status of a product listing.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ListingStatus {
    /// Listed and available for purchase.
    Active,
    /// Buyer has deposited — funds held in escrow.
    InEscrow,
    /// Delivery confirmed — funds released to seller.
    Delivered,
    /// Refunded to buyer.
    Refunded,
}

/// A product listing with escrow protection.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Listing {
    /// Seller's address.
    pub seller: Address,
    /// Buyer's address (set after purchase).
    pub buyer: Address,
    /// Token contract address (XLM SAC).
    pub token: Address,
    /// Price in stroops.
    pub price: i128,
    /// Current listing status.
    pub status: ListingStatus,
}

/// Storage keys.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Admin address.
    Admin,
    /// Maps listing_id (u64) to Listing.
    Listing(u64),
    /// Auto-incrementing listing counter.
    ListingCounter,
}

#[contract]
pub struct ProductEscrowContract;

#[contractimpl]
impl ProductEscrowContract {
    /// Initialize the contract.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::ListingCounter, &0u64);
    }

    /// Create a new product listing.
    ///
    /// `seller` — the seller's address.
    /// `token` — the XLM SAC contract address.
    /// `price` — the listing price in stroops.
    ///
    /// Returns the new listing ID.
    pub fn create_listing(
        env: Env,
        seller: Address,
        token: Address,
        price: i128,
    ) -> Result<u64, ProductError> {
        seller.require_auth();

        if price <= 0 {
            panic!("price must be positive");
        }

        let listing_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ListingCounter)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::ListingCounter, &(listing_id + 1));

        // Use a zero-address placeholder for the buyer until purchase.
        let listing = Listing {
            seller: seller.clone(),
            buyer: seller.clone(), // placeholder — overwritten on purchase
            token,
            price,
            status: ListingStatus::Active,
        };
        env.storage()
            .instance()
            .set(&DataKey::Listing(listing_id), &listing);

        Ok(listing_id)
    }

    /// Purchase a listing — buyer deposits XLM into escrow.
    pub fn purchase(env: Env, listing_id: u64, buyer: Address) -> Result<(), ProductError> {
        buyer.require_auth();

        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .ok_or(ProductError::ListingNotFound)?;

        if listing.status != ListingStatus::Active {
            return Err(ProductError::AlreadyPurchased);
        }

        // Transfer XLM from buyer to contract.
        let token_client = token::Client::new(&env, &listing.token);
        let contract_addr = env.current_contract_address();
        token_client.transfer(&buyer, &contract_addr, &listing.price);

        listing.buyer = buyer;
        listing.status = ListingStatus::InEscrow;
        env.storage()
            .instance()
            .set(&DataKey::Listing(listing_id), &listing);

        Ok(())
    }

    /// Confirm delivery — buyer confirms receipt and funds are released to seller.
    pub fn confirm_delivery(env: Env, listing_id: u64) -> Result<(), ProductError> {
        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .ok_or(ProductError::ListingNotFound)?;

        if listing.status != ListingStatus::InEscrow {
            return Err(ProductError::InvalidStatus);
        }

        // Only the buyer can confirm delivery.
        listing.buyer.require_auth();

        // Release funds to seller.
        let token_client = token::Client::new(&env, &listing.token);
        let contract_addr = env.current_contract_address();
        token_client.transfer(&contract_addr, &listing.seller, &listing.price);

        listing.status = ListingStatus::Delivered;
        env.storage()
            .instance()
            .set(&DataKey::Listing(listing_id), &listing);

        Ok(())
    }

    /// Query a listing by ID.
    pub fn get_listing(env: Env, listing_id: u64) -> Result<Listing, ProductError> {
        env.storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .ok_or(ProductError::ListingNotFound)
    }

    // ──────────────────────────────────────────────
    // TODO (remaining 60%):
    // - refund: seller or admin refunds buyer
    // - cancel_listing: seller cancels an active listing
    // - open_dispute: buyer opens a dispute
    // - resolve_dispute: admin resolves dispute
    // - update_price: seller updates listing price
    // - extend_ttl: manage state archival
    // - events: emit lifecycle events
    // ──────────────────────────────────────────────
}

#[cfg(test)]
mod test;
