"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ChevronRight, FileText, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useContracts } from "@/hooks/useContracts";
import { formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function DisputesPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);
  
  const myDisputes = contracts.filter(c => c.status === 3);
  const hasDisputes = myDisputes.length > 0;

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="pb-10 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-2 pt-10">
        <div>
          <p className="font-mono text-[10px] text-[#4FC3F7]/60 tracking-widest uppercase mb-3">
            HUKUK & ÇÖZÜM
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Anlaşmazlık Merkezi
          </h1>
        </div>
        <Link href="/contracts">
          <Button className="h-10 px-6 bg-transparent border border-border text-foreground font-bold text-sm hover:bg-white/[0.05] gap-2 rounded-none uppercase tracking-wider">
            <FileText size={16} /> Sözleşmelerime Dön
          </Button>
        </Link>
      </div>

      <div className="px-10 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-destructive" size={28} />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">KAYITLAR İNCELENİYOR</p>
          </div>
        ) : !hasDisputes ? (
          <div className="flex flex-col items-center justify-center py-40 text-center border border-border bg-card">
            <div className="w-16 h-16 rounded-none bg-emerald-400/10 flex items-center justify-center mb-6 border border-emerald-400/20">
              <CheckCircle2 size={30} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Her Şey Yolunda!</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Şu an için aktif bir anlaşmazlığınız bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="border border-destructive/30 bg-card divide-y divide-destructive/30">
            {myDisputes.map((contract) => {
              const latestDispute = contract.dispute_history?.[contract.dispute_history.length - 1];
              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="block w-full">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 hover:bg-destructive/[0.02] transition-colors group cursor-pointer">
                    <div className="flex gap-6 items-start flex-1">
                      <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} className="text-destructive animate-pulse" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-[#4FC3F7] transition-colors line-clamp-1">{contract.title}</h3>
                          <span className="font-mono text-[10px] px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">
                            İncelemede
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="font-mono text-[10px] text-muted-foreground">ID: {contract.id.slice(0, 10)}...</p>
                          <span className="text-[10px] text-muted-foreground/50">·</span>
                          <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {formatTimestamp(latestDispute?.timestamp || contract.created_at)}
                          </p>
                        </div>
                        {latestDispute && (
                          <div className="mt-4 p-4 border border-destructive/20 bg-destructive/5 font-mono text-xs text-foreground/80 leading-relaxed border-l-2 border-l-destructive">
                            {latestDispute.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center gap-2 text-muted-foreground group-hover:text-destructive transition-colors font-mono text-xs uppercase tracking-widest font-bold">
                      Detaylar <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}