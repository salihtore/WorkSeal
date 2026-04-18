"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, Lock } from "lucide-react";

const escrows = [
  { id: "1", contract: "E-ticaret Web Sitesi", counterparty: "Ahmet Yılmaz", counterpartyVerified: true, amount: "12.000", currency: "SUI", status: "locked", role: "freelancer", date: "12 Kas 2024" },
  { id: "2", contract: "Mobil Uygulama UI", counterparty: "0x9f8e...7d6c", counterpartyVerified: false, amount: "8.500", currency: "SUI", status: "releasing", role: "freelancer", date: "10 Ara 2024" },
  { id: "3", contract: "Logo Tasarımı", counterparty: "Zeynep Kara", counterpartyVerified: true, amount: "3.200", currency: "SUI", status: "released", role: "client", date: "5 Ara 2024" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  locked: { label: "Kilitli", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Lock },
  releasing: { label: "Serbest Bırakılıyor", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  released: { label: "Aktarıldı", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
};

export default function EscrowPage() {
  const [releasing, setReleasing] = useState<string | null>(null);

  const totalLocked = escrows.filter(e => e.status === "locked").reduce((acc, e) => acc + parseFloat(e.amount.replace(".", "")), 0);

  const handleRelease = (id: string) => {
    setReleasing(id);
    setTimeout(() => setReleasing(null), 1500);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Escrow & Ödemeler</h1>
          <p className="text-sm text-muted-foreground mt-1">Tüm escrow işlemlerini buradan yönet</p>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: "Toplam Kilitli", value: `${totalLocked.toLocaleString()} SUI`, icon: Lock, color: "text-blue-400" },
            { label: "Bu Ay Alınan", value: "11.700 SUI", icon: ArrowDownLeft, color: "text-green-400" },
            { label: "Bu Ay Gönderilen", value: "3.200 SUI", icon: ArrowUpRight, color: "text-muted-foreground" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-5 bg-card border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold">{value}</p>
            </Card>
          ))}
        </div>

        {/* Escrow listesi */}
        <div className="space-y-3">
          {escrows.map((e) => {
            const cfg = statusConfig[e.status];
            const Icon = cfg.icon;
            return (
              <Card key={e.id} className="p-5 bg-card border-border hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      e.status === "locked" ? "bg-blue-500/10" :
                      e.status === "releasing" ? "bg-yellow-500/10" : "bg-green-500/10"
                    }`}>
                      <Icon size={18} className={
                        e.status === "locked" ? "text-blue-400" :
                        e.status === "releasing" ? "text-yellow-400" : "text-green-400"
                      } />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{e.contract}</p>
                        <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{e.counterparty}</span>
                        {e.counterpartyVerified && <CheckCircle2 size={11} className="text-green-400" />}
                        <span className="text-xs text-muted-foreground">· {e.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-bold">{e.amount} {e.currency}</p>
                      <p className="text-xs text-muted-foreground">{e.role === "freelancer" ? "Alacak" : "Ödedim"}</p>
                    </div>
                    {e.status === "locked" && e.role === "client" && (
                      <Button
                        size="sm"
                        onClick={() => handleRelease(e.id)}
                        disabled={releasing === e.id}
                        className="bg-primary hover:bg-primary/90 text-white text-xs gap-1"
                      >
                        {releasing === e.id ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle2 size={13} /> Onayla & Serbest Bırak</>
                        )}
                      </Button>
                    )}
                    {e.status === "released" && (
                      <Button variant="outline" size="sm" className="border-border text-xs gap-1">
                        <Shield size={13} /> Detay
                      </Button>
                    )}
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