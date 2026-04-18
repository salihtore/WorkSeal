"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, Search, Filter, Inbox, ChevronRight, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

const mockContracts: any[] = [];

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const hasContracts = mockContracts.length > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"><Clock size={12} className="mr-1" /> Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"><Clock size={12} className="mr-1" /> Bekliyor</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"><CheckCircle2 size={12} className="mr-1" /> Tamamlandı</Badge>;
      case "dispute":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><ShieldAlert size={12} className="mr-1" /> İhtilaf</Badge>;
      default:
        return <Badge variant="outline">Bilinmeyen</Badge>;
    }
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

      {!hasContracts ? (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center animate-in fade-in-50 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all"></div>
            <FileText size={30} className="text-primary relative z-10" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Henüz sözleşme yok</h3>
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
          <Tabs defaultValue="all" className="w-full flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <TabsList className="bg-secondary/50 border border-border/50">
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value="active">Aktif</TabsTrigger>
                <TabsTrigger value="pending">Onay Bekleyen</TabsTrigger>
                <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sözleşme ID veya İsim ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50 text-sm h-10"
                />
              </div>
            </div>

            <TabsContent value="all" className="mt-0 space-y-4">
              {mockContracts.map((contract) => (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="block w-full">
                   <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer hover:border-primary/50 transition-all group bg-card border-border/50 relative overflow-hidden">
                     {/* Arka plan glow efekti on hover */}
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
                            <span>{contract.id}</span>
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            <span>Müşteri: {contract.client}</span>
                          </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end relative z-10">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-foreground">{contract.budget} SUI</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                             <Clock size={12} /> {contract.date}
                          </p>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-muted-foreground">
                          <ChevronRight size={16} />
                        </div>
                     </div>
                   </Card>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}