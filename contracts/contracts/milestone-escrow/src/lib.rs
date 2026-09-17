#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, token, Address, Env, Vec,
};

/// Error codes for the milestone escrow contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    /// Task not found in storage.
    TaskNotFound = 1,
    /// Caller is not authorized for this action.
    Unauthorized = 2,
    /// Task is not in the expected status.
    InvalidStatus = 3,
    /// Milestone index is out of bounds.
    InvalidMilestone = 4,
    /// Deposit amount does not match the required total.
    InsufficientDeposit = 5,
    /// Task has already been fully funded.
    AlreadyFunded = 6,
    /// Milestone has already been approved.
    MilestoneAlreadyApproved = 7,
}

/// Tracks the overall status of a task.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TaskStatus {
    /// Task created but not yet funded.
    Open,
    /// Task funded — XLM locked in contract.
    Funded,
    /// All milestones completed and paid out.
    Completed,
    /// Task cancelled and funds refunded to creator.
    Cancelled,
}

/// Tracks the status of an individual milestone within a task.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    /// Milestone is pending work.
    Pending,
    /// Work submitted by solver, awaiting review.
    Submitted,
    /// Approved by creator — funds released.
    Approved,
}

/// Represents a single milestone within a task.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Milestone {
    /// XLM amount (in stroops) allocated to this milestone.
    pub amount: i128,
    /// Current status of this milestone.
    pub status: MilestoneStatus,
}

/// Represents a task with milestone-based escrow.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Task {
    /// Address of the task creator (funder).
    pub creator: Address,
    /// Address of the solver (worker). Set when a solver is assigned.
    pub solver: Address,
    /// Token contract address (XLM SAC address).
    pub token: Address,
    /// Total XLM amount locked for all milestones.
    pub total_amount: i128,
    /// Amount already released to the solver.
    pub released_amount: i128,
    /// Ordered list of milestones.
    pub milestones: Vec<Milestone>,
    /// Current task status.
    pub status: TaskStatus,
}

/// Storage keys for the contract.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// The admin address.
    Admin,
    /// Maps task_id (u64) to Task.
    Task(u64),
    /// Auto-incrementing task ID counter.
    TaskCounter,
}

#[contract]
pub struct MilestoneEscrowContract;

#[contractimpl]
impl MilestoneEscrowContract {
    /// Initialize the contract with an admin address.
    pub fn initialize(env: Env, admin: Address) {
        // Ensure the contract hasn't already been initialized.
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TaskCounter, &0u64);
    }

    /// Create a new task with milestone allocations.
    ///
    /// `token` — the XLM SAC contract address.
    /// `solver` — the address assigned to complete the task.
    /// `milestone_amounts` — XLM amount (stroops) for each milestone.
    ///
    /// Returns the new task ID.
    pub fn create_task(
        env: Env,
        creator: Address,
        token: Address,
        solver: Address,
        milestone_amounts: Vec<i128>,
    ) -> Result<u64, EscrowError> {
        // Creator must authorize this call.
        creator.require_auth();

        // Build milestones from the provided amounts.
        let mut total: i128 = 0;
        let mut milestones = Vec::new(&env);
        for amount in milestone_amounts.iter() {
            if amount <= 0 {
                panic!("milestone amount must be positive");
            }
            total += amount;
            milestones.push_back(Milestone {
                amount,
                status: MilestoneStatus::Pending,
            });
        }

        // Get and increment the task counter.
        let task_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TaskCounter)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TaskCounter, &(task_id + 1));

        // Store the task.
        let task = Task {
            creator: creator.clone(),
            solver,
            token,
            total_amount: total,
            released_amount: 0,
            milestones,
            status: TaskStatus::Open,
        };
        env.storage().instance().set(&DataKey::Task(task_id), &task);

        Ok(task_id)
    }

    /// Fund a task by transferring XLM from the creator to the contract.
    ///
    /// The full `total_amount` must be deposited in a single call.
    pub fn fund_task(env: Env, task_id: u64) -> Result<(), EscrowError> {
        let mut task: Task = env
            .storage()
            .instance()
            .get(&DataKey::Task(task_id))
            .ok_or(EscrowError::TaskNotFound)?;

        if task.status != TaskStatus::Open {
            return Err(EscrowError::InvalidStatus);
        }

        // Creator must authorize the funding.
        task.creator.require_auth();

        // Transfer XLM from creator to this contract.
        let token_client = token::Client::new(&env, &task.token);
        let contract_addr = env.current_contract_address();
        token_client.transfer(&task.creator, &contract_addr, &task.total_amount);

        task.status = TaskStatus::Funded;
        env.storage().instance().set(&DataKey::Task(task_id), &task);

        Ok(())
    }

    /// Approve a milestone and release funds to the solver.
    ///
    /// Only the task creator can approve milestones.
    pub fn approve_milestone(
        env: Env,
        task_id: u64,
        milestone_index: u32,
    ) -> Result<(), EscrowError> {
        let mut task: Task = env
            .storage()
            .instance()
            .get(&DataKey::Task(task_id))
            .ok_or(EscrowError::TaskNotFound)?;

        if task.status != TaskStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }

        // Only the creator can approve.
        task.creator.require_auth();

        // Validate milestone index.
        if milestone_index >= task.milestones.len() {
            return Err(EscrowError::InvalidMilestone);
        }

        let mut milestone = task.milestones.get(milestone_index).unwrap();

        if milestone.status == MilestoneStatus::Approved {
            return Err(EscrowError::MilestoneAlreadyApproved);
        }

        // Release funds for this milestone.
        let token_client = token::Client::new(&env, &task.token);
        let contract_addr = env.current_contract_address();
        token_client.transfer(&contract_addr, &task.solver, &milestone.amount);

        // Update milestone status.
        milestone.status = MilestoneStatus::Approved;
        task.milestones.set(milestone_index, milestone.clone());
        task.released_amount += milestone.amount;

        // Check if all milestones are approved.
        let all_approved = task.milestones.iter().all(|m| m.status == MilestoneStatus::Approved);
        if all_approved {
            task.status = TaskStatus::Completed;
        }

        env.storage().instance().set(&DataKey::Task(task_id), &task);

        Ok(())
    }

    /// Query a task by its ID.
    pub fn get_task(env: Env, task_id: u64) -> Result<Task, EscrowError> {
        env.storage()
            .instance()
            .get(&DataKey::Task(task_id))
            .ok_or(EscrowError::TaskNotFound)
    }

    // ──────────────────────────────────────────────
    // TODO (remaining 60%):
    // - submit_work: solver submits proof for a milestone
    // - cancel_task: creator cancels an unfunded/open task
    // - refund_task: refund remaining funds if task is cancelled
    // - dispute_milestone: initiate a dispute flow
    // - resolve_dispute: admin resolves a dispute
    // - extend_ttl: extend contract data TTL for state archival
    // - events: emit Soroban events for task lifecycle
    // ──────────────────────────────────────────────
}

#[cfg(test)]
mod test;
