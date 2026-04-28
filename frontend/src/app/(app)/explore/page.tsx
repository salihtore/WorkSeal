"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, Briefcase } from "lucide-react";
import Link from "next/link";
import { useContracts } from "@/hooks/useContracts";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { mistToSui } from "@/types";

const TABS = ["En Yeniler", "Yüksek Bütçeli", "Düşük Bütçeli"];

export default function ExplorePage() {
  const account = useCurrentAccount();
  const { contracts, loading } = useContracts(account?.address);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("En Yeniler");

  const openJobs = useMemo(() => {
    const filtered = contracts
      .filter(c =>
        !c.freelancer ||
        c.freelancer === "0x0000000000000000000000000000000000000000000000000000000000000000"
      )
      .filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      );

    if (activeTab === "En Yeniler") {
      return filtered.sort((a, b) => b.created_at - a.created_at);
    } else if (activeTab === "Yüksek Bütçeli") {
      return filtered.sort((a, b) => {
        const diff = BigInt(b.total_budget) - BigInt(a.total_budget);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });
    } else if (activeTab === "Düşük Bütçeli") {
      return filtered.sort((a, b) => {
        const diff = BigInt(a.total_budget) - BigInt(b.total_budget);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });
    }
    
    return filtered;
  }, [contracts, search, activeTab]);

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
        <div className="border-b border-border px-10 pt-14 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400/70 tracking-widest uppercase">
              {loading ? "Bağlanıyor..." : `${openJobs.length} açık iş · Canlı`}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Açık{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #F0F6FF 0%, rgba(240,246,255,0.3) 100%)" }}
            >
              İşler
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg">
            Sui ağında escrow güvencesiyle yayınlanan, freelancer bekleyen iş ilanları.
          </p>
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
                placeholder="Başlık veya ID ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 bg-card border-border text-sm font-mono"
              />
            </div>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="animate-spin text-[#4FC3F7]" size={28} />
              <p className="font-mono text-xs text-muted-foreground tracking-widest">BLOCKCHAIN SENKRONIZE EDİLİYOR</p>
            </div>
          ) : openJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
              {openJobs.map(job => (
                <Link key={job.id} href={`/contracts/${job.id}`}>
                  <div className="bg-background p-8 group hover:bg-white/[0.025] transition-all cursor-pointer h-full flex flex-col min-h-[220px]">
                    {/* Budget */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-2xl font-bold text-[#4FC3F7]">
                        {mistToSui(job.total_budget)}
                        <span className="text-sm text-[#4FC3F7]/50 ml-1">SUI</span>
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-muted-foreground group-hover:text-[#4FC3F7] group-hover:translate-x-1 transition-all"
                      />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-[#4FC3F7] transition-colors mb-2 line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {job.description || "Bu iş için henüz açıklama girilmemiş."}
                    </p>

                    {/* Client */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {job.client.slice(0, 10)}...{job.client.slice(-6)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <span className="text-8xl font-black text-border mb-6">·</span>
              <p className="text-muted-foreground text-sm font-mono">Henüz açık iş ilanı yok.</p>
              <Link href="/contracts/new" className="mt-8">
                <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90">
                  İlk İlanı Sen Ver
                </Button>
              </Link>
            </div>
          )}
        </div>
    </div>
  );
}