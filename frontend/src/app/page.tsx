"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/hooks/useContracts";
import { mistToSui } from "@/types";
import { ArrowRight, Shield, Zap, FileText, Lock } from "lucide-react";

function LiveJobCount() {
  const { contracts, loading } = useContracts();
  const openCount = contracts.filter(
    c => !c.freelancer || c.freelancer === "0x0000000000000000000000000000000000000000000000000000000000000000"
  ).length;

  return (
    <span className="font-mono text-xs text-[#4FC3F7]/60">
      {loading ? "..." : openCount} açık iş · Sui Testnet
    </span>
  );
}

const features = [
  {
    num: "01",
    title: "Dijital Sözleşme",
    desc: "İş tanımını, teslim tarihini ve ödeme miktarını blockchain'e kaydet.",
  },
  {
    num: "02",
    title: "Güvenli Escrow",
    desc: "Ödeme iş tamamlanana kadar akıllı sözleşmede kilitli kalır.",
  },
  {
    num: "03",
    title: "Şeffaf Süreç",
    desc: "Tüm adımlar zincir üzerinde, herhangi bir aracı olmadan yürür.",
  },
  {
    num: "04",
    title: "Anlık Ödeme",
    desc: "Müşteri onayladığı anda ödeme freelancer'a otomatik aktarılır.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight text-foreground">
            Work<span className="text-[#4FC3F7]">Seal</span>
          </span>
          <div className="flex items-center gap-8">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Keşfet
            </Link>
            <Link href="/connect" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Giriş Yap
            </Link>
            <Link href="/connect">
              <Button className="h-9 px-5 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90 transition-all">
                Başla
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-48 pb-32 px-8 text-center relative">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <LiveJobCount />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8 max-w-5xl mx-auto">
          Freelance işlerini
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #F0F6FF 0%, rgba(240,246,255,0.35) 100%)" }}
          >
            zincire kilitle.
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
          Sui Blockchain üzerinde güvenli sözleşmeler, otomatik escrow ve
          şeffaf iş yönetimi — hiçbir aracı olmadan.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/connect">
            <Button className="h-12 px-8 bg-[#4FC3F7] text-[#050810] font-bold hover:bg-[#4FC3F7]/90 transition-all gap-2">
              Hemen Başla <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="h-12 px-8 border-border text-foreground hover:bg-white/5 transition-all">
              İşleri Keşfet
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-border" />

      {/* ── Features (Walrus-style numbered blocks) ── */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-xs font-mono text-[#4FC3F7] tracking-widest uppercase mb-4">Nasıl Çalışır</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl">
              Dört adımda
              <br />
              <span className="text-muted-foreground font-light">güvenli freelance.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {features.map(({ num, title, desc }) => (
              <div key={num} className="bg-background p-10 group hover:bg-white/[0.02] transition-colors">
                <span className="font-mono text-xs text-[#4FC3F7]/40 tracking-widest">{num}</span>
                <h3 className="text-2xl font-bold mt-4 mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-border" />

      {/* ── Trust Stats ── */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {[
            { val: "0", label: "Orta Yok", sub: "Tamamen merkezi olmayan" },
            { val: "100%", label: "Zincir Üzeri", sub: "Tüm veriler blockchain'de" },
            { val: "∞", label: "Şeffaflık", sub: "Herkese açık denetim" },
          ].map(({ val, label, sub }) => (
            <div key={label} className="bg-background p-12 text-center group">
              <p className="text-5xl font-black font-mono text-[#4FC3F7] mb-2">{val}</p>
              <p className="font-bold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-border" />

      {/* ── CTA ── */}
      <section className="py-40 px-8 text-center">
        <p className="text-xs font-mono text-[#4FC3F7] tracking-widest uppercase mb-8">Başlamak için tek adım</p>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-12 leading-none">
          Cüzdanını bağla.
        </h2>
        <Link href="/connect">
          <Button className="h-14 px-12 bg-[#4FC3F7] text-[#050810] font-bold text-base hover:bg-[#4FC3F7]/90 transition-all gap-2">
            Ücretsiz Başla <ArrowRight size={18} />
          </Button>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-black text-sm">Work<span className="text-[#4FC3F7]">Seal</span></span>
          <div className="flex items-center gap-8">
            <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Keşfet</Link>
            <Link href="/connect" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Giriş Yap</Link>
            <span className="text-xs text-muted-foreground">© 2025 WorkSeal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}