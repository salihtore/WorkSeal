"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowDownLeft, ArrowUpRight, Plus, ExternalLink, Activity, Coins } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui, formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";

export default function EscrowPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  const address = account?.address;

  // Hesaplamalar
  let totalLocked = BigInt(0);
  let totalReceived = BigInt(0);
  let totalSent = BigInt(0);

  const transactions: any[] = [];

  if (address && contracts) {
    contracts.forEach(contract => {
      const isClient = contract.client === address;
      const isFreelancer = contract.freelancer === address;

      // Sadece aktif ve kilitli olanları veya ödenenleri hesapla
      contract.milestones.forEach((m, i) => {
        if (m.is_paid) {
          if (isClient) totalSent += m.amount;
          if (isFreelancer) totalReceived += m.amount;
          
          transactions.push({
            id: `${contract.id.slice(0,6)}-${i}`,
            contractId: contract.id,
            counterparty: isClient ? contract.freelancer : contract.client,
            amount: mistToSui(m.amount),
            date: formatTimestamp(contract.created_at), // Ödeme tarihi normalde eventten gelir, şimdilik kontrat tarihi
            type: isClient ? "sent" : "received",
            status: "released"
          });
        } else if (contract.status === 1) { // Aktif kontratsa kilitlidir
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
    <div className="max-w-6xl mx-auto space-y-8">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Escrow & Ödemeler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gelen, kilitlenen ve serbest bırakılan finansal varlıklarınızın güncel durumu.
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all">
            <Plus size={16} /> Yeni Sözleşme
          </Button>
        </Link>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Shield size={20} className="text-blue-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Kilitli Tutar (Escrow)</span>
          </div>
          <p className="text-3xl font-mono font-bold text-foreground relative z-10">{mistToSui(totalLocked)} <span className="text-lg text-muted-foreground font-sans">SUI</span></p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="absolute inset-0 bg-green-500/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ArrowDownLeft size={20} className="text-green-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Serbest Bırakılan (Gelen)</span>
          </div>
          <p className="text-3xl font-mono font-bold text-foreground relative z-10">{mistToSui(totalReceived)} <span className="text-lg text-muted-foreground font-sans">SUI</span></p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 relative overflow-hidden group hover:border-foreground/20 transition-all">
          <div className="absolute inset-0 bg-secondary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Gönderilen (Müşteriysen)</span>
          </div>
          <p className="text-3xl font-mono font-bold text-foreground relative z-10">{mistToSui(totalSent)} <span className="text-lg text-muted-foreground font-sans">SUI</span></p>
        </Card>
      </div>

      {/* Escrow İşlemleri Tablosu */}
      {loading ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-sm text-muted-foreground">İşlemleriniz yükleniyor...</p>
        </Card>
      ) : hasTransactions ? (
        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Son İşlemler
            </h2>
            <Button variant="outline" size="sm" className="h-8 border-border/50">Tümünü Gör</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <th className="px-6 py-4 font-medium">İşlem ID</th>
                  <th className="px-6 py-4 font-medium">Karşı Taraf</th>
                  <th className="px-6 py-4 font-medium">Miktar</th>
                  <th className="px-6 py-4 font-medium">Tarih</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{tx.id}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{tx.counterparty ? `${tx.counterparty.slice(0,6)}...${tx.counterparty.slice(-4)}` : "Belirsiz"}</td>
                    <td className="px-6 py-4 font-mono font-bold flex items-center gap-2">
                      {tx.type === "received" ? <ArrowDownLeft size={14} className="text-green-500" /> : tx.type === "released" ? <ArrowDownLeft size={14} className="text-green-500" /> : tx.type === "sent" ? <ArrowUpRight size={14} className="text-muted-foreground" /> : <Shield size={14} className="text-blue-500" />}
                      {tx.amount} SUI
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                    <td className="px-6 py-4">
                      {tx.status === "locked" ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 py-1">
                          <Shield size={12} /> Kilitli
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 py-1">
                          <Coins size={12} /> Serbest Bırakıldı
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/contracts/${tx.contractId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                          <ExternalLink size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <Coins size={30} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Henüz ödeme işleminiz yok</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Sisteme kilitlenmiş veya serbest bırakılmış herhangi bir SUI varlığınız bulunmuyor.
          </p>
        </Card>
      )}

    </div>
  );
}