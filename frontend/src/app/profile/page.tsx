"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User, Wallet, Shield, Edit3, Save, Plus,
  X, CheckCircle2, ExternalLink, Eye, EyeOff,
} from "lucide-react";

const skills = ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL"];

const portfolio = [
  { id: "1", title: "E-ticaret Platformu", desc: "Next.js + Stripe entegrasyonlu tam kapsamlı mağaza", tags: ["React", "Next.js"], link: "#" },
  { id: "2", title: "Kurumsal Dashboard", desc: "Gerçek zamanlı analitik paneli", tags: ["TypeScript", "Chart.js"], link: "#" },
  { id: "3", title: "Mobil Uygulama", desc: "React Native ile çapraz platform uygulama", tags: ["React Native", "Expo"], link: "#" },
];

export default function ProfilePage() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillList, setSkillList] = useState(skills);
  const [form, setForm] = useState({
    name: "Salih Töre",
    bio: "Full-stack geliştirici. Web3 ve modern web teknolojileri üzerine çalışıyorum.",
    title: "Full-Stack Developer",
  });

  const walletAddress = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";

  const addSkill = () => {
    if (newSkill.trim() && !skillList.includes(newSkill.trim())) {
      setSkillList((p) => [...p, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => setSkillList((p) => p.filter((x) => x !== s));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Profil</h1>
              <p className="text-sm text-muted-foreground mt-1">Kimlik ve portföy ayarları</p>
            </div>
            <Button
              onClick={() => setEditing(!editing)}
              variant={editing ? "default" : "outline"}
              className={editing ? "bg-primary text-white gap-2" : "border-border gap-2"}
            >
              {editing ? <><Save size={15} /> Kaydet</> : <><Edit3 size={15} /> Düzenle</>}
            </Button>
          </div>

          {/* Kimlik Kartı */}
          <Card className="p-6 bg-card border-border mb-5">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {isAnonymous ? "?" : form.name.split(" ").map(n => n[0]).join("")}
                </div>
                {!isAnonymous && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                {editing && !isAnonymous ? (
                  <div className="space-y-3">
                    <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Adın" className="bg-secondary border-border" />
                    <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ünvan" className="bg-secondary border-border" />
                    <Textarea value={form.bio} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))} className="bg-secondary border-border resize-none" rows={2} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{isAnonymous ? "Anonim Kullanıcı" : form.name}</p>
                      {!isAnonymous && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Doğrulanmış</Badge>}
                      {isAnonymous && <Badge className="bg-secondary text-muted-foreground border-border text-xs">Anonim</Badge>}
                    </div>
                    {!isAnonymous && <p className="text-sm text-primary mb-1">{form.title}</p>}
                    <p className="text-sm text-muted-foreground">{isAnonymous ? "Kimliğin gizli tutulmaktadır." : form.bio}</p>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-5 bg-border" />

            {/* Wallet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Bağlı Cüzdan</p>
                  <p className="text-sm font-mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
                </div>
              </div>
              <a href={`https://explorer.sui.io/address/${walletAddress}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                  <ExternalLink size={12} /> Explorer
                </Button>
              </a>
            </div>

            <Separator className="my-5 bg-border" />

            {/* Anonimlik Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                {isAnonymous ? <EyeOff size={16} className="text-muted-foreground" /> : <Eye size={16} className="text-primary" />}
                <div>
                  <p className="text-sm font-medium">{isAnonymous ? "Anonim Mod Aktif" : "Kimliğim Görünür"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAnonymous ? "Sadece cüzdan adresinle görünüyorsun" : "İsim ve profil bilgilerin herkese açık"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-11 h-6 rounded-full transition-all relative ${isAnonymous ? "bg-border" : "bg-primary"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isAnonymous ? "left-1" : "left-6"}`} />
              </button>
            </div>
          </Card>

          {/* Yetenekler */}
          <Card className="p-6 bg-card border-border mb-5">
            <h2 className="text-sm font-semibold mb-4">Yetenekler</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillList.map((s) => (
                <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-primary/20">
                  <span className="text-xs text-primary font-medium">{s}</span>
                  {editing && (
                    <button onClick={() => removeSkill(s)} className="text-primary/60 hover:text-primary transition-colors">
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Yeni yetenek ekle"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="bg-secondary border-border text-sm"
                />
                <Button onClick={addSkill} variant="outline" className="border-border gap-1 shrink-0">
                  <Plus size={14} /> Ekle
                </Button>
              </div>
            )}
          </Card>

          {/* Portföy */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold">Portföy</h2>
              {editing && (
                <Button variant="outline" size="sm" className="border-border gap-1 text-xs">
                  <Plus size={13} /> Proje Ekle
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {portfolio.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-border bg-secondary hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium">{p.title}</p>
                    <a href={p.link} className="text-muted-foreground hover:text-primary transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                  <div className="flex gap-2">
                    {p.tags.map((t) => (
                      <Badge key={t} className="bg-card text-muted-foreground border-border text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}