"use client";

import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowDownLeft, ArrowUpRight, Inbox, Plus } from "lucide-react";
import Link from "next/link";

export default function EscrowPage() {
  const escrows: never[] = [];
  const loading = false;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Escrow & Odemeler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm escrow islemlerini buradan yönet
          </p>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: "Toplam Kilitli", value: "—", icon: Shield, color: "text-blue-400" },
            { label: "Bu Ay Alınan", value: "—", icon: ArrowDownLeft, color: "text-green-400" },
            { label: "Bu Ay Gönderilen", value: "—", icon: ArrowUpRight, color: "text-muted-foreground" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-5 bg-card border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Backend bekleniyor</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : escrows.length === 0 ? (
          <Card className="p-16 bg-card border-border flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
              <Shield size={26} className="text-primary" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              Henüz escrow islemi yok
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Bir sozlesme olusturup ödeme kilitlediginde burada görünecek.
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