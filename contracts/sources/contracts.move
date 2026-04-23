module contracts::workseal;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::sui::SUI;
use sui::coin::{Self, Coin};


// ========= EVENTS ==========

// ========= ERRORS =========
const EVectorLengthMismatch: u64 = 1;
const ENotAuthorized: u64 = 2;
const EAlreadyFunded: u64 = 3;
const ENotFreelancer: u64 = 4;
const EInvalidMilestoneIndex: u64 = 5;
const EMilestoneAlreadyCompleted: u64 = 6;
const EInvalidAmount: u64 = 7;

// ========= STRUCTS =========

// admincap : anlasmazliklar icin hakemde kullanilacak
public struct AdminCap has key {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}

// ana is structı
#[allow(unused_field)]
public struct WorkContract has key, store {
    id: UID,
    title: String,
    description: String,
    freelancer: address, //isi alan kisi
    client: address, //isi veren kisi
    total_budget: u64, // MIST
    escrow_vault: Balance<SUI>, //isverenin yatırdıgı paranin kilitlendigi kasa
    status: u8, // 0, 1, 2, 3 : bekliyor, aktif, tamamlandi, ihtilaf-anlasmazlik
    milestones: vector<Milestone>, //is asamalari
    deadline: u64, //bitis tarihi
    created_at: u64, //sozlesme tarihi
}

// asamali islerin odemelerini kontrol edecek olan yapi
#[allow(unused_field)]
public struct Milestone has store {
    title: String,
    amount: u64, //bu asama tamamlandiginda freelancera odenecek tutar
    is_completed: bool, //is freelancer tarafindan teslim edildi mi?
    is_paid: bool, //isveren onaylayip parayi serbest birakti mi?
}

// ihtilaf-anlasmazlik kaydi
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
    milestone_titles: vector<String>, //is parcaciklari basliklari
    milestone_amounts: vector<u64>, // parca basina para
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

        //butceyi toplayarak ilerle
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
    };

    transfer::share_object(contract);
}


public fun fund_contract(
    contract: &mut WorkContract,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
){

    // 1-) sadece musteri fonlayabilir
    assert!(tx_context::sender(ctx) == contract.client, ENotAuthorized);

    // 2-) sozlesme henuz fonlanmamis olmali
    assert!(contract.status == 0, EAlreadyFunded);

    // 3-) gonderilen miktar toplam butceye esit olmali
    let payment_amount = coin::value(&payment);
    assert!(payment_amount == contract.total_budget, EInvalidAmount);

    // 4-) coini balance'a cevir
    let payment_balance = coin::into_balance(payment);
    balance::join(&mut contract.escrow_vault, payment_balance);

    // 5-) sozlesmeyi aktif hale getir
    contract.status = 1;
}


public fun submit_milestone(
    contract: &mut WorkContract,
    milestone_index: u64,
    ctx: &TxContext,
){
    assert!(tx_context::sender(ctx) == contract.freelancer, ENotFreelancer);

    let len = vector::length(&contract.milestones);
    assert!(milestone_index < len, EInvalidMilestoneIndex);

    let milestone = vector::borrow_mut(&mut contract.milestones, milestone_index);

    assert!(!milestone.is_completed, EMilestoneAlreadyCompleted);
    milestone.is_completed = true;
}

