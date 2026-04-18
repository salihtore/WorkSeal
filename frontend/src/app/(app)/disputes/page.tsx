"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ChevronRight, FileText, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";

const mockDisputes: any[] = [];

export default function DisputesPage() {
  const hasDisputes = mockDisputes.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Anlaşmazlık Merkezi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            İhtilaf durumundaki sözleşmeler çözümlenene kadar kilitli tutulur.
          </p>
        </div>
        <Link href="/contracts">
          <Button variant="outline" className="gap-2 border-border/50 text-foreground hover:bg-secondary">
            <FileText size={16} /> Sözleşmelere Dön
          </Button>
        </Link>
      </div>

      {!hasDisputes ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl transition-all"></div>
            <CheckCircle2 size={30} className="text-green-500 relative z-10" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Her Şey Yolunda!</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Aktif veya çözülemeyen hiçbir anlaşmazlığın bulunmuyor. Escrow ödemelerin güvende.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockDisputes.map((dispute) => (
            <Link key={dispute.id} href={`/disputes/${dispute.id}`} className="block w-full">
              <Card className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer border relative overflow-hidden group transition-all ${
                dispute.status === "open" 
                  ? "bg-card border-destructive/30 hover:border-destructive/60" 
                  : "bg-background border-border/40 hover:border-primary/30"
              }`}>
                
                {/* Glow effect for open disputes */}
                {dispute.status === "open" && (
                  <div className="absolute -inset-px bg-gradient-to-r from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                )}

                <div className="flex gap-4 items-start relative z-10 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    dispute.status === "open" ? "bg-destructive/10" : "bg-secondary"
                  }`}>
                    {dispute.status === "open" ? (
                      <AlertTriangle size={24} className="text-destructive animate-pulse" />
                    ) : (
                      <CheckCircle2 size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{dispute.contractTitle}</h3>
                      {dispute.status === "open" ? (
                        <Badge className="bg-destructive/20 text-destructive border-none">Açık Anlaşmazlık</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Çözüldü</Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Ref: {dispute.id}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span>Sözleşme: {dispute.contractId}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {dispute.date}</span>
                    </p>
                    
                    <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed max-w-2xl bg-secondary/30 p-2 rounded border border-border/50">
                      <span className="font-medium text-foreground mr-1">İtiraz Nedeni ({dispute.raisedBy}):</span> 
                      {dispute.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center self-end md:self-auto relative z-10 shrink-0">
                  <Button variant="ghost" className="gap-2 text-muted-foreground group-hover:text-foreground">
                    Detayları Gör <ChevronRight size={16} />
                  </Button>
                </div>

              </Card>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}