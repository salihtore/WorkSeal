"use client";

import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Github ve Figma yerine Globe ve Palette ekledik
import {
  Search,
  Filter,
  ShieldCheck,
  Globe,
  Palette,
  Code2,
  Hexagon,
  ExternalLink,
  Wallet
} from "lucide-react";

export default function ExplorePage() {
  // Arayüz iskeletini oluşturmak için statik liste (İleride API'den gelecek)
  const freelancers = [
    {
      id: "1",
      wallet: "0x7a2...9f1b",
      role: "Frontend & Web3 Developer",
      trustScore: 24, // Tamamlanan akıllı sözleşme sayısı
      skills: ["React", "Next.js", "Sui Move"],
      isVerified: true,
      links: { github: true, figma: false }
    },
    {
      id: "2",
      wallet: "0x3b1...4c8d",
      role: "UI/UX & Product Designer",
      trustScore: 18,
      skills: ["Figma", "Prototyping", "Wireframing"],
      isVerified: true,
      links: { github: false, figma: true }
    },
    {
      id: "3",
      wallet: "0x9c4...2e5a",
      role: "Smart Contract Engineer",
      trustScore: 8,
      skills: ["Solidity", "Rust", "Sui Move", "Auditing"],
      isVerified: false,
      links: { github: true, figma: false }
    },
    {
      id: "4",
      wallet: "0x1f8...7d2c",
      role: "Fullstack Geliştirici",
      trustScore: 32,
      skills: ["Node.js", "Express", "React", "PostgreSQL"],
      isVerified: true,
      links: { github: true, figma: true }
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header & Arama/Filtre */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Yetenekleri Keşfet</h1>
              <p className="text-sm text-muted-foreground">
                Zincir üzerinde doğrulanmış yetenekleri bul ve güvenli akıllı sözleşmelerle çalışmaya başla.
              </p>
            </div>

            <div className="flex w-full md:w-auto gap-3">
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Yetenek, rol veya cüzdan ara..."
                  className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50"
                />
              </div>
              <Button variant="outline" className="gap-2 border-border/50">
                <Filter size={16} /> Filtrele
              </Button>
            </div>
          </div>

          {/* Hızlı Yetenek Filtreleri */}
          <div className="flex flex-wrap gap-2">
            {["Tümü", "Frontend", "Backend", "UI/UX Tasarım", "Smart Contract", "Sui Network"].map((tag, i) => (
              <Badge
                key={tag}
                variant={i === 0 ? "default" : "secondary"}
                className={`px-4 py-1.5 cursor-pointer text-xs ${i === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "hover:bg-secondary/80"}`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Freelancer Grid Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <Card key={freelancer.id} className="p-6 bg-card border-border/50 hover:border-primary/30 transition-all duration-300 group">

                {/* Kart Üst Kısım: Cüzdan & Rozetler */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar Yerine Hexagon Web3 İkonu */}
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                      <Hexagon size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold">{freelancer.wallet}</span>
                        {freelancer.isVerified && (
                          <span title="Kimliği Doğrulanmış">
                            <ShieldCheck size={14} className="text-green-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{freelancer.role}</p>
                    </div>
                  </div>
                </div>

                {/* Güven Skoru */}
                <div className="mb-5 p-3 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-primary" />
                    <span className="text-xs font-medium">Başarılı Sözleşme</span>
                  </div>
                  <Badge variant="outline" className="font-mono font-bold bg-background border-primary/20 text-primary">
                    {freelancer.trustScore} İşlem
                  </Badge>
                </div>

                {/* Yetenekler */}
                <div className="mb-6 flex flex-wrap gap-1.5">
                  {freelancer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground border-none">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Kart Alt Kısım: Linkler ve Buton */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {freelancer.links.github && <Globe size={18} className="hover:text-foreground cursor-pointer transition-colors" />}
                    {freelancer.links.figma && <Palette size={18} className="hover:text-foreground cursor-pointer transition-colors" />}
                  </div>
                  <Button size="sm" className="gap-1.5 bg-background border border-primary/30 hover:bg-primary/10 text-foreground transition-all">
                    Profili İncele <ExternalLink size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}