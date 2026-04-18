"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  Hourglass,
  AlertTriangle,
  Plus,
  Rocket,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { title: "Aktif Sözleşme", value: "0", icon: FileText, color: "text-primary" },
    { title: "Escrow'da Bakiye (SUI)", value: "0.00", icon: ShieldCheck, color: "text-green-500" },
    { title: "Bekleyen Ödeme", value: "0", icon: Hourglass, color: "text-yellow-500" },
    { title: "Açık Anlaşmazlık", value: "0", icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold tracking-tight">Hoş geldin, WorkSeal'er</h1>
          <p className="text-sm text-muted-foreground mt-1">
            İş güvencen parmaklarının ucunda. Sui Testnet üzerinde çalışıyorsun.
          </p>
        </div> */}
        <Link href="/contracts/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all hover:scale-105">
            <Plus size={16} /> Yeni Sözleşme Oluştur
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Modern Glow Effect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-card border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-mono font-bold mt-1 text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Backend bekleniyor...</p>
              </div>
              <div className={`p-3 rounded-xl bg-secondary ${stat.color} group-hover:bg-primary/10 transition-colors`}>
                <stat.icon size={22} strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Son Sözleşmeler - Modern Empty State */}
      <Card className="p-8 bg-card border-border/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Son Sözleşmeler</h2>
          <Button variant="outline" size="sm" className="border-border/50 text-xs">Tümünü Gör</Button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-secondary/20 border border-dashed border-border/50 space-y-5 animate-in fade-in-50 duration-500">
          <div className="p-5 rounded-full bg-primary/10 border border-primary/20 shadow-inner">
            <Rocket size={40} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Henüz bir sözleşme oluşturmadın.</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              İşveren veya freelancer olarak ilk güvenli anlaşmanı saniyeler içinde başlatabilirsin.
            </p>
          </div>
          <Link href="/contracts/new">
            <Button className="gap-2 bg-background border border-primary/30 text-foreground hover:bg-primary/10">
              <Zap size={14} className="text-primary" /> İlk Sözleşmeni Oluştur
            </Button>
          </Link>
        </div>
      </Card>

    </div>
  );
}