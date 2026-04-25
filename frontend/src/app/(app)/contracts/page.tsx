"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, Filter, Inbox, 
  ChevronRight, Clock, CheckCircle2, ShieldAlert, Zap,
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui, formatTimestamp, getStatusLabel, getStatusColor } from "@/types";

export default function ContractsPage() {
  const account = useCurrentAccount();
  const { contracts, loading, fetchAllContracts } = useContracts(account?.address);
  const [search, setSearch] = useState("");

  // Sayfa yüklendiğinde tüm sözleşmeleri çek
  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);
  
  // 1. Arama Filtresi
  const searchedContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Sekme (Tab) Filtreleme Fonksiyonu
  const getFilteredList = (tab: string) => {
    switch(tab) {
      case "active": return searchedContracts.filter(c => c.status === 1);
      case "pending": return searchedContracts.filter(c => c.status === 0);
      case "completed": return searchedContracts.filter(c => c.status === 2);
      default: return searchedContracts;
    }
  };

  const hasContracts = searchedContracts.length > 0;

  const getStatusBadge = (status: number) => {
    return (
      <Badge className={`${getStatusColor(status)} border`}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const ContractList = ({ tab }: { tab: string }) => {
    const list = getFilteredList(tab);
    
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
           <Inbox size={48} className="mb-4 text-muted-foreground/30" />
           <p className="text-sm font-medium">Bu kategoride henüz sözleşme bulunmuyor.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((contract) => (
          <Link key={contract.id} href={`/contracts/${contract.id}`} className="block w-full">
            <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer hover:border-primary/50 transition-all group bg-card border-border/50 relative overflow-hidden">
              <div className="absolute -inset-px bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
              <div className="flex-1 flex gap-4 items-center relative z-10 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <FileText size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{contract.title}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground font-mono">
                    <span>{contract.id.slice(0, 10)}...</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>Müşteri: {contract.client.slice(0, 6)}...{contract.client.slice(-4)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end relative z-10">
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-foreground">{mistToSui(contract.total_budget)} SUI</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                    <Clock size={12} /> {formatTimestamp(contract.created_at)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-muted-foreground">
                  <ChevronRight size={16} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sözleşmeler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Müşterilerle veya freelancerlarla yaptığınız tüm anlaşmaları güvenle yönetin.
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all hover:scale-105">
            <Plus size={16} /> Yeni Sözleşme
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-sm text-muted-foreground">Sözleşmeleriniz yükleniyor...</p>
        </Card>
      ) : !hasContracts ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center animate-in fade-in-50 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all"></div>
            <FileText size={30} className="text-primary relative z-10" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Henüz sözleşme yok veya arama sonucu bulunamadı</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Freelance işlerini güvence altına almak için ilk akıllı sözleşmeni saniyeler içinde oluştur.
          </p>
          <Link href="/contracts/new">
            <Button className="bg-background border border-primary/30 hover:bg-primary/10 text-foreground gap-2">
              <Plus size={16} className="text-primary" /> İlk Sözleşmeni Başlat
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="all" className="w-full flex flex-col space-y-8">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
              <TabsList className="bg-secondary/30 border border-border/40 p-1 h-auto flex-wrap justify-start w-full xl:w-auto min-h-[52px]">
                <TabsTrigger 
                  value="all" 
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <Inbox size={16} /> Tümü
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <Zap size={16} className="text-yellow-500" /> Aktif
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <Clock size={16} className="text-blue-500" /> Onay Bekleyen
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <CheckCircle2 size={16} className="text-green-500" /> Tamamlananlar
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full xl:w-80 group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="ID veya Başlık ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 bg-card/50 border-border/50 focus-visible:ring-primary/40 text-sm h-12 rounded-2xl relative z-10 shadow-sm w-full"
                />
              </div>
            </div>

            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TabsContent value="all" className="mt-0 focus-visible:outline-none w-full"><ContractList tab="all" /></TabsContent>
              <TabsContent value="active" className="mt-0 focus-visible:outline-none w-full"><ContractList tab="active" /></TabsContent>
              <TabsContent value="pending" className="mt-0 focus-visible:outline-none w-full"><ContractList tab="pending" /></TabsContent>
              <TabsContent value="completed" className="mt-0 focus-visible:outline-none w-full"><ContractList tab="completed" /></TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}