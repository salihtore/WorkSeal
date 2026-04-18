"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Filter, Inbox } from "lucide-react";
import Link from "next/link";

const filters = ["Tümü", "Aktif", "Bekliyor", "Tamamlandı", "Anlasmazlık"];

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tümü");

  // Backend hazır olunca buraya fetch gelecek
  const contracts: never[] = [];
  const loading = false;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sozlesmeler</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {contracts.length > 0 ? `${contracts.length} sozlesme` : "Henüz sozlesme yok"}
            </p>
          </div>
          <Link href="/contracts/new">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus size={16} /> Yeni Sozlesme
            </Button>
          </Link>
        </div>

        {/* Arama & Filtre */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Sozlesme veya musteri ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-muted-foreground" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? "bg-primary text-white"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Liste ya da boş state */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : contracts.length === 0 ? (
          <Card className="p-16 bg-card border-border flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
              <Inbox size={26} className="text-primary" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              Henüz sozlesme yok
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Ilk sozlesmeni olustur, müsteriyle anlasmanı dijital ve güvenli hale getir.
            </p>
            <Link href="/contracts/new">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus size={15} /> Ilk Sozlesmeni Olustur
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