"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Inbox, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function InvoicesPage() {
  const invoices: never[] = [];
  const loading = false;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Faturalar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {invoices.length > 0 ? `${invoices.length} fatura` : "Henüz fatura yok"}
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus size={16} /> Yeni Fatura
          </Button>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: "Toplam Kazanc", value: "—", color: "text-green-400" },
            { label: "Bekleyen", value: "—", color: "text-yellow-400" },
            { label: "Taslak", value: "—", color: "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5 bg-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className={color} />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Backend bekleniyor</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <Card className="p-16 bg-card border-border flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
              <Receipt size={26} className="text-primary" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              Henüz fatura yok
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Tamamlanan sozlesmeler icin otomatik fatura olusturulur.
            </p>
            <Link href="/contracts/new">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus size={15} /> Sozlesme Olustur
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Backend gelince burası dolacak */}
          </div>
        )}

      </main>
    </div>
  );
}