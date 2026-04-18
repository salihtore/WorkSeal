"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronRight, ChevronLeft, FileText, Shield, CheckCircle2, AlertCircle } from "lucide-react";

const steps = ["Temel Bilgiler", "Maddeler", "Ödeme Özeti", "Önizleme"];

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

  // Milestone tutarlarını otomatik topla
  const totalAmount = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  }, [milestones]);

  // Bulunulan adımın geçerliliğini kontrol et (İleri butonunu açmak/kapatmak için)
  const isCurrentStepValid = useMemo(() => {
    if (step === 0) {
      return (
        form.title.length > 3 &&
        form.description.length > 10 &&
        form.clientWallet.startsWith("0x") &&
        form.deadline !== ""
      );
    }
    if (step === 1) {
      return milestones.every((m) => m.title !== "" && parseFloat(m.amount) > 0 && m.deadline !== "");
    }
    return true; // 2 ve 3. adımlar önizleme/onay olduğu için her zaman geçerli
  }, [step, form, milestones]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Yeni Sözleşme</h1>
            <p className="text-sm text-muted-foreground mt-1">İş güvenceni blockchain üzerinde adım adım inşa et.</p>
          </div>

          {/* Adım göstergesi */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    i === step
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                      : i < step
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-[2px] w-8 rounded-full transition-all duration-300 ${i < step ? "bg-green-500/50" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="p-6 md:p-8 bg-card border-border/50 shadow-xl">
            {/* Adım 1: Temel Bilgiler */}
            {step === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sözleşme Başlığı</Label>
                  <Input 
                    placeholder="örn. E-ticaret Web Sitesi Geliştirme" 
                    value={form.title} 
                    onChange={(e) => updateForm("title", e.target.value)} 
                    className="bg-background/50 focus-visible:ring-primary/50" 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">İş Tanımı</Label>
                  <Textarea 
                    placeholder="İşin kapsamını, teslim edilecekleri ve beklentileri açıkla..." 
                    value={form.description} 
                    onChange={(e) => updateForm("description", e.target.value)} 
                    className="bg-background/50 focus-visible:ring-primary/50 min-h-32 resize-none" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Müşteri Cüzdan Adresi</Label>
                    <Input 
                      placeholder="0x..." 
                      value={form.clientWallet} 
                      onChange={(e) => updateForm("clientWallet", e.target.value)} 
                      className={`bg-background/50 font-mono text-sm ${form.clientWallet && !form.clientWallet.startsWith("0x") ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                    />
                    {form.clientWallet && !form.clientWallet.startsWith("0x") && (
                      <p className="text-[10px] text-destructive mt-1 flex items-center gap-1"><AlertCircle size={10} /> 0x ile başlamalıdır.</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Son Teslim Tarihi</Label>
                    <Input 
                      type="date" 
                      value={form.deadline} 
                      onChange={(e) => updateForm("deadline", e.target.value)} 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Müşteri Kimlik Tercihi</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "any", label: "Farketmez" },
                      { val: "verified", label: "Doğrulanmış (KYC)" },
                      { val: "anonymous", label: "Anonim Web3" },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        onClick={() => updateForm("identityPreference", val)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                          form.identityPreference === val
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
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
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-semibold">Milestone'lar (Aşamalar)</Label>
                    <p className="text-xs text-muted-foreground">İşi parçalara bölerek güvenli ödeme akışı oluştur.</p>
                  </div>
                  <Button onClick={addMilestone} variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors">
                    <Plus size={14} /> Aşama Ekle
                  </Button>
                </div>
                
                {milestones.map((m, i) => (
                  <div key={m.id} className="p-5 rounded-xl border border-border/60 bg-background/30 space-y-4 relative group transition-all hover:border-primary/30 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-secondary/50 text-xs font-semibold border-none">
                        Aşama {i + 1}
                      </Badge>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(m.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-50 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Teslimat Başlığı</Label>
                      <Input placeholder="örn. Arayüz Tasarımlarının Onayı" value={m.title} onChange={(e) => updateMilestone(m.id, "title", e.target.value)} className="bg-background focus-visible:ring-primary/50 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tutar (SUI)</Label>
                        <Input type="number" placeholder="0.00" value={m.amount} onChange={(e) => updateMilestone(m.id, "amount", e.target.value)} className="bg-background focus-visible:ring-primary/50 text-sm font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tarih</Label>
                        <Input type="date" value={m.deadline} onChange={(e) => updateMilestone(m.id, "deadline", e.target.value)} className="bg-background focus-visible:ring-primary/50 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Adım 3: Ödeme Özeti */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-primary/10 to-background border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Akıllı Sözleşmeye Kilitlenecek Toplam Tutar</p>
                  <h2 className="text-5xl font-bold text-foreground font-mono">{totalAmount > 0 ? totalAmount : "0.00"} <span className="text-2xl text-primary">SUI</span></h2>
                </div>

                <div className="p-5 rounded-xl border border-border bg-background/50 space-y-4">
                  <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield size={20} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Sui Escrow Koruması Aktif</h3>
                      <p className="text-xs text-muted-foreground">İş kanıtı sunulmadan bu bütçeye dokunulamaz.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    {milestones.map((m, i) => m.title && (
                      <div key={m.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        <span className="text-muted-foreground truncate pr-4"><span className="text-foreground/50 mr-2">#{i+1}</span>{m.title}</span>
                        <span className="font-semibold font-mono whitespace-nowrap">{m.amount || "0"} SUI</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Adım 4: Önizleme */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{form.title}</h3>
                    <p className="text-sm text-primary flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Taslak Oluşturuldu
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                     <p className="text-xs text-muted-foreground mb-1">Müşteri Cüzdanı</p>
                     <p className="text-sm font-mono truncate">{form.clientWallet}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                     <p className="text-xs text-muted-foreground mb-1">Bitiş Tarihi</p>
                     <p className="text-sm font-medium">{form.deadline}</p>
                   </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3">Aşama Özeti</h4>
                  <div className="space-y-2">
                    {milestones.map((m, i) => (
                      <div key={m.id} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                        <span className="text-sm text-muted-foreground">{m.title}</span>
                        <Badge variant="secondary" className="font-mono">{m.amount} SUI</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
                  <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/80 leading-relaxed">
                    Sözleşmeyi gönderdiğinde Web3 cüzdanın ile imza atman gerekecektir. Sözleşme blockchain'e kaydedildikten sonra müşteri tarafından onaylanıp fonlanması beklenecektir.
                  </p>
                </div>
              </div>
            )}

            {/* Navigasyon */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
              <Button 
                onClick={() => setStep((p) => p - 1)} 
                disabled={step === 0} 
                variant="outline" 
                className="gap-2 px-6"
              >
                <ChevronLeft size={16} /> Geri
              </Button>

              {step < steps.length - 1 ? (
                <Button 
                  onClick={() => setStep((p) => p + 1)} 
                  disabled={!isCurrentStepValid}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 transition-all"
                >
                  İleri <ChevronRight size={16} />
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] text-primary-foreground gap-2 px-8 transition-all">
                  Sözleşmeyi İmzala & Gönder <CheckCircle2 size={18} />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}