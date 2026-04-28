"use client";

import { useMemo, useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useContracts } from "@/hooks/useContracts";
import { useRouter } from "next/navigation";
import { mistToSui, getStatusLabel, getStatusColor } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Loader2, FileText, Zap, ShieldCheck, AlertTriangle } from "lucide-react";

const TABS = ["Genel Bakış", "Pazar Yeri", "Sözleşmelerim"];

export default function DashboardPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { contracts, loading, isArbitrator } = useContracts(account?.address);
  const [activeTab, setActiveTab] = useState("Genel Bakış");

  useEffect(() => {
    if (isArbitrator && !loading) {
      router.push("/arbitrator");
    }
  }, [isArbitrator, loading, router]);

  const myContracts = useMemo(() => {
    if (!account) return [];
    return contracts.filter(
      c => c.client === account.address || c.freelancer === account.address
    );
  }, [contracts, account]);

  const openJobs = useMemo(() => {
    return contracts.filter(
      c => !c.freelancer ||
        c.freelancer === "0x0000000000000000000000000000000000000000000000000000000000000000"
    ).slice(0, 6);
  }, [contracts]);

  const stats = useMemo(() => {
    const active = myContracts.filter(c => c.status === 1).length;
    const disputed = myContracts.filter(c => c.status === 3).length;
    const escrow = myContracts
      .filter(c => c.status === 1)
      .reduce((acc, c) => acc + BigInt(c.total_budget), 0n);
    return { active, disputed, escrow: mistToSui(escrow) };
  }, [myContracts]);

  return (
    <div className="max-w-6xl mx-auto px-2 py-10 space-y-0">

      {/* ── Page Header ── */}
      <div className="pb-10 border-b border-border flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-[#4FC3F7]/60 tracking-widest uppercase mb-3">
            Sui Testnet · {account?.address.slice(0, 8)}...{account?.address.slice(-4)}
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Dashboard
          </h1>
        </div>
        <Link href="/contracts/new">
          <Button className="h-10 px-6 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90 gap-2">
            <Plus size={16} /> Yeni Sözleşme
          </Button>
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 border-b border-border mb-10">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#4FC3F7] text-[#4FC3F7]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── GENEL BAKIŞ ── */}
      {activeTab === "Genel Bakış" && (
        <div className="space-y-0">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border mb-px">
            {[
              { label: "Aktif İş", value: stats.active.toString(), icon: Zap, accent: true },
              { label: "Escrow (SUI)", value: stats.escrow, icon: ShieldCheck, accent: false },
              { label: "Anlaşmazlık", value: stats.disputed.toString(), icon: AlertTriangle, accent: false },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className="bg-card p-8 group hover:bg-white/[0.02] transition-colors">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">{label}</p>
                <p className={`text-4xl font-black font-mono ${accent ? "text-[#4FC3F7]" : "text-foreground"}`}>
                  {loading ? <span className="animate-pulse opacity-30">—</span> : value}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Contracts */}
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Son İşlemlerim</p>
              <button
                onClick={() => setActiveTab("Sözleşmelerim")}
                className="font-mono text-[10px] text-[#4FC3F7] hover:opacity-70 transition-opacity flex items-center gap-1"
              >
                Tümü <ArrowRight size={10} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="animate-spin text-[#4FC3F7]/40" />
                </div>
              ) : myContracts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-mono text-xs text-muted-foreground">Henüz işlem yok.</p>
                  <Link href="/contracts/new">
                    <Button className="mt-6 h-9 px-6 bg-[#4FC3F7] text-[#050810] font-bold text-xs">
                      İlk Sözleşmeni Oluştur
                    </Button>
                  </Link>
                </div>
              ) : (
                myContracts.slice(0, 4).map(c => (
                  <Link key={c.id} href={`/contracts/${c.id}`}>
                    <div className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.025] transition-colors group">
                      <div>
                        <p className="font-medium text-sm group-hover:text-[#4FC3F7] transition-colors">{c.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">{c.id.slice(0, 14)}...</p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <p className="font-mono text-sm font-bold text-[#4FC3F7]">{mistToSui(c.total_budget)} SUI</p>
                        <span className={`font-mono text-[10px] px-2 py-1 ${getStatusColor(c.status)}`}>
                          {getStatusLabel(c.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PAZAR YERİ ── */}
      {activeTab === "Pazar Yeri" && (
        <div className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {loading ? (
              <div className="col-span-full py-20 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-[#4FC3F7]/40" />
              </div>
            ) : openJobs.length === 0 ? (
              <div className="col-span-full bg-card py-20 text-center">
                <p className="font-mono text-xs text-muted-foreground">Açık iş bulunamadı.</p>
              </div>
            ) : (
              openJobs.map(job => (
                <Link key={job.id} href={`/contracts/${job.id}`}>
                  <div className="bg-card p-8 group hover:bg-white/[0.03] transition-all cursor-pointer h-full flex flex-col min-h-[200px]">
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-xl font-bold text-[#4FC3F7]">
                        {mistToSui(job.total_budget)}
                        <span className="text-xs text-[#4FC3F7]/50 ml-1">SUI</span>
                      </span>
                      <ArrowRight size={14} className="text-muted-foreground group-hover:text-[#4FC3F7] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="font-bold text-sm group-hover:text-[#4FC3F7] transition-colors line-clamp-1 mb-2">{job.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                      {job.description || "Açıklama belirtilmemiş."}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-4 pt-4 border-t border-border">
                      {job.client.slice(0, 8)}...
                    </p>
                  </div>
                </Link>
              ))
            )}
            {/* "Daha Fazla" tile */}
            <Link href="/explore">
              <div className="bg-card p-8 hover:bg-white/[0.03] transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-border">
                <p className="font-mono text-xs text-muted-foreground">Tüm ilanları gör</p>
                <ArrowRight size={16} className="text-muted-foreground mt-2" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── SÖZLEŞMELERİM ── */}
      {activeTab === "Sözleşmelerim" && (
        <div className="border border-border bg-card divide-y divide-border">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#4FC3F7]/40" />
            </div>
          ) : myContracts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-mono text-xs text-muted-foreground mb-6">Henüz sözleşme yok.</p>
              <Link href="/contracts/new">
                <Button className="h-10 px-8 bg-[#4FC3F7] text-[#050810] font-bold text-sm">
                  İlk Sözleşmeni Oluştur
                </Button>
              </Link>
            </div>
          ) : (
            myContracts.map(c => (
              <Link key={c.id} href={`/contracts/${c.id}`}>
                <div className="flex items-center justify-between px-8 py-6 hover:bg-white/[0.025] transition-colors group">
                  <div>
                    <p className="font-medium group-hover:text-[#4FC3F7] transition-colors">{c.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">{c.id.slice(0, 18)}...</p>
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
            ))
          )}
        </div>
      )}
    </div>
  );
}