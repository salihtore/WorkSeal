"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Gavel, 
  Scale, 
  History, 
  ShieldCheck, 
  AlertCircle,
  Briefcase,
  Inbox,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import { formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";

export default function ArbitratorPortalPage() {
  const account = useCurrentAccount();
  const { contracts, loading, isArbitrator, fetchAllContracts } = useContracts(account?.address);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);
  
  // Sadece uyuşmazlıklar ve hakemin dahil olduğu dosyalar
  const activeDisputes = contracts.filter(c => c.status === 3);
  const historyDisputes = contracts.filter(c => c.status !== 3 && c.arbitrator && c.arbitrator.toLowerCase() === account?.address?.toLowerCase());
  
  const currentList = activeTab === "active" ? activeDisputes : historyDisputes;
  const hasItems = currentList.length > 0;

  const stats = {
    totalActive: activeDisputes.length,
    totalResolved: contracts.filter(c => c.arbitrator?.toLowerCase() === account?.address?.toLowerCase() && (c.status === 2)).length,
    totalResumed: contracts.filter(c => c.arbitrator?.toLowerCase() === account?.address?.toLowerCase() && (c.status === 1)).length,
  };

  if (!isArbitrator && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <span className="text-8xl font-black text-border mb-6">!</span>
        <h1 className="text-2xl font-black tracking-tight mb-2">Yetkisiz Erişim</h1>
        <p className="text-muted-foreground text-sm font-mono mb-8">Bu sayfaya sadece kayıtlı sistem hakemleri erişebilir.</p>
        <Link href="/dashboard">
          <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90">
            Dashboard'a Dön
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-[#4FC3F7]" size={28} />
        <p className="font-mono text-xs text-muted-foreground tracking-widest">YARGI VERİLERİ YÜKLENİYOR</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-10 space-y-0">
      {/* ── Page Header ── */}
      <div className="pb-10 border-b border-border flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-[#4FC3F7]/60 tracking-widest uppercase mb-3">
            <Scale size={10} className="inline mr-1" /> Sistem Hakemi Yetkisi Aktif
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Yargı Yönetimi
          </h1>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 border-b border-border mb-10">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "active"
              ? "border-[#4FC3F7] text-[#4FC3F7]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Bekleyen Dosyalar
          <span className={`font-mono text-[10px] px-2 py-0.5 ${
            activeTab === "active" ? "bg-[#4FC3F7]/10 text-[#4FC3F7]" : "bg-muted text-muted-foreground"
          }`}>
            {activeDisputes.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "history"
              ? "border-[#4FC3F7] text-[#4FC3F7]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Geçmiş Kararlarım
          <span className={`font-mono text-[10px] px-2 py-0.5 ${
            activeTab === "history" ? "bg-[#4FC3F7]/10 text-[#4FC3F7]" : "bg-muted text-muted-foreground"
          }`}>
            {historyDisputes.length}
          </span>
        </button>
      </div>

      <div className="space-y-10">
        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-px">
          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Karar Bekleyen</p>
            <p className="text-4xl font-black font-mono text-[#F87171]">
              {stats.totalActive} <span className="text-sm font-bold text-muted-foreground">Dosya</span>
            </p>
          </div>
          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Çözümlenen</p>
            <p className="text-4xl font-black font-mono text-emerald-400">
              {stats.totalResolved} <span className="text-sm font-bold text-muted-foreground">Karar</span>
            </p>
          </div>
          <div className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Devam Ettirilen</p>
            <p className="text-4xl font-black font-mono text-[#4FC3F7]">
              {stats.totalResumed} <span className="text-sm font-bold text-muted-foreground">İş</span>
            </p>
          </div>
        </div>

        {/* ── List ── */}
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              {activeTab === "active" ? "Bekleyen Dosyalar" : "Geçmiş Kararlarım"}
            </p>
          </div>
          <div className="divide-y divide-border">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-8xl font-black text-border mb-6">·</span>
                <p className="text-muted-foreground text-sm font-mono">
                  {activeTab === "active" ? "Şu an için karar bekleyen bir dosya bulunmuyor." : "Henüz bir karar geçmişiniz yok."}
                </p>
              </div>
            ) : (
              currentList.map((contract) => {
                const latestDispute = contract.dispute_history?.[contract.dispute_history.length - 1];
                return (
                  <Link key={contract.id} href={`/contracts/${contract.id}`}>
                    <div className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.025] transition-colors group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-sm group-hover:text-[#4FC3F7] transition-colors">
                            {contract.title}
                          </p>
                          <span className={`font-mono text-[10px] px-2 py-0.5 ${
                            activeTab === "active" ? "bg-[#F87171]/10 text-[#F87171]" : "bg-emerald-400/10 text-emerald-400"
                          }`}>
                            {activeTab === "active" ? "KARAR BEKLİYOR" : "KARARA BAĞLANDI"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-[10px] text-muted-foreground">
                            ID: {contract.id.slice(0, 14)}...
                          </p>
                          {latestDispute && (
                            <p className="font-mono text-[10px] text-muted-foreground/60 italic truncate max-w-[300px]">
                              "{latestDispute.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <p className="font-mono text-sm font-bold text-[#4FC3F7]">
                          {Number(contract.total_budget) / 1_000_000_000} SUI
                        </p>
                        <ArrowRight size={14} className="text-muted-foreground group-hover:text-[#4FC3F7] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
