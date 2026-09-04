#[allow(lint(public_entry), deprecated_usage)]
module trustmesh::group_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::event;
    use std::string::String;

    // Error Codes
    const EINVALID_ADMIN_CAP: u64 = 100;
    const EINSUFFICIENT_PAYMENT: u64 = 101;
    const EBILL_ALREADY_SETTLED: u64 = 102;
    const EPOOL_INACTIVE: u64 = 103;
    const EINVALID_MEMBER_COUNT: u64 = 104;

    /// GroupPool: Shared Object managing team expenses, owed balances, dues, and multi-student team splits
    public struct GroupPool<phantom T> has key {
        id: UID,
        creator: address,
        name: String,
        club_treasury: address,
        club_fee_bps: u64, // Basis points (e.g. 250 = 2.5%)
        total_expenses: u64,
        total_settled: u64,
        treasury_balance: Balance<T>,
        is_active: bool,
    }

    /// Bill: Represents an itemized or split invoice covered by a payer or team project
    public struct Bill has key, store {
        id: UID,
        pool_id: address,
        description: String,
        payer: address,
        total_amount: u64,
        member_count: u64,
        amount_per_member: u64,
        club_due_amount: u64,
        repaid_count: u64,
        is_fully_settled: bool,
    }

    /// AdminCap: Capability Pattern for group creators / club treasurers to arbitrate disputes, adjust dues, and close tabs
    public struct AdminCap has key, store {
        id: UID,
        pool_id: address,
        treasurer: address,
    }

    // Events
    public struct GroupPoolCreatedEvent has copy, drop {
        pool_id: address,
        creator: address,
        name: String,
        club_treasury: address,
        club_fee_bps: u64,
    }

    public struct BillCreatedEvent has copy, drop {
        bill_id: address,
        pool_id: address,
        description: String,
        payer: address,
        total_amount: u64,
        member_count: u64,
        amount_per_member: u64,
    }

    public struct SplitSettledEvent has copy, drop {
        bill_id: address,
        pool_id: address,
        settler: address,
        payer: address,
        repaid_amount: u64,
        club_due_amount: u64,
        remaining_members_to_pay: u64,
        is_fully_settled: bool,
    }

    public struct DisputeResolvedEvent has copy, drop {
        bill_id: address,
        pool_id: address,
        arbitrator: address,
        reason: String,
    }

    /// Initializes a new group pool (e.g., student team project, campus club event, dining tab)
    public entry fun create_group_pool<T>(
        name: String,
        club_treasury: address,
        club_fee_bps: u64,
        ctx: &mut TxContext
    ) {
        let pool_uid = object::new(ctx);
        let pool_address = object::uid_to_address(&pool_uid);
        let sender = tx_context::sender(ctx);

        let pool = GroupPool<T> {
            id: pool_uid,
            creator: sender,
            name,
            club_treasury,
            club_fee_bps,
            total_expenses: 0,
            total_settled: 0,
            treasury_balance: balance::zero<T>(),
            is_active: true,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            pool_id: pool_address,
            treasurer: sender,
        };

        transfer::share_object(pool);
        transfer::public_transfer(admin_cap, sender);

        event::emit(GroupPoolCreatedEvent {
            pool_id: pool_address,
            creator: sender,
            name,
            club_treasury,
            club_fee_bps,
        });
    }

    /// Creates an expense / bill covered by a single payer to be split among N members
    public entry fun create_bill<T>(
        pool: &mut GroupPool<T>,
        description: String,
        total_amount: u64,
        member_count: u64,
        ctx: &mut TxContext
    ) {
        assert!(pool.is_active, EPOOL_INACTIVE);
        assert!(member_count > 0, EINVALID_MEMBER_COUNT);

        let sender = tx_context::sender(ctx);
        let amount_per_member = total_amount / member_count;
        let club_due_amount = (amount_per_member * pool.club_fee_bps) / 10000;

        let bill_uid = object::new(ctx);
        let bill_address = object::uid_to_address(&bill_uid);

        let bill = Bill {
            id: bill_uid,
            pool_id: object::uid_to_address(&pool.id),
            description,
            payer: sender,
            total_amount,
            member_count,
            amount_per_member,
            club_due_amount,
            repaid_count: 0,
            is_fully_settled: false,
        };

        pool.total_expenses = pool.total_expenses + total_amount;

        event::emit(BillCreatedEvent {
            bill_id: bill_address,
            pool_id: object::uid_to_address(&pool.id),
            description,
            payer: sender,
            total_amount,
            member_count,
            amount_per_member,
        });

        transfer::share_object(bill);
    }

    /// Atomic repayment PTB call: Settles an individual member's share + platform dues
    public entry fun settle_member_split<T>(
        pool: &mut GroupPool<T>,
        bill: &mut Bill,
        mut payment: Coin<T>,
        ctx: &mut TxContext
    ) {
        assert!(pool.is_active, EPOOL_INACTIVE);
        assert!(!bill.is_fully_settled, EBILL_ALREADY_SETTLED);

        let required_total = bill.amount_per_member + bill.club_due_amount;
        let paid_val = coin::value(&payment);
        assert!(paid_val >= required_total, EINSUFFICIENT_PAYMENT);

        let sender = tx_context::sender(ctx);

        // 1. Deduct club / platform dues if applicable
        if (bill.club_due_amount > 0) {
            let due_coin = coin::split(&mut payment, bill.club_due_amount, ctx);
            let due_balance = coin::into_balance(due_coin);
            balance::join(&mut pool.treasury_balance, due_balance);
        };

        // 2. Route repayment directly to the original payer
        let repay_coin = coin::split(&mut payment, bill.amount_per_member, ctx);
        transfer::public_transfer(repay_coin, bill.payer);

        // 3. Return any change/remainder back to sender
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, sender);
        } else {
            coin::destroy_zero(payment);
        };

        // 4. Update Bill state & Pool ledger
        bill.repaid_count = bill.repaid_count + 1;
        if (bill.repaid_count >= bill.member_count) {
            bill.is_fully_settled = true;
        };

        pool.total_settled = pool.total_settled + bill.amount_per_member;

        let remaining = if (bill.member_count >= bill.repaid_count) {
            bill.member_count - bill.repaid_count
        } else {
            0
        };

        event::emit(SplitSettledEvent {
            bill_id: object::uid_to_address(&bill.id),
            pool_id: object::uid_to_address(&pool.id),
            settler: sender,
            payer: bill.payer,
            repaid_amount: bill.amount_per_member,
            club_due_amount: bill.club_due_amount,
            remaining_members_to_pay: remaining,
            is_fully_settled: bill.is_fully_settled,
        });
    }

    /// Admin dispute resolution: Arbitrator settles dispute and marks bill finalized
    public entry fun resolve_dispute<T>(
        cap: &AdminCap,
        pool: &mut GroupPool<T>,
        bill: &mut Bill,
        reason: String,
        ctx: &mut TxContext
    ) {
        assert!(cap.pool_id == object::uid_to_address(&pool.id), EINVALID_ADMIN_CAP);
        assert!(pool.is_active, EPOOL_INACTIVE);

        bill.is_fully_settled = true;

        event::emit(DisputeResolvedEvent {
            bill_id: object::uid_to_address(&bill.id),
            pool_id: object::uid_to_address(&pool.id),
            arbitrator: tx_context::sender(ctx),
            reason,
        });
    }

    /// Admin action: Withdraw collected platform / club treasury dues
    public entry fun withdraw_club_dues<T>(
        cap: &AdminCap,
        pool: &mut GroupPool<T>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(cap.pool_id == object::uid_to_address(&pool.id), EINVALID_ADMIN_CAP);

        let total_dues = balance::value(&pool.treasury_balance);
        if (total_dues > 0) {
            let withdrawn_balance = balance::split(&mut pool.treasury_balance, total_dues);
            let withdrawn_coin = coin::from_balance(withdrawn_balance, ctx);
            transfer::public_transfer(withdrawn_coin, recipient);
        };
    }

    /// Admin action: Close and freeze group tab
    public entry fun close_tab<T>(
        cap: &AdminCap,
        pool: &mut GroupPool<T>,
        _ctx: &mut TxContext
    ) {
        assert!(cap.pool_id == object::uid_to_address(&pool.id), EINVALID_ADMIN_CAP);
        pool.is_active = false;
    }
}
