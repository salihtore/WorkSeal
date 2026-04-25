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
  Zap,
  Loader2 // EKLENEN: Yükleme ikonu
} from "lucide-react";
import Link from "next/link";

// EKLENEN: Blockchain bağlantıları için gerekli hook ve tipler
import { useEffect, useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useContracts } from "@/hooks/useContracts";
import { useRouter } from "next/navigation";
import { mistToSui, getStatusLabel, getStatusColor } from "@/types";

export default function DashboardPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { contracts, loading, isArbitrator, fetchAllContracts } = useContracts(account?.address);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  // HAKEM İZOLASYONU: Hakem ise ana dashboard'u görmesin, portalına gitsin
  useEffect(() => {
    if (isArbitrator && !loading) {
      router.push("/arbitrator");
    }
  }, [isArbitrator, loading, router]);

  // DEĞİŞTİRİLEN: Sadece sizin olanları değil, freelancer bekleyen tüm açık işleri de göster
  const visibleContracts = useMemo(() => {
    if (!account) return contracts;
    return contracts.filter(
      (c) => 
        c.client === account.address || 
        c.freelancer === account.address || 
        !c.freelancer // Freelancer atanmamış (Açık İşler)
    );
  }, [contracts, account]);

  // Sadece size ait olanlar (İstatistikler için)
  const myContracts = useMemo(() => {
    if (!account) return [];
    return contracts.filter(
      (c) => c.client === account.address || c.freelancer === account.address
    );
  }, [contracts, account]);

  // EKLENEN: İstatistikleri hesapla
  const activeContractsCount = myContracts.filter(c => c.status === 1).length;
  const disputedContractsCount = myContracts.filter(c => c.status === 3).length;
  
  // Sadece aktif (status === 1) sözleşmelerin toplam MIST bütçesini toplayıp SUI'ye çeviriyoruz
  const totalEscrowMist = myContracts
    .filter(c => c.status === 1)
    .reduce((acc, c) => acc + BigInt(c.total_budget), 0n);
  
  const pendingPaymentMist = myContracts
    .filter(c => c.status === 0) // Henüz fonlanmamış (Bekleyen)
    .reduce((acc, c) => acc + BigInt(c.total_budget), 0n);

  // DEĞİŞTİRİLEN: Statik veriler yerine yukarıda hesapladığımız dinamik verileri koyduk
  const stats = [
    { title: "Aktif Sözleşme", value: activeContractsCount.toString(), icon: FileText, color: "text-primary" },
    { title: "Escrow'da Bakiye (SUI)", value: mistToSui(totalEscrowMist), icon: ShieldCheck, color: "text-green-500" },
    { title: "Bekleyen Ödeme (SUI)", value: mistToSui(pendingPaymentMist), icon: Hourglass, color: "text-yellow-500" },
    { title: "Açık Anlaşmazlık", value: disputedContractsCount.toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
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
                {/* DEĞİŞTİRİLEN: Değerleri dinamik yaptık */}
                <p className="text-3xl font-mono font-bold mt-1 text-foreground">{stat.value}</p>
                {/* DEĞİŞTİRİLEN: Backend bekleniyor yazısını duruma göre güncelledik */}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {loading ? "Ağdan güncelleniyor..." : "Sui Ağı Güncel Verisi"}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-secondary ${stat.color} group-hover:bg-primary/10 transition-colors`}>
                <stat.icon size={22} strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Son Sözleşmeler - Modern Empty State */}
      <Card className="p-8 bg-card border-border/50 min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Son Sözleşmeler</h2>
          <Button variant="outline" size="sm" className="border-border/50 text-xs">Tümünü Gör</Button>
        </div>

        {/* EKLENEN/DEĞİŞTİRİLEN: Cüzdan bağlı değilse, Yükleniyorsa, Veri Varsa ve Veri Yoksa durumları */}
        {!account ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck size={48} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
              Sözleşmelerinizi görüntüleyebilmek için lütfen sağ üst köşeden Web3 cüzdanınızı bağlayın.
            </p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center opacity-60">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-sm text-muted-foreground">Blockchain'den verileriniz çekiliyor...</p>
          </div>
        ) : visibleContracts.length > 0 ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {visibleContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-5 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-background border border-border group-hover:bg-primary/10 transition-colors">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{contract.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {contract.client === account?.address ? (
                        <span className="text-primary font-medium">Sizin Oluşturduğunuz (Müşteri)</span>
                      ) : contract.freelancer === account?.address ? (
                        <span className="text-green-500 font-medium">Sizin Üstlendiğiniz (Freelancer)</span>
                      ) : (
                        <span className="text-yellow-500 font-medium">Açık İş (Freelancer Bekleniyor)</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{mistToSui(contract.total_budget)} SUI</p>
                    <p className="text-[10px] text-muted-foreground">Toplam Bütçe</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </div>
                  <Link href={`/contracts/${contract.id}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Detaylar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Senin Kusursuz Boş Durum (Empty State) Tasarımın */
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-secondary/20 border border-dashed border-border/50 space-y-5 animate-in fade-in-50 duration-500">
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
        )}
      </Card>
    </div>
  );
}