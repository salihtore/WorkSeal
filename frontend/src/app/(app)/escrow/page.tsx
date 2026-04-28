"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowDownLeft, ArrowUpRight, Plus, ExternalLink, Activity, Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui, formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function EscrowPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  const address = account?.address;

  let totalLocked = BigInt(0);
  let totalReceived = BigInt(0);
  let totalSent = BigInt(0);

  const transactions: any[] = [];

  if (address && contracts) {
    contracts.forEach(contract => {
      const isClient = contract.client === address;
      const isFreelancer = contract.freelancer === address;

      contract.milestones.forEach((m, i) => {
        if (m.is_paid) {
          if (isClient) totalSent += m.amount;
          if (isFreelancer) totalReceived += m.amount;
          
          transactions.push({
            id: `${contract.id.slice(0,6)}-${i}`,
            contractId: contract.id,
            counterparty: isClient ? contract.freelancer : contract.client,
            amount: mistToSui(m.amount),
            date: formatTimestamp(contract.created_at), 
            type: isClient ? "sent" : "received",
            status: "released"
          });
        } else if (contract.status === 1) { 
          totalLocked += m.amount;
          
          transactions.push({
            id: `${contract.id.slice(0,6)}-${i}`,
            contractId: contract.id,
            counterparty: isClient ? contract.freelancer || "Bekleniyor" : contract.client,
            amount: mistToSui(m.amount),
            date: formatTimestamp(contract.created_at),
            type: "locked",
            status: "locked"
          });
        }
      });
    });
  }

  const hasTransactions = transactions.length > 0;

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="border-b border-border px-10 pt-10 pb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">
            FİNANSAL DURUM
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Ödemeler <span className="text-[#4FC3F7]">& Escrow</span>
          </h1>
        </div>
        <Link href="/contracts/new">
          <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90">
            Yeni Sözleşme
          </Button>
        </Link>
      </div>

      <div className="px-10 py-8">
        {/* ── Özet Kartlar ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-10">
          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-[#4FC3F7]" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Kilitli Tutar</p>
            </div>
            <p className="text-4xl font-black font-mono text-[#4FC3F7]">
              {mistToSui(totalLocked)} <span className="text-xl text-[#4FC3F7]/50">SUI</span>
            </p>
          </div>

          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownLeft size={16} className="text-emerald-400" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Serbest Bırakılan (Gelen)</p>
            </div>
            <p className="text-4xl font-black font-mono text-foreground">
              {mistToSui(totalReceived)} <span className="text-xl text-muted-foreground">SUI</span>
            </p>
          </div>

          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight size={16} className="text-muted-foreground" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Gönderilen</p>
            </div>
            <p className="text-4xl font-black font-mono text-muted-foreground">
              {mistToSui(totalSent)} <span className="text-xl text-muted-foreground/50">SUI</span>
            </p>
          </div>
        </div>

        {/* ── Escrow İşlemleri Tablosu ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#4FC3F7]" size={28} />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">VERİLER YÜKLENİYOR</p>
          </div>
        ) : hasTransactions ? (
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Son İşlemler
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-[10px] text-muted-foreground uppercase bg-white/[0.02] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">İşlem ID</th>
                    <th className="px-6 py-4 font-medium">Karşı Taraf</th>
                    <th className="px-6 py-4 font-medium text-right">Miktar</th>
                    <th className="px-6 py-4 font-medium">Tarih</th>
                    <th className="px-6 py-4 font-medium">Durum</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-xs">{tx.id}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {tx.counterparty ? `${tx.counterparty.slice(0,6)}...${tx.counterparty.slice(-4)}` : "Belirsiz"}
                      </td>
                      <td className="px-6 py-4 font-bold flex justify-end items-center gap-2">
                        {tx.type === "received" ? <ArrowDownLeft size={14} className="text-emerald-400" /> : 
                         tx.type === "released" ? <ArrowDownLeft size={14} className="text-emerald-400" /> : 
                         tx.type === "sent" ? <ArrowUpRight size={14} className="text-muted-foreground" /> : 
                         <Shield size={14} className="text-[#4FC3F7]" />}
                        <span className={tx.type === "locked" ? "text-[#4FC3F7]" : "text-foreground"}>
                          {tx.amount} SUI
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{tx.date}</td>
                      <td className="px-6 py-4">
                        {tx.status === "locked" ? (
                          <span className="text-[10px] px-2 py-1 bg-[#4FC3F7]/10 text-[#4FC3F7] border border-[#4FC3F7]/20 uppercase tracking-wider">
                            Kilitli
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 uppercase tracking-wider">
                            Serbest
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/contracts/${tx.contractId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#4FC3F7] hover:bg-transparent transition-colors">
                            <ExternalLink size={16} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border border-border bg-card">
            <span className="text-8xl font-black text-border mb-6">·</span>
            <p className="text-muted-foreground text-sm font-mono mb-8">Henüz ödeme işleminiz yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}