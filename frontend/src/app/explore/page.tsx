"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Search, CheckCircle2, Star,
  Filter, Wallet, ArrowUpRight,
} from "lucide-react";

const freelancers = [
  { id: "1", name: "Ahmet Yılmaz", title: "Full-Stack Developer", skills: ["React", "Node.js", "PostgreSQL"], rating: 4.9, jobs: 23, anonymous: false, verified: true },
  { id: "2", name: "0x3d4e...5f6a", title: "UI/UX Designer", skills: ["Figma", "Tailwind", "Framer"], rating: 4.7, jobs: 15, anonymous: true, verified: false },
  { id: "3", name: "Zeynep Kara", title: "Mobile Developer", skills: ["React Native", "Expo", "Swift"], rating: 5.0, jobs: 31, anonymous: false, verified: true },
  { id: "4", name: "0x7b8c...9d0e", title: "Blockchain Developer", skills: ["Sui Move", "Solidity", "Web3"], rating: 4.8, jobs: 12, anonymous: true, verified: false },
  { id: "5", name: "Mert Aydın", title: "Backend Developer", skills: ["Go", "Docker", "Kubernetes"], rating: 4.6, jobs: 19, anonymous: false, verified: true },
  { id: "6", name: "0x2c3d...4e5f", title: "Data Scientist", skills: ["Python", "TensorFlow", "SQL"], rating: 4.5, jobs: 8, anonymous: true, verified: false },
];

const filters = ["Tümü", "Doğrulanmış", "Anonim", "En Yüksek Puan"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tümü");

  const filtered = freelancers.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      activeFilter === "Tümü" ? true :
      activeFilter === "Doğrulanmış" ? f.verified :
      activeFilter === "Anonim" ? f.anonymous :
      activeFilter === "En Yüksek Puan" ? f.rating >= 4.8 : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg">WorkSeal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-primary text-sm">Keşfet</Button>
            </Link>
            <Link href="/connect">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Wallet size={14} /> Cüzdan Bağla
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Freelancer Keşfet</h1>
          <p className="text-muted-foreground">
            Blockchain üzerinde doğrulanmış freelancer'larla çalış.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Wallet size={12} />
            <span>İşlem yapmak için cüzdan bağlantısı gereklidir</span>
          </div>
        </div>

        {/* Arama & Filtre */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="İsim, ünvan veya yetenek ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f) => (
            <Card key={f.id} className="p-5 bg-card border-border hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {f.anonymous ? "?" : f.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium ${f.anonymous ? "font-mono" : ""}`}>{f.name}</p>
                      {f.verified && <CheckCircle2 size={13} className="text-green-400" />}
                    </div>
                    <p className="text-xs text-primary">{f.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">{f.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {f.skills.map((s) => (
                  <Badge key={s} className="bg-secondary text-muted-foreground border-border text-xs">{s}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{f.jobs} tamamlanan iş</span>
                <Link href="/connect">
                  <Button size="sm" variant="outline" className="border-border gap-1 text-xs group-hover:border-primary/50 group-hover:text-primary transition-all">
                    İletişime Geç <ArrowUpRight size={12} />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}