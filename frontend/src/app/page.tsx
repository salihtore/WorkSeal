"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, FileText, Zap, ChevronRight,
  Briefcase, Lock, CheckCircle2,
} from "lucide-react";

const features = [
  { icon: FileText, title: "Dijital Sözleşme", desc: "Sözleşmeni dakikalar içinde oluştur, imzala ve blockchain'de kaydet." },
  { icon: Shield, title: "Güvenli Escrow", desc: "Ödeme iş tamamlanana kadar güvende tutulur, otomatik aktarılır." },
  { icon: Zap, title: "Anlık Bildirim", desc: "Her adımda anında haberdar ol — imza, ödeme, teslim." },
  { icon: Lock, title: "Blockchain Güvencesi", desc: "Tüm işlemler Sui Blockchain üzerinde değiştirilemez şekilde kayıtlıdır." },
];

const steps = [
  { num: "01", title: "Sözleşme Oluştur", desc: "İş tanımını, teslim tarihini ve ödeme miktarını gir." },
  { num: "02", title: "Ödemeyi Kilitle", desc: "Müşteri ödemeyi escrow'a yatırır, güvende tutulur." },
  { num: "03", title: "İşi Teslim Et", desc: "Çalışmayı teslim et, müşteri onaylar." },
  { num: "04", title: "Ödemeyi Al", desc: "Onay gelir gelmez ödeme otomatik hesabına aktarılır." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg">WorkSeal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Keşfet
              </Button>
            </Link>
            <Link href="/connect">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/connect">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-accent text-primary border-primary/30 hover:bg-accent">
            Sui Blockchain ile güçlendirildi
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Freelance işlerini{" "}
            <span className="text-primary">güvenle</span>{" "}
            yönet
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Sözleşme oluştur, ödemeyi güvence altına al, işi teslim et.
            Tüm süreç blockchain üzerinde şeffaf ve değiştirilemez şekilde kayıtlı.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/connect">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 px-8">
                Hemen Başla <ChevronRight size={18} />
              </Button>
            </Link>
            <Link href="/connect">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-8">
                Giriş Yap
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { val: "2.4K+", label: "Freelancer" },
              { val: "₺12M+", label: "Güvenli Ödeme" },
              { val: "98%", label: "Memnuniyet" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-primary">{val}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Her şey bir arada</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Freelance iş sürecinin her adımı için ihtiyacın olan araçlar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nasıl çalışır?</h2>
            <p className="text-muted-foreground">4 adımda güvenli freelance deneyimi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5 p-6 rounded-xl border border-border bg-card">
                <span className="text-3xl font-bold text-primary/30 leading-none">{num}</span>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen başlamaya hazır mısın?</h2>
          <p className="text-muted-foreground mb-8">
            Cüzdanını bağla, ilk sözleşmeni dakikalar içinde gönder.
          </p>
          <Link href="/connect">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 px-10">
              Ücretsiz Başla <CheckCircle2 size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Briefcase size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium">WorkSeal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Keşfet
            </Link>
            <Link href="/connect" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Giriş Yap
            </Link>
            <p className="text-xs text-muted-foreground">© 2024 WorkSeal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}