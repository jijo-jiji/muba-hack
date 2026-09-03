module trustmesh::mock_usdc {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct MOCK_USDC has drop {}

    fun init(witness: MOCK_USDC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            6, // 6 decimals like standard USDC
            b"USDC",
            b"Mock TrustMesh USDC",
            b"Testnet stablecoin for TrustMesh freelance escrow hackathon demo",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(treasury_cap);
    }

    /// Free faucet for judges and testing
    public entry fun faucet(
        treasury_cap: &mut TreasuryCap<MOCK_USDC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let minted = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(minted, recipient);
    }
}

module trustmesh::escrow {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::event;
    use std::string::String;

    // Error Codes
    const EINVALID_CALLER: u64 = 100;
    const ESCORE_TOO_LOW: u64 = 101;
    const EINSUFFICIENT_FUNDS: u64 = 102;
    const EVANISHED_VAULT: u64 = 103;

    /// EscrowVault: Shared object holding corporate client deposits for student project milestones
    public struct EscrowVault<phantom T> has key {
        id: UID,
        client: address,
        student: address,
        treasury: address,
        balance: Balance<T>,
        is_active: bool,
    }

    /// MilestoneAuditedEvent: Emitted on-chain when Gonka AI verifies student deliverable and triggers PTB payout
    public struct MilestoneAuditedEvent has copy, drop {
        escrow_id: address,
        gonka_request_id: String,
        truth_score: u8,
        payout_amount: u64,
        fee_amount: u64,
        student: address,
    }

    /// Initializes a new project escrow and deposits milestone funds in one atomic step
    public entry fun create_and_deposit<T>(
        student: address,
        treasury: address,
        deposit: Coin<T>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&deposit);
        assert!(amount > 0, EINSUFFICIENT_FUNDS);

        let vault = EscrowVault<T> {
            id: object::new(ctx),
            client: tx_context::sender(ctx),
            student,
            treasury,
            balance: coin::into_balance(deposit),
            is_active: true,
        };
        transfer::share_object(vault);
    }

    /// Releases funds atomically from the internal Balance<T> upon passing Gonka AI audit (Score >= 80%)
    public entry fun release_audited_milestone<T>(
        vault: &mut EscrowVault<T>,
        gonka_request_id: String,
        truth_score: u8,
        ctx: &mut TxContext
    ) {
        // Enforce AI verification score threshold (must be >= 80%)
        assert!(truth_score >= 80, ESCORE_TOO_LOW);
        assert!(vault.is_active, EVANISHED_VAULT);

        let total_val = balance::value(&vault.balance);
        assert!(total_val > 0, EINSUFFICIENT_FUNDS);

        // 10% Protocol Fee to TrustMesh Treasury / 90% Student Payout
        let fee_amount = total_val / 10;
        let student_amount = total_val - fee_amount;

        let fee_balance = balance::split(&mut vault.balance, fee_amount);
        let student_balance = balance::split(&mut vault.balance, student_amount);

        let fee_coin = coin::from_balance(fee_balance, ctx);
        let student_coin = coin::from_balance(student_balance, ctx);

        transfer::public_transfer(fee_coin, vault.treasury);
        transfer::public_transfer(student_coin, vault.student);

        // Close out active vault status
        vault.is_active = false;

        // Emit verified on-chain proof containing the canonical Gonka Request ID
        event::emit(MilestoneAuditedEvent {
            escrow_id: object::uid_to_address(&vault.id),
            gonka_request_id,
            truth_score,
            payout_amount: student_amount,
            fee_amount,
            student: vault.student,
        });
    }

    /// Emergency cancellation / refund by client if student ghosts (only before release)
    public entry fun refund_client<T>(
        vault: &mut EscrowVault<T>,
        ctx: &mut TxContext
    ) {
        assert!(vault.client == tx_context::sender(ctx), EINVALID_CALLER);
        assert!(vault.is_active, EVANISHED_VAULT);

        vault.is_active = false;
        let total_val = balance::value(&vault.balance);
        let refund_balance = balance::split(&mut vault.balance, total_val);
        let refund_coin = coin::from_balance(refund_balance, ctx);

        transfer::public_transfer(refund_coin, vault.client);
    }
}
