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
  Inbox
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
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
         <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
         </div>
         <h1 className="text-2xl font-bold">Yetkisiz Erişim</h1>
         <p className="text-muted-foreground">Bu sayfaya sadece kayıtlı sistem hakemleri erişebilir.</p>
         <Link href="/dashboard"><Button>Geri Dön</Button></Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted-foreground animate-pulse font-medium">Yargı Verileri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Gavel className="text-primary" size={36} />
            Yargı ve Uyuşmazlık Yönetimi
          </h1>
          <p className="text-muted-foreground font-medium">
            Sistem hakemi olarak tarafsız karar verme ve adaleti sağlama yetkiniz aktif.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Scale size={14} /> Sistem Hakemi Yetkisi Aktif
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={80} /></div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Karar Bekleyen</p>
          <h3 className="text-3xl font-mono font-bold text-destructive">{stats.totalActive} Dosya</h3>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={80} /></div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Çözümlenen</p>
          <h3 className="text-3xl font-mono font-bold text-green-500">{stats.totalResolved} Karar</h3>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><History size={80} /></div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Devam Ettirilen</p>
          <h3 className="text-3xl font-mono font-bold text-blue-500">{stats.totalResumed} İş</h3>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border/50 pb-px">
        <button onClick={() => setActiveTab("active")} className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "active" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="flex items-center gap-2"><AlertCircle size={16} /> Bekleyen Dosyalar <Badge className="ml-1 bg-primary/10 text-primary border-none">{activeDisputes.length}</Badge></div>
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="flex items-center gap-2"><History size={16} /> Geçmiş Kararlarım <Badge className="ml-1 bg-secondary text-muted-foreground border-none">{historyDisputes.length}</Badge></div>
        </button>
      </div>

      {!hasItems ? (
        <Card className="p-20 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 text-muted-foreground"><Inbox size={40} /></div>
          <h3 className="text-xl font-bold text-foreground mb-2">Her Şey Güncel</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">Şu an için {activeTab === "active" ? "karar bekleyen bir dosya bulunmuyor." : "henüz bir karar geçmişiniz yok."}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentList.map((contract) => {
            const latestDispute = contract.dispute_history?.[contract.dispute_history.length - 1];
            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="block group">
                <Card className="p-6 border-border/50 bg-card hover:border-primary/40 transition-all shadow-sm hover:shadow-md relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === "active" ? "bg-destructive" : "bg-green-500"}`} />
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex gap-5 items-start flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${activeTab === "active" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}>{activeTab === "active" ? <Gavel size={28} /> : <ShieldCheck size={28} />}</div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{contract.title}</h3>
                          <Badge className={activeTab === "active" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>{activeTab === "active" ? "KARAR BEKLİYOR" : "KARARA BAĞLANDI"}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                          <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-primary" /> {contract.id.slice(0, 12)}...</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} /> {formatTimestamp(latestDispute?.timestamp || contract.created_at)}</span>
                        </div>
                        {latestDispute && (
                          <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-border/50"><p className="text-sm text-foreground/80 italic">"{latestDispute.reason}"</p></div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0 text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sözleşme Tutarı</p>
                      <p className="text-xl font-mono font-bold text-primary">{Number(contract.total_budget) / 1_000_000_000} <span className="text-xs">SUI</span></p>
                      <Button size="sm" className="gap-2 bg-secondary text-foreground hover:bg-primary hover:text-white rounded-full px-6">{activeTab === "active" ? "Dosyayı İncele" : "Kararı Gör"} <ChevronRight size={14} /></Button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
