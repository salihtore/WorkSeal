"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User, Wallet, Edit3, Save, Plus,
  X, ExternalLink, Eye, EyeOff, CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const account = useCurrentAccount();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    title: "",
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((p) => [...p, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profil</h1>
              <p className="text-sm text-muted-foreground mt-1">Kimlik ve portföy ayarları</p>
            </div>
            <Button
              onClick={() => setEditing(!editing)}
              variant={editing ? "default" : "outline"}
              className={editing
                ? "bg-primary text-white gap-2"
                : "border-border gap-2 text-foreground"
              }
            >
              {editing
                ? <><Save size={15} /> Kaydet</>
                : <><Edit3 size={15} /> Düzenle</>
              }
            </Button>
          </div>

          {/* Kimlik Kartı */}
          <Card className="p-6 bg-card border-border mb-5">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {isAnonymous ? "?" : form.name ? form.name[0].toUpperCase() : <User size={24} />}
                </div>
                {!isAnonymous && form.name && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                {editing && !isAnonymous ? (
                  <div className="space-y-3">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Adın Soyadın"
                      className="bg-secondary border-border"
                    />
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Unvan (örn. Full-Stack Developer)"
                      className="bg-secondary border-border"
                    />
                    <Textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Kendinden kısaca bahset..."
                      className="bg-secondary border-border resize-none"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {isAnonymous ? "Anonim Kullanıcı" : form.name || "Isim eklenmedi"}
                      </p>
                      {!isAnonymous && form.name && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          Dogrulanmıs
                        </Badge>
                      )}
                      {isAnonymous && (
                        <Badge className="bg-secondary text-muted-foreground border-border text-xs">
                          Anonim
                        </Badge>
                      )}
                    </div>
                    {!isAnonymous && form.title && (
                      <p className="text-sm text-primary mb-1">{form.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isAnonymous
                        ? "Kimligin gizli tutulmaktadır."
                        : form.bio || "Bio eklenmedi"}
                    </p>
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
                  <p className="text-xs text-muted-foreground">Baglı Cüzdan</p>
                  <p className="text-sm font-mono text-foreground">
                    {account
                      ? `${account.address.slice(0, 10)}...${account.address.slice(-8)}`
                      : "—"
                    }
                  </p>
                </div>
              </div>
              {account && (
                  <a
                  href={`https://explorer.sui.io/address/${account.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                    <ExternalLink size={12} /> Explorer
                  </Button>
                </a>
              )}
            </div>

            <Separator className="my-5 bg-border" />

            {/* Anonimlik Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                {isAnonymous
                  ? <EyeOff size={16} className="text-muted-foreground" />
                  : <Eye size={16} className="text-primary" />
                }
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isAnonymous ? "Anonim Mod Aktif" : "Kimligim Görünür"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAnonymous
                      ? "Sadece cüzdan adresinle görünüyorsun"
                      : "Isim ve profil bilgilerin herkese acık"
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  isAnonymous ? "bg-border" : "bg-primary"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  isAnonymous ? "left-1" : "left-6"
                }`} />
              </button>
            </div>
          </Card>

          {/* Yetenekler */}
          <Card className="p-6 bg-card border-border mb-5">
            <h2 className="text-sm font-semibold mb-4 text-foreground">Yetenekler</h2>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-primary/20"
                  >
                    <span className="text-xs text-primary font-medium">{s}</span>
                    {editing && (
                      <button
                        onClick={() => removeSkill(s)}
                        className="text-primary/60 hover:text-primary transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Henüz yetenek eklenmedi.
              </p>
            )}
            {editing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Yetenek ekle (örn. React)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="bg-secondary border-border text-sm"
                />
                <Button
                  onClick={addSkill}
                  variant="outline"
                  className="border-border gap-1 shrink-0 text-foreground"
                >
                  <Plus size={14} /> Ekle
                </Button>
              </div>
            )}
          </Card>

          {/* Portföy */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Portföy</h2>
              {editing && (
                <Button variant="outline" size="sm" className="border-border gap-1 text-xs text-foreground">
                  <Plus size={13} /> Proje Ekle
                </Button>
              )}
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                <Plus size={20} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Henüz portföy projesi yok.
              </p>
              {editing && (
                <Button variant="outline" size="sm" className="border-border gap-1 text-xs text-foreground">
                  <Plus size={13} /> Ilk Projeni Ekle
                </Button>
              )}
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}