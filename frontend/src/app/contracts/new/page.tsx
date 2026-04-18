"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronRight, ChevronLeft, FileText, Shield, CheckCircle2 } from "lucide-react";

const steps = ["Temel Bilgiler", "Maddeler", "Ödeme", "Önizleme"];

interface Milestone {
  id: string;
  title: string;
  amount: string;
  deadline: string;
}

export default function NewContractPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientWallet: "",
    deadline: "",
    totalAmount: "",
    identityPreference: "any",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "", amount: "", deadline: "" },
  ]);

  const updateForm = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const addMilestone = () => {
    setMilestones((p) => [...p, { id: Date.now().toString(), title: "", amount: "", deadline: "" }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones((p) => p.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, key: keyof Milestone, value: string) => {
    setMilestones((p) => p.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Yeni Sözleşme</h1>
            <p className="text-sm text-muted-foreground mt-1">Adım adım sözleşmeni oluştur</p>
          </div>

          {/* Adım göstergesi */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step ? "bg-primary text-white" :
                  i < step ? "bg-green-500/10 text-green-400" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 size={12} /> : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-6 ${i < step ? "bg-green-500/50" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="p-6 bg-card border-border">
            {/* Adım 1: Temel Bilgiler */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm mb-2 block">Sözleşme Başlığı</Label>
                  <Input placeholder="örn. E-ticaret Web Sitesi Geliştirme" value={form.title} onChange={(e) => updateForm("title", e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">İş Tanımı</Label>
                  <Textarea placeholder="İşin kapsamını, teslim edilecekleri ve beklentileri açıkla..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} className="bg-secondary border-border min-h-28 resize-none" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Müşteri Wallet Adresi</Label>
                  <Input placeholder="0x..." value={form.clientWallet} onChange={(e) => updateForm("clientWallet", e.target.value)} className="bg-secondary border-border font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Son Teslim Tarihi</Label>
                  <Input type="date" value={form.deadline} onChange={(e) => updateForm("deadline", e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Kimlik Tercihi</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "any", label: "Farketmez" },
                      { val: "verified", label: "Kimliği Doğrulanmış" },
                      { val: "anonymous", label: "Anonim" },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        onClick={() => updateForm("identityPreference", val)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                          form.identityPreference === val
                            ? "border-primary bg-accent text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Adım 2: Maddeler */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Milestone'lar</Label>
                  <Button onClick={addMilestone} variant="outline" size="sm" className="gap-1 border-border text-xs">
                    <Plus size={13} /> Ekle
                  </Button>
                </div>
                {milestones.map((m, i) => (
                  <div key={m.id} className="p-4 rounded-xl border border-border bg-secondary space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Milestone {i + 1}</span>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <Input placeholder="Milestone başlığı" value={m.title} onChange={(e) => updateMilestone(m.id, "title", e.target.value)} className="bg-card border-border text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="₺ Tutar" value={m.amount} onChange={(e) => updateMilestone(m.id, "amount", e.target.value)} className="bg-card border-border text-sm" />
                      <Input type="date" value={m.deadline} onChange={(e) => updateMilestone(m.id, "deadline", e.target.value)} className="bg-card border-border text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Adım 3: Ödeme */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm mb-2 block">Toplam Tutar (SUI)</Label>
                  <Input placeholder="örn. 100" value={form.totalAmount} onChange={(e) => updateForm("totalAmount", e.target.value)} className="bg-secondary border-border" />
                  <p className="text-xs text-muted-foreground mt-2">Tutar, iş tamamlanana kadar escrow'da güvende tutulur.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-primary" />
                    <span className="text-sm font-medium">Escrow Koruması</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ödeme Sui Blockchain üzerindeki akıllı sözleşmede kilitlenir. Milestone tamamlanıp onaylanınca otomatik aktarılır.
                  </p>
                  {milestones.map((m, i) => m.title && (
                    <div key={m.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Milestone {i + 1}: {m.title}</span>
                      <span className="font-medium">{m.amount || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adım 4: Önizleme */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{form.title || "Başlıksız Sözleşme"}</p>
                    <p className="text-xs text-muted-foreground">Taslak · Henüz imzalanmadı</p>
                  </div>
                </div>
                {[
                  { label: "Müşteri", value: form.clientWallet || "—" },
                  { label: "Son Tarih", value: form.deadline || "—" },
                  { label: "Toplam Tutar", value: form.totalAmount ? `${form.totalAmount} SUI` : "—" },
                  { label: "Kimlik Tercihi", value: form.identityPreference === "any" ? "Farketmez" : form.identityPreference === "verified" ? "Kimliği Doğrulanmış" : "Anonim" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium font-mono">{value}</span>
                  </div>
                ))}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-3">Milestone'lar</p>
                  {milestones.map((m, i) => (
                    <div key={m.id} className="flex justify-between py-1.5">
                      <span className="text-xs">{m.title || `Milestone ${i + 1}`}</span>
                      <Badge className="bg-secondary text-muted-foreground text-xs">{m.amount || "—"}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-accent border border-primary/20">
                  <p className="text-xs text-primary">Sözleşmeyi göndermek Slush Wallet imzası gerektirir. Müşteriye bildirim gönderilecek.</p>
                </div>
              </div>
            )}

            {/* Navigasyon */}
            <div className="flex justify-between mt-8 pt-5 border-t border-border">
              <Button onClick={() => setStep((p) => p - 1)} disabled={step === 0} variant="outline" className="border-border gap-2">
                <ChevronLeft size={16} /> Geri
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((p) => p + 1)} className="bg-primary hover:bg-primary/90 text-white gap-2">
                  İleri <ChevronRight size={16} />
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                  Sözleşmeyi Gönder <CheckCircle2 size={16} />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}