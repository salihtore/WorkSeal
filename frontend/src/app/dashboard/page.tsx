"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Aktif Sözleşme",
    value: "4",
    icon: FileText,
    change: "+2 bu ay",
    positive: true,
  },
  {
    label: "Escrow'daki Tutar",
    value: "₺18.500",
    icon: Shield,
    change: "3 işlemde",
    positive: true,
  },
  {
    label: "Bekleyen Ödeme",
    value: "₺7.200",
    icon: TrendingUp,
    change: "2 teslimatta",
    positive: true,
  },
  {
    label: "Açık Anlaşmazlık",
    value: "1",
    icon: AlertTriangle,
    change: "Çözüm bekliyor",
    positive: false,
  },
];

const recentContracts = [
  {
    id: "1",
    title: "E-ticaret Web Sitesi",
    client: "0x1a2b...3c4d",
    clientVerified: true,
    amount: "₺12.000",
    status: "active",
    date: "12 Ara 2024",
  },
  {
    id: "2",
    title: "Mobil Uygulama UI Tasarımı",
    client: "Ahmet Yılmaz",
    clientVerified: true,
    amount: "₺8.500",
    status: "pending",
    date: "10 Ara 2024",
  },
  {
    id: "3",
    title: "Logo & Kurumsal Kimlik",
    client: "0x9f8e...7d6c",
    clientVerified: false,
    amount: "₺3.200",
    status: "completed",
    date: "5 Ara 2024",
  },
  {
    id: "4",
    title: "SEO & İçerik Yazarlığı",
    client: "Zeynep Kara",
    clientVerified: true,
    amount: "₺4.800",
    status: "disputed",
    date: "1 Ara 2024",
  },
];

const recentActivity = [
  {
    type: "payment",
    text: "E-ticaret projesi için escrow ödeme alındı",
    time: "2 saat önce",
    icon: Shield,
    color: "text-green-500",
  },
  {
    type: "contract",
    text: "Mobil UI sözleşmesi imzalandı",
    time: "5 saat önce",
    icon: FileText,
    color: "text-primary",
  },
  {
    type: "dispute",
    text: "SEO projesi için anlaşmazlık açıldı",
    time: "1 gün önce",
    icon: AlertTriangle,
    color: "text-yellow-500",
  },
  {
    type: "completed",
    text: "Logo projesi tamamlandı ve ödeme aktarıldı",
    time: "3 gün önce",
    icon: CheckCircle2,
    color: "text-green-500",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktif", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  pending: { label: "Bekliyor", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  completed: { label: "Tamamlandı", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  disputed: { label: "Anlaşmazlık", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function DashboardPage() {
  const [walletAddress] = useState("0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <Wallet size={13} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </span>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs hover:bg-green-500/10">
                Bağlı
              </Badge>
            </div>
          </div>
          <Link href="/contracts/new">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus size={16} />
              Yeni Sözleşme
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon, change, positive }) => (
            <Card
              key={label}
              className="p-5 bg-card border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <Icon size={18} className="text-primary" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    positive ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Son Sözleşmeler */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Son Sözleşmeler</h2>
              <Link href="/contracts">
                <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                  Tümünü Gör <ArrowUpRight size={13} />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentContracts.map((contract) => (
                <Link key={contract.id} href={`/contracts/${contract.id}`}>
                  <Card className="p-4 bg-card border-border hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{contract.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">
                              {contract.client}
                            </span>
                            {contract.clientVerified && (
                              <CheckCircle2 size={11} className="text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{contract.amount}</p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <span className="text-xs text-muted-foreground">{contract.date}</span>
                          <Badge className={`text-xs border ${statusConfig[contract.status].color} hover:${statusConfig[contract.status].color}`}>
                            {statusConfig[contract.status].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Son Aktiviteler</h2>
            </div>
            <Card className="bg-card border-border p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <activity.icon size={14} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">{activity.text}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Hızlı Erişim */}
            <div className="mt-5">
              <h2 className="font-semibold mb-3">Hızlı Erişim</h2>
              <div className="space-y-2">
                {[
                  { href: "/contracts/new", label: "Yeni Sözleşme Oluştur", icon: FileText },
                  { href: "/escrow", label: "Escrow Yönetimi", icon: Shield },
                  { href: "/disputes", label: "Anlaşmazlıklarım", icon: AlertTriangle },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-border bg-card hover:bg-secondary hover:border-primary/30 text-sm"
                    >
                      <Icon size={15} className="text-primary" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}