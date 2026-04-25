"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ChevronRight, FileText, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useContracts } from "@/hooks/useContracts";
import { formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";

export default function DisputesPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);
  
  // Normal kullanıcı sadece kendi taraf olduğu uyuşmazlıkları görür
  const myDisputes = contracts.filter(c => c.status === 3);
  const hasDisputes = myDisputes.length > 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm text-muted-foreground">Uyuşmazlıklar kontrol ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Anlaşmazlık Merkezi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            İhtilaf durumundaki sözleşmeleriniz ve çözüm süreçleri.
          </p>
        </div>
        <Link href="/contracts">
          <Button variant="outline" className="gap-2 border-border/50">
            <FileText size={16} /> Sözleşmelerime Dön
          </Button>
        </Link>
      </div>

      {!hasDisputes ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 size={30} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Her Şey Yolunda!</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Şu an için aktif bir anlaşmazlığınız bulunmuyor.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {myDisputes.map((contract) => {
            const latestDispute = contract.dispute_history?.[contract.dispute_history.length - 1];
            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="block w-full">
                <Card className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer border border-destructive/30 hover:border-destructive/60 bg-card transition-all">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-destructive/10">
                      <AlertTriangle size={24} className="text-destructive animate-pulse" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{contract.title}</h3>
                        <Badge className="bg-destructive/20 text-destructive border-none">İncelemede</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                        <span>ID: {contract.id.slice(0, 10)}...</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatTimestamp(latestDispute?.timestamp || contract.created_at)}</span>
                      </p>
                      {latestDispute && (
                        <p className="text-sm text-foreground/80 line-clamp-2 bg-secondary/30 p-2 rounded border border-border/50">
                          {latestDispute.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" className="gap-2">
                    Detaylar <ChevronRight size={16} />
                  </Button>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}