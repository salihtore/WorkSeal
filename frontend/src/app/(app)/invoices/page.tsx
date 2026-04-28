"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Search, Download, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui, formatTimestamp } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function InvoicesPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);
  
  const invoices = useMemo(() => {
    return contracts.flatMap(c => 
      c.milestones.filter(m => m.is_paid).map((m, idx) => ({
        id: `WSL-${c.id.slice(0, 4)}-${idx + 1}`.toUpperCase(),
        contractId: c.id,
        contractTitle: `${c.title} - ${m.title}`,
        date: formatTimestamp(c.created_at),
        amount: `${mistToSui(m.amount)} SUI`,
        status: "paid"
      }))
    ).filter(inv => inv.id.includes(search.toUpperCase()) || inv.contractTitle.toLowerCase().includes(search.toLowerCase()));
  }, [contracts, search]);

  const handleDownload = (id: string) => {
    alert(`${id} faturası PDF olarak indiriliyor...`);
  };

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="border-b border-border px-10 pt-10 pb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">
            ÖDEME KANITLARI
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none text-foreground">
            Faturalar
          </h1>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* ── Filter Bar ── */}
        <div className="flex items-center justify-between mb-10">
          <p className="text-sm text-muted-foreground font-mono">
            Tamamlanan sözleşmelerinize ait makbuzlar blokzincirinde kayıtlıdır.
          </p>

          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Fatura No ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card border-border text-sm font-mono focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#4FC3F7]" size={28} />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">KAYITLAR YÜKLENİYOR</p>
          </div>
        ) : invoices.length > 0 ? (
          <div className="border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-[10px] text-muted-foreground uppercase bg-white/[0.02] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Fatura No</th>
                    <th className="px-6 py-4 font-medium">İlgili Sözleşme</th>
                    <th className="px-6 py-4 font-medium">Tarih</th>
                    <th className="px-6 py-4 font-medium text-right">Tutar</th>
                    <th className="px-6 py-4 font-medium text-center">Durum</th>
                    <th className="px-6 py-4 font-medium text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 flex items-center gap-2">
                        <Receipt size={16} className="text-muted-foreground group-hover:text-[#4FC3F7] transition-colors" />
                        <span className="font-bold">{inv.id}</span>
                        <button 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[#4FC3F7]" 
                          onClick={() => {navigator.clipboard.writeText(inv.id); alert('Kopyalandı!');}}
                        >
                          <Copy size={12} />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-xs text-muted-foreground">{inv.contractTitle}</td>
                      <td className="px-6 py-5 text-xs text-muted-foreground">{inv.date}</td>
                      <td className="px-6 py-5 font-bold text-foreground text-right">{inv.amount}</td>
                      <td className="px-6 py-5 text-center">
                        {inv.status === "paid" && (
                          <span className="text-[10px] px-2 py-1 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 uppercase tracking-wider">
                            Ödendi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(inv.id)}
                          className="gap-2 text-[#4FC3F7] hover:bg-[#4FC3F7]/10 hover:text-[#4FC3F7] font-mono text-xs uppercase tracking-widest rounded-none border border-transparent hover:border-[#4FC3F7]/30 transition-all h-8"
                        >
                          <Download size={14} /> İndir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border border-border bg-card">
            <span className="text-8xl font-black text-border mb-6">·</span>
            <p className="text-muted-foreground text-sm font-mono mb-8">Henüz fatura oluşturulmamış.</p>
          </div>
        )}
      </div>
    </div>
  );
}