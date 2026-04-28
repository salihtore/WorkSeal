"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui, getStatusLabel, getStatusColor } from "@/types";

const TABS = ["Tümü", "Aktif", "Onay Bekleyen", "Tamamlananlar"];

export default function ContractsPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Tümü");

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  const searchedContracts = useMemo(() => {
    return contracts.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [contracts, search]);

  const filteredContracts = useMemo(() => {
    switch(activeTab) {
      case "Aktif": return searchedContracts.filter(c => c.status === 1);
      case "Onay Bekleyen": return searchedContracts.filter(c => c.status === 0);
      case "Tamamlananlar": return searchedContracts.filter(c => c.status === 2);
      default: return searchedContracts;
    }
  }, [searchedContracts, activeTab]);

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="border-b border-border px-10 pt-10 pb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">
            SÖZLEŞME YÖNETİMİ
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Sözleşmelerim
          </h1>
        </div>
        <Link href="/contracts/new">
          <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90">
            Yeni Sözleşme
          </Button>
        </Link>
      </div>

      <div className="px-10 py-8">
        {/* ── Filter Bar ── */}
        <div className="flex items-center justify-between mb-10">
          {/* Tabs */}
          <div className="flex items-center gap-0 border border-border">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-medium transition-all border-r border-border last:border-r-0 ${
                  activeTab === tab
                    ? "bg-[#4FC3F7] text-[#050810] font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ID veya Başlık ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card border-border text-sm font-mono focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
            />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#4FC3F7]" size={28} />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">VERİLER YÜKLENİYOR</p>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="border border-border bg-card divide-y divide-border">
            {filteredContracts.map(c => (
              <Link key={c.id} href={`/contracts/${c.id}`}>
                <div className="flex items-center justify-between px-8 py-6 hover:bg-white/[0.025] transition-colors group">
                  <div>
                    <p className="font-medium group-hover:text-[#4FC3F7] transition-colors">{c.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="font-mono text-[10px] text-muted-foreground">{c.id.slice(0, 18)}...</p>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {c.client === account?.address ? "Benim İlanım" : "Müşteri: " + c.client.slice(0, 6) + "..."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="font-mono font-bold text-[#4FC3F7]">{mistToSui(c.total_budget)} SUI</p>
                    <span className={`font-mono text-[10px] px-2 py-1 ${getStatusColor(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-[#4FC3F7] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border border-border bg-card">
            <span className="text-8xl font-black text-border mb-6">·</span>
            <p className="text-muted-foreground text-sm font-mono mb-8">Sözleşme bulunamadı.</p>
            <Link href="/contracts/new">
              <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90">
                İlk Sözleşmeni Oluştur
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}