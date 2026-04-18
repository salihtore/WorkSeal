"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Download, ExternalLink, Plus, CheckCircle2 } from "lucide-react";

const invoices = [
  { id: "INV-001", contract: "E-ticaret Web Sitesi", client: "Ahmet Yılmaz", clientVerified: true, amount: "12.000", currency: "SUI", status: "paid", date: "12 Ara 2024", txHash: "0xabc123..." },
  { id: "INV-002", contract: "Mobil UI Tasarımı", client: "0x9f8e...7d6c", clientVerified: false, amount: "8.500", currency: "SUI", status: "pending", date: "10 Ara 2024", txHash: null },
  { id: "INV-003", contract: "Logo Tasarımı", client: "Zeynep Kara", clientVerified: true, amount: "3.200", currency: "SUI", status: "paid", date: "5 Ara 2024", txHash: "0xdef456..." },
  { id: "INV-004", contract: "Backend API", client: "0x3d4e...5f6a", clientVerified: false, amount: "15.000", currency: "SUI", status: "draft", date: "1 Ara 2024", txHash: null },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Ödendi", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  pending: { label: "Bekliyor", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  draft: { label: "Taslak", color: "bg-secondary text-muted-foreground border-border" },
};

export default function InvoicesPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 1200);
  };

  const totalEarned = invoices.filter(i => i.status === "paid").reduce((acc, i) => acc + parseFloat(i.amount.replace(".", "")), 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Faturalar</h1>
            <p className="text-sm text-muted-foreground mt-1">{invoices.length} fatura</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus size={16} /> Yeni Fatura
          </Button>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: "Toplam Kazanç", value: `${totalEarned.toLocaleString()} SUI`, color: "text-green-400" },
            { label: "Bekleyen", value: `${invoices.filter(i => i.status === "pending").length} fatura`, color: "text-yellow-400" },
            { label: "Taslak", value: `${invoices.filter(i => i.status === "draft").length} fatura`, color: "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5 bg-card border-border">
              <p className="text-xs text-muted-foreground mb-2">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Fatura listesi */}
        <div className="space-y-3">
          {invoices.map((inv) => {
            const cfg = statusConfig[inv.status];
            return (
              <Card key={inv.id} className="p-5 bg-card border-border hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Receipt size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-muted-foreground">{inv.id}</p>
                        <span className="text-[var(--border)]">·</span>
                        <p className="text-sm font-medium">{inv.contract}</p>
                        <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground">{inv.client}</span>
                        {inv.clientVerified && <CheckCircle2 size={11} className="text-green-400" />}
                        <span className="text-xs text-muted-foreground">· {inv.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-base font-bold">{inv.amount} {inv.currency}</p>
                    {inv.txHash && (
                      <a href={`https://explorer.sui.io/txblock/${inv.txHash}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-border gap-1 text-xs">
                          <ExternalLink size={12} /> Blockchain
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate(inv.id)}
                      disabled={generating === inv.id}
                      className="border-border gap-1 text-xs"
                    >
                      {generating === inv.id
                        ? <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : <><Download size={12} /> İndir</>
                      }
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}