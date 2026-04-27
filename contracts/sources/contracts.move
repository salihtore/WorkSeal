module contracts::workseal;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::sui::SUI;
use sui::coin::{Self, Coin};
use sui::event;

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
const EJobAlreadyTaken: u64 = 13;
const ECancelNotAllowed: u64 = 14;



// ========= STRUCTS =========

public struct AdminCap has key {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    
    let mut registry = ArbitratorRegistry {
        id: object::new(ctx),
        arbitrators: vector::empty(),
        next_index: 0,
    };

    // Deployer'ı otomatik ilk hakem olarak kaydet
    vector::push_back(&mut registry.arbitrators, ArbitratorProfile {
        addr: sender,
        current_jobs: 0,
        max_jobs: 999, // Admin için yüksek kota
        is_active: true,
    });

    transfer::transfer(admin_cap, sender);
    transfer::share_object(registry);
}


#[allow(unused_field)]
public struct WorkContract has key, store {
    id: UID,
    title: String,
    description: String,
    freelancer: Option<address>, 
    client: address, 
    total_budget: u64, // MIST
    escrow_vault: Balance<SUI>, 
    status: u8, // 0, 1, 2, 3 
    milestones: vector<Milestone>, 
    deadline: u64, 
    created_at: u64, 
    dispute_history: vector<DisputeRecord>,
    messages: vector<Message>, // Grup sohbeti
    client_arbitrator_messages: vector<Message>, // Hakem - Müşteri 
    freelancer_arbitrator_messages: vector<Message>, // Hakem - Freelancer 
    arbitrator: Option<address>, // Atanan hakem
}

// Hakem Kayıt Defteri
public struct ArbitratorRegistry has key {
    id: UID,
    arbitrators: vector<ArbitratorProfile>,
    next_index: u64, // Bir sonraki atama için sayaç
}

public struct ArbitratorProfile has store {
    addr: address,
    current_jobs: u64,
    max_jobs: u64,
    is_active: bool,
}


#[allow(unused_field)]
public struct Milestone has store {
    title: String,
    amount: u64, 
    is_completed: bool, 
    is_paid: bool, 
    proof_link: Option<String>,
    proof_notes: Option<String>,
}


#[allow(unused_field)]
public struct DisputeRecord has store {
    raised_by: address, //sikayeti olusturan
    reason: String, //sikayet nedemi
    timestamp: u64,
}

#[allow(unused_field)]
public struct Message has store {
    sender: address,
    content: String,
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
            proof_link: option::none(),
            proof_notes: option::none(),
        };

        vector::push_back(&mut milestones, milestone);
        i = i + 1;
    };

    let contract = WorkContract {
        id: object::new(ctx),
        title,
        description,
        freelancer: option::none(),
        client: tx_context::sender(ctx),
        total_budget,
        escrow_vault: balance::zero<SUI>(), //kasa bos
        status: 0,
        milestones,
        deadline: deadline_ms,
        created_at: clock::timestamp_ms(clock),
        dispute_history: vector::empty<DisputeRecord>(),
        messages: vector::empty<Message>(),
        client_arbitrator_messages: vector::empty<Message>(),
        freelancer_arbitrator_messages: vector::empty<Message>(),
        arbitrator: option::none(),
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
    proof_link: String,
    proof_notes: String,
    ctx: &TxContext,
){
    assert!(option::is_some(&contract.freelancer), ENotFreelancer); 
    assert!(tx_context::sender(ctx) == *option::borrow(&contract.freelancer), ENotFreelancer);

    assert!(contract.status == 1, EStatusNotActive);

    let len = vector::length(&contract.milestones);
    assert!(milestone_index < len, EInvalidMilestoneIndex);

    let milestone = vector::borrow_mut(&mut contract.milestones, milestone_index);

    assert!(!milestone.is_completed, EMilestoneAlreadyCompleted);
    
    // Clear previous proof if exists (for resubmission)
    if (option::is_some(&milestone.proof_link)) {
        option::extract(&mut milestone.proof_link);
    };
    if (option::is_some(&milestone.proof_notes)) {
        option::extract(&mut milestone.proof_notes);
    };

    milestone.is_completed = true;
    option::fill(&mut milestone.proof_link, proof_link);
    option::fill(&mut milestone.proof_notes, proof_notes);
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

        let freelancer_address = *option::borrow(&contract.freelancer);

        transfer::public_transfer(payment_coin, freelancer_address);
        ml_ref.is_paid = true;

        if (all_milestones_paid(contract)){
            contract.status = 2
        };


        let milestone = vector::borrow(&contract.milestones, milestone_index);
        let release_amount = milestone.amount;

        event::emit(PaymentReleasedEvent{

            contract_id: object::id(contract),
            freelancer: freelancer_address,
            amount: release_amount

        });
}

public fun reject_milestone(
    contract: &mut WorkContract,
    milestone_index: u64,
    reason: String,
    clock: &Clock,
    ctx: &TxContext
) {
    assert!(tx_context::sender(ctx) == contract.client, ENotAuthorized);
    assert!(contract.status == 1, EStatusNotActive);
    
    let len = vector::length(&contract.milestones);
    assert!(milestone_index < len, EInvalidMilestoneIndex);
    
    let milestone = vector::borrow_mut(&mut contract.milestones, milestone_index);
    assert!(milestone.is_completed, EMilestoneNotCompleted);
    assert!(!milestone.is_paid, EAlreadyPaid);
    
    milestone.is_completed = false;
    
    // Clear old proof so freelancer can re-submit
    if (option::is_some(&milestone.proof_link)) {
        option::extract(&mut milestone.proof_link);
    };
    if (option::is_some(&milestone.proof_notes)) {
        option::extract(&mut milestone.proof_notes);
    };

    // Add rejection reason as a message
    let message = Message {
        sender: tx_context::sender(ctx),
        content: reason,
        timestamp: clock::timestamp_ms(clock),
    };
    vector::push_back(&mut contract.messages, message);
    
    event::emit(MilestoneRejectedEvent {
        contract_id: object::id(contract),
        milestone_index,
        reason
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
    registry: &mut ArbitratorRegistry,
    reason: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(contract.status == 1, EStatusNotActive);
    
    let sender = tx_context::sender(ctx);
    let record = DisputeRecord {
        raised_by: sender,
        reason,
        timestamp: clock::timestamp_ms(clock),
    };
    
    vector::push_back(&mut contract.dispute_history, record);
    contract.status = 3; // Disputed

    // otomatik hakem atama
    if (option::is_none(&contract.arbitrator)) {
        let len = vector::length(&registry.arbitrators);
        if (len > 0) {
            let mut i = 0;
            while (i < len) {
            let idx = (registry.next_index + i) % len;
            let p = vector::borrow_mut(&mut registry.arbitrators, idx);
            if (p.is_active && p.current_jobs < p.max_jobs) {
                option::fill(&mut contract.arbitrator, p.addr);
                p.current_jobs = p.current_jobs + 1;
                registry.next_index = (idx + 1) % len;


                event::emit(ArbitratorAssignedEvent {
                    contract_id: object::id(contract),
                    arbitrator: p.addr,
                });
                break
            };
            i = i + 1;
        };
    };
};

    event::emit(DisputeRaisedEvent {
        contract_id: object::id(contract),
        raised_by: sender,
        reason,
    });
}


public fun take_job(
    contract: &mut WorkContract,
    ctx: &mut TxContext
) {
    assert!(option::is_none(&contract.freelancer), EJobAlreadyTaken);
    
    option::fill(&mut contract.freelancer, tx_context::sender(ctx));
    
}

// ========= HAKEM FONKSIYONLARI =========

public fun register_arbitrator(
    _: &AdminCap,
    registry: &mut ArbitratorRegistry,
    addr: address,
    max_jobs: u64,
) {
    let profile = ArbitratorProfile {
        addr,
        current_jobs: 0,
        max_jobs,
        is_active: true,
    };
    vector::push_back(&mut registry.arbitrators, profile);
}



fun internal_resolve(
    registry: &mut ArbitratorRegistry,
    contract: &mut WorkContract,
    winner: address,
    ctx: &mut TxContext
) {
    let remaining_balance = balance::value(&contract.escrow_vault);
    
    if (remaining_balance > 0) {
        // KOMISYON HESABI (%2 hakem ücreti)
        let commission_amount = (remaining_balance * 2) / 100;

        // hakem icin komisyon odemesi
        if (option::is_some(&contract.arbitrator)) {
            let arb_addr = *option::borrow(&contract.arbitrator);
            let commission_balance = balance::split(&mut contract.escrow_vault, commission_amount);
            let commission_coin = coin::from_balance(commission_balance, ctx);
            transfer::public_transfer(commission_coin, arb_addr);

            // Hakemin kotasını bir azalt 
            let mut i = 0;
            let len = vector::length(&registry.arbitrators);
            while (i < len) {
                let p = vector::borrow_mut(&mut registry.arbitrators, i);
                if (p.addr == arb_addr) {
                    p.current_jobs = p.current_jobs - 1;
                    break
                };
                i = i + 1;
            };
        };

        // haklı tarafın odemesi
        let final_balance_val = balance::value(&contract.escrow_vault);
        let payment_balance = balance::split(&mut contract.escrow_vault, final_balance_val);
        let payment_coin = coin::from_balance(payment_balance, ctx);
        transfer::public_transfer(payment_coin, winner);
    };
    
    contract.status = 2; 
    
    event::emit(DisputeResolvedEvent {
        contract_id: object::id(contract),
        winner,
        amount: remaining_balance
    });
}

public fun resolve_dispute_admin(
    _: &AdminCap,
    registry: &mut ArbitratorRegistry,
    contract: &mut WorkContract,
    winner: address,
    ctx: &mut TxContext
) {
    assert!(contract.status == 3, EStatusNotActive);
    internal_resolve(registry, contract, winner, ctx);
}

public fun resolve_dispute_arbitrator(
    registry: &mut ArbitratorRegistry,
    contract: &mut WorkContract,
    winner: address,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    assert!(contract.status == 3, EStatusNotActive);
    assert!(option::is_some(&contract.arbitrator) && sender == *option::borrow(&contract.arbitrator), ENotAuthorized);
    internal_resolve(registry, contract, winner, ctx);
}

public fun send_message(
    contract: &mut WorkContract,
    content: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let is_client = sender == contract.client;
    let is_freelancer = option::is_some(&contract.freelancer) && sender == *option::borrow(&contract.freelancer);
    let is_arbitrator = option::is_some(&contract.arbitrator) && sender == *option::borrow(&contract.arbitrator);
    
    // Taraflar VEYA Hakem mesaj gönderebilir
    assert!(is_client || is_freelancer || is_arbitrator, ENotAuthorized);
    
    let message = Message {
        sender,
        content,
        timestamp: clock::timestamp_ms(clock),
    };
    
    vector::push_back(&mut contract.messages, message);
}

#[allow(lint(self_transfer))]
public fun cancel_contract(
    contract: &mut WorkContract,
    ctx: &mut TxContext
) {
    assert!(tx_context::sender(ctx) == contract.client, ENotAuthorized);
    
    let is_unfunded = contract.status == 0;
    let is_unassigned = contract.status == 1 && option::is_none(&contract.freelancer);
    assert!(is_unfunded || is_unassigned, ECancelNotAllowed);

    // refund if funded
    if (contract.status == 1) {
        let total_balance = balance::value(&contract.escrow_vault);
        let refund_balance = balance::split(&mut contract.escrow_vault, total_balance);
        let refund_coin = coin::from_balance(refund_balance, ctx);
        transfer::public_transfer(refund_coin, tx_context::sender(ctx));
    };

    contract.status = 4; 

    event::emit(ContractCancelledEvent{
        contract_id: object::id(contract),
        client: contract.client,
    });
}

// hakemin sözleşmeyi devam ettirmesi
public fun resume_contract_arbitrator(
    contract: &mut WorkContract,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    assert!(contract.status == 3, EStatusNotActive);
    assert!(option::is_some(&contract.arbitrator) && *option::borrow(&contract.arbitrator) == sender, ENotAuthorized);
    
    contract.status = 1; // Tekrar Aktif

    event::emit(ContractResumedEvent {
        contract_id: object::id(contract),
        arbitrator: sender,
    });
}

// ozel mesaj gonderme
public fun send_private_message(
    contract: &mut WorkContract,
    content: String,
    target_role: u8, // 0: Client, 1: Freelancer
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let is_arbitrator = option::is_some(&contract.arbitrator) && *option::borrow(&contract.arbitrator) == sender;
    let is_client = sender == contract.client;
    let is_freelancer = option::is_some(&contract.freelancer) && *option::borrow(&contract.freelancer) == sender;

    assert!(is_arbitrator || is_client || is_freelancer, ENotAuthorized);

    let msg = Message {
        sender,
        content,
        timestamp: clock::timestamp_ms(clock),
    };

    if (target_role == 0) {
        // Hakem <-> Müşteri
        assert!(is_arbitrator || is_client, ENotAuthorized);
        vector::push_back(&mut contract.client_arbitrator_messages, msg);
    } else {
        // Hakem <-> Freelancer
        assert!(is_arbitrator || is_freelancer, ENotAuthorized);
        vector::push_back(&mut contract.freelancer_arbitrator_messages, msg);
    }
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

public struct MilestoneRejectedEvent has copy, drop{
    contract_id: ID,
    milestone_index: u64,
    reason: String,
}

public struct ContractCancelledEvent has copy, drop{
    contract_id: ID,
    client: address,
}

public struct DisputeResolvedEvent has copy, drop{
    contract_id: ID,
    winner: address,
    amount: u64,
}

public struct ArbitratorAssignedEvent has copy, drop {
    contract_id: ID,
    arbitrator: address,
}

public struct ContractResumedEvent has copy, drop {
    contract_id: ID,
    arbitrator: address,
}