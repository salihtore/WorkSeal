"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const contracts = [
  { id: "1", title: "E-ticaret Web Sitesi", client: "0x1a2b...3c4d", clientVerified: true, amount: "₺12.000", status: "active", date: "12 Ara 2024", type: "freelancer" },
  { id: "2", title: "Mobil Uygulama UI Tasarımı", client: "Ahmet Yılmaz", clientVerified: true, amount: "₺8.500", status: "pending", date: "10 Ara 2024", type: "freelancer" },
  { id: "3", title: "Logo & Kurumsal Kimlik", client: "0x9f8e...7d6c", clientVerified: false, amount: "₺3.200", status: "completed", date: "5 Ara 2024", type: "client" },
  { id: "4", title: "SEO & İçerik Yazarlığı", client: "Zeynep Kara", clientVerified: true, amount: "₺4.800", status: "disputed", date: "1 Ara 2024", type: "client" },
  { id: "5", title: "Backend API Geliştirme", client: "0x3d4e...5f6a", clientVerified: false, amount: "₺15.000", status: "active", date: "28 Kas 2024", type: "freelancer" },
  { id: "6", title: "Sosyal Medya Yönetimi", client: "Mehmet Demir", clientVerified: true, amount: "₺2.400", status: "completed", date: "20 Kas 2024", type: "client" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktif", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  pending: { label: "Bekliyor", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  completed: { label: "Tamamlandı", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  disputed: { label: "Anlaşmazlık", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const filters = ["Tümü", "Aktif", "Bekliyor", "Tamamlandı", "Anlaşmazlık"];

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tümü");

  const filtered = contracts.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "Tümü" || statusConfig[c.status].label === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Sözleşmeler</h1>
            <p className="text-sm text-muted-foreground mt-1">{contracts.length} sözleşme</p>
          </div>
          <Link href="/contracts/new">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus size={16} /> Yeni Sözleşme
            </Button>
          </Link>
        </div>

        {/* Arama & Filtre */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Sözleşme veya müşteri ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-muted-foreground" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? "bg-primary text-white"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sözleşme bulunamadı</p>
            </div>
          ) : (
            filtered.map((contract) => (
              <Link key={contract.id} href={`/contracts/${contract.id}`}>
                <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{contract.title}</p>
                          <Badge className={`text-xs border ${statusConfig[contract.status].color}`}>
                            {statusConfig[contract.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-muted-foreground font-mono">{contract.client}</span>
                          {contract.clientVerified && <CheckCircle2 size={11} className="text-green-400" />}
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{contract.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-base font-bold">{contract.amount}</p>
                      <ArrowUpRight size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}