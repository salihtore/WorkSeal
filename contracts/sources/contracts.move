module contracts::workseal;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::sui::SUI;
use sui::coin::{Self, Coin};
use sui::event;
// use sui::object::{Self, ID, UID};


// ========= ERRORS =========

const EVectorLengthMismatch: u64 = 1;
const ENotAuthorized: u64 = 2;
const EAlreadyFunded: u64 = 3;
const ENotFreelancer: u64 = 4;
const EInvalidMilestoneIndex: u64 = 5;
const EMilestoneAlreadyCompleted: u64 = 6;
const EInvalidAmount: u64 = 7;
const EStatusNotActive: u64 = 8;
const EMilestoneNotCompleted: u64 = 9;
const EAlreadyPaid: u64 = 10;
const ENotActive: u64 = 11;
const EStatusNotAvtive: u64 = 12;


// ========= STRUCTS =========

public struct AdminCap has key {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}


#[allow(unused_field)]
public struct WorkContract has key, store {
    id: UID,
    title: String,
    description: String,
    freelancer: address, 
    client: address, 
    total_budget: u64, // MIST
    escrow_vault: Balance<SUI>, 
    status: u8, // 0, 1, 2, 3 
    milestones: vector<Milestone>, 
    deadline: u64, 
    created_at: u64, 
    dispute_history: vector<DisputeRecord>,
}


#[allow(unused_field)]
public struct Milestone has store {
    title: String,
    amount: u64, 
    is_completed: bool, 
    is_paid: bool, 
}


#[allow(unused_field)]
public struct DisputeRecord has store {
    raised_by: address, //sikayeti olusturan
    reason: String, //sikayet nedemi
    timestamp: u64,
}

// ========= FUNCTIONS =========


public fun create_contract(
    title: String,
    description: String,
    client: address,
    deadline_ms: u64,
    milestone_titles: vector<String>, 
    milestone_amounts: vector<u64>, 
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let len: u64 = vector::length(&milestone_titles);
    assert!(len == vector::length(&milestone_amounts), EVectorLengthMismatch);

    let mut milestones = vector::empty<Milestone>();
    let mut total_budget: u64 = 0;
    let mut i = 0;

    while (i < len) {
        let m_title = *vector::borrow(&milestone_titles, i);
        let m_amount = *vector::borrow(&milestone_amounts, i);


        total_budget = total_budget + m_amount;

        let milestone = Milestone {
            title: m_title,
            amount: m_amount,
            is_completed: false,
            is_paid: false,
        };

        vector::push_back(&mut milestones, milestone);
        i = i + 1;
    };

    let contract = WorkContract {
        id: object::new(ctx),
        title,
        description,
        freelancer: tx_context::sender(ctx), //islemi baslatan freelancer
        client,
        total_budget,
        escrow_vault: balance::zero<SUI>(), //kasa bos
        status: 0,
        milestones,
        deadline: deadline_ms,
        created_at: clock::timestamp_ms(clock),
        dispute_history: vector::empty<DisputeRecord>(),
    };

    event::emit(ContractCreatedEvent{
        contract_id: object::id(&contract),
        creator: tx_context::sender(ctx),
        client: client,
    });

    transfer::share_object(contract);
}



public fun fund_contract(
    contract: &mut WorkContract,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
){


    assert!(tx_context::sender(ctx) == contract.client, ENotAuthorized);


    assert!(contract.status == 0, EAlreadyFunded);


    let payment_amount = coin::value(&payment);
    assert!(payment_amount == contract.total_budget, EInvalidAmount);


    let payment_balance = coin::into_balance(payment);
    balance::join(&mut contract.escrow_vault, payment_balance);


    contract.status = 1;

    event::emit(ContractFundedEvent{
        contract_id: object::id(contract),
        amount: payment_amount
    });

}


public fun submit_milestone(
    contract: &mut WorkContract,
    milestone_index: u64,
    ctx: &TxContext,
){
    assert!(tx_context::sender(ctx) == contract.freelancer, ENotFreelancer);

    assert!(contract.status == 1,EStatusNotAvtive);

    let len = vector::length(&contract.milestones);
    assert!(milestone_index < len, EInvalidMilestoneIndex);

    let milestone = vector::borrow_mut(&mut contract.milestones, milestone_index);

    assert!(!milestone.is_completed, EMilestoneAlreadyCompleted);
    milestone.is_completed = true;
}

public fun approve_and_release_funds(
    contract: &mut WorkContract,
    milestone_index: u64,
    ctx: &mut TxContext
){
        assert!(tx_context::sender(ctx) == contract.client, ENotAuthorized);

        assert!(contract.status == 1, EStatusNotActive);

        let milestone_len = vector::length(&contract.milestones);
        assert!(milestone_index < milestone_len, EInvalidMilestoneIndex);

        let ml_ref = vector::borrow_mut(&mut contract.milestones, milestone_index);

        assert!(ml_ref.is_completed == true, EMilestoneNotCompleted);

        assert!(ml_ref.is_paid == false, EAlreadyPaid);

        let payment_balance = balance::split(&mut contract.escrow_vault, ml_ref.amount);

        let payment_coin = coin::from_balance(payment_balance, ctx);

        transfer::public_transfer(payment_coin, contract.freelancer);

        ml_ref.is_paid = true;

        if (all_milestones_paid(contract)){
            contract.status = 2
        };


        let milestone = vector::borrow(&contract.milestones, milestone_index);
        let release_amount = milestone.amount;

        event::emit(PaymentReleasedEvent{

            contract_id: object::id(contract),
            freelancer: contract.freelancer,
            amount: release_amount

        });
        

}

// helper function : all milestones is paid ?
fun all_milestones_paid(contract: &WorkContract): bool{
    let len = vector::length(&contract.milestones);
    let mut i = 0;

    while (i < len){
        let milestone = vector::borrow(&contract.milestones, i);
        if (!milestone.is_paid){
            return false
        };

        i = i + 1;
    };

    true

}


public fun raise_dispute(
    contract: &mut WorkContract,
    reason: String,
    clock: &Clock,
    ctx: &mut TxContext,
){
    let sender = tx_context::sender(ctx);
    assert!(
        sender == contract.freelancer || sender == contract.client, ENotAuthorized
    );

    assert!(contract.status == 1, ENotActive);

    contract.status = 3;

    let dispute = DisputeRecord {

        raised_by: sender,
        reason,
        timestamp: clock::timestamp_ms(clock),

    };

    vector::push_back(&mut contract.dispute_history, dispute);

    event::emit(DisputeRaisedEvent{
        contract_id: object::id(contract),
        raised_by: sender,
        reason: reason
    });

}


// ========= EVENTS ==========

public struct ContractCreatedEvent has copy, drop{
    contract_id: ID,
    creator: address,
    client: address
}

public struct ContractFundedEvent has copy, drop{
    contract_id: ID,
    amount: u64
}

public struct PaymentReleasedEvent has copy, drop{
    contract_id: ID,
    freelancer: address,
    amount: u64
}

public struct DisputeRaisedEvent has copy, drop{
    contract_id: ID,
    raised_by: address,
    reason: String,
}