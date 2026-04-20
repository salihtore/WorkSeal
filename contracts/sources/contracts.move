module contracts::workseal;

use std::string::String;
use sui::balance::Balance;
use sui::sui::SUI;


// admincap : belki kullanılır
public struct AdminCap has key{
    id:UID
}

fun init(ctx: &mut TxContext){
    let admin_cap = AdminCap{
        id: object::new(ctx)
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}


// ana is structı
#[allow(unused_field)]
public struct WorkContract has key, store{
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
    created_at: u64 //sozlesme tarihi

}

// asamali islerin odemelerini kontrol edecek olan yapi
#[allow(unused_field)]
public struct Milestone has store{
    title: String,
    amount: u64, //bu asama tamamlandiginda freelancera odenecek tutar 
    is_completed: bool, //is freelancer tarafindan teslim edildi mi?
    is_paid: bool //isveren onaylayip parayi serbest birakti mi?
}


