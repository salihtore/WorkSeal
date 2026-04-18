"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Search, Download, CheckCircle2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockInvoices: any[] = [];

export default function InvoicesPage() {

  const handleDownload = (id: string) => {
    // Simüle eylemi
    alert(`${id} faturası PDF olarak indiriliyor... (Mock)`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Faturalar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tamamlanan sözleşmelerinize ait makbuzlar ve faturalar. Her işlem blokzincirinde kayıtlıdır.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Fatura ID ara..."
              className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50 text-sm h-10"
            />
          </div>
        </div>
      </div>

      {mockInvoices.length > 0 ? (
        <Card className="bg-card border-border/50 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/40 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Fatura No</th>
                  <th className="px-6 py-4 font-medium">İlgili Sözleşme</th>
                  <th className="px-6 py-4 font-medium">Tarih</th>
                  <th className="px-6 py-4 font-medium">Tutar</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-5 flex items-center gap-2">
                      <Receipt size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-mono font-medium">{inv.id}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <Copy size={12} />
                      </button>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">{inv.contract}</td>
                    <td className="px-6 py-5 text-muted-foreground">{inv.date}</td>
                    <td className="px-6 py-5 font-mono font-bold">{inv.amount}</td>
                    <td className="px-6 py-5">
                      {inv.status === "paid" && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 font-medium py-1">
                          <CheckCircle2 size={12} /> Ödendi
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(inv.id)}
                        className="gap-2 text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Download size={14} /> PDF İndir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-16 bg-card border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <Receipt size={30} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Henüz fatura oluşturulmamış</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
            Tamamlanan sözleşmelerinize ait makbuzlar ve faturalar burada listelenecektir.
          </p>
        </Card>
      )}
      
    </div>
  );
}