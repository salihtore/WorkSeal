"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// 1. Geliştirme: Loader2 (Spinner) ekledik
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  UploadCloud, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  History,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Loader2 
} from "lucide-react";

// Not: Eğer Shadcn Toast kurduysan burayı aktif edebilirsin
// import { useToast } from "@/components/ui/use-toast";

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [proofForm, setProofForm] = useState({ link: "", notes: "" });
  
  // 2. Geliştirme: Loading state'i ekledik
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  
  // const { toast } = useToast(); // Toast hook'u

  // İş kanıtı gönderme fonksiyonu (SUI İşlemini simüle eder)
  const handleSubmitProof = async () => {
    if (!proofForm.link) {
      alert("Lütfen bir çalışma linki ekleyin."); // Basit hata kontrolü
      return;
    }

    setIsSubmittingProof(true); // Yüklenme durumunu başlat
    console.log("Sui move call başlatılıyor... İş Kanıtı:", proofForm);
    
    // 3. Geliştirme: Blokzincir işlemini 2.5 saniye simüle ediyoruz (Fake delay)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // İşlem başarılı (Simülasyon bitti)
    setIsSubmittingProof(false);
    setIsProofOpen(false); // Accordion'ı kapat
    setProofForm({ link: "", notes: "" }); // Formu temizle
    
    // Toast bildirimini simüle et
    console.log("İşlem Başarılı: İş kanıtı zincire işlendi, müşteri onayına gönderildi.");
    alert("Başarılı! İş kanıtı zincire işlendi ve müşteri onayına gönderildi."); // Geçici bildirim
    
    /* Shadcn Toast yüklüyse alert yerine bunu kullan:
    toast({
      title: "Kanıt Gönderildi!",
      description: "İş kanıtı Sui Move kontratına işlendi. Müşteri onayı bekleniyor.",
    });
    */
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header & Ana Aksiyon */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">E-Ticaret Web Sitesi Geliştirme</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">Escrow Kilitli</Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText size={14} /> Sözleşme ID: <span className="font-mono text-foreground/80">{params.id || "0x123...abc"}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 border-border/50">
                <MessageSquare size={16} /> Mesaj Gönder
              </Button>
              <Button 
                onClick={() => setIsProofOpen(!isProofOpen)}
                variant={isProofOpen ? "outline" : "default"} // Accordion açıkken buton stilini değiştir
                className={`gap-2 transition-all ${!isProofOpen ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "border-border/50"}`}
              >
                <UploadCloud size={16} /> 
                {isProofOpen ? "Kanıt Panelini Kapat" : "İş Kanıtı Yükle"}
                {isProofOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sol Kolon: Detaylar, Aşamalar ve İş Kanıtı Accordion */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* İş Kanıtı Accordion */}
              {isProofOpen && (
                <Card className="p-6 bg-primary/5 border-primary/30 shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex items-center gap-3 mb-4 border-b border-primary/10 pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UploadCloud size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Aşama Kanıtı Sun</h2>
                      <p className="text-xs text-muted-foreground">Aktif aşama (Sepet ve Ödeme Altyapısı) için teslimat bilgilerini gir.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Çalışma Linki (GitHub, Figma, Vercel vb.)</Label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="https://" 
                          value={proofForm.link}
                          onChange={(e) => setProofForm({...proofForm, link: e.target.value})}
                          className="pl-9 bg-background focus-visible:ring-primary/50" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Ek Açıklamalar</Label>
                      <Textarea 
                        placeholder="Müşteriye işin bu aşamasında neler yaptığını anlat..." 
                        value={proofForm.notes}
                        onChange={(e) => setProofForm({...proofForm, notes: e.target.value})}
                        className="bg-background focus-visible:ring-primary/50 min-h-24 resize-none" 
                      />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsProofOpen(false)}>İptal</Button>
                      
                      {/* 4. Geliştirme: Loading durumunu butona yansıttık */}
                      <Button 
                        onClick={handleSubmitProof}
                        disabled={isSubmittingProof} // İşlem sürerken butonu inaktif et
                        className="gap-2 bg-primary text-white hover:bg-primary/90"
                      >
                        {isSubmittingProof ? (
                          <> <Loader2 size={16} className="animate-spin" /> Sui İşlemi Bekleniyor...</>
                        ) : (
                          <> <CheckCircle2 size={16} /> Zincire İşle ve Onaya Gönder</>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-card border-border/50">
                <h2 className="text-lg font-semibold mb-4">İş Tanımı</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  Modern bir e-ticaret platformu geliştirilecek. Next.js ve Tailwind CSS kullanılacak.
                  Sepet yönetimi, kullanıcı girişi ve ödeme entegrasyonu aşamalı olarak teslim edilecek.
                  Tasarım dosyaları Figma üzerinden iletilmiştir.
                </p>
              </Card>

              {/* Aşamalar - Modern Badge ve Glow Etkisi */}
              <Card className="p-6 bg-card border-border/50">
                <h2 className="text-lg font-semibold mb-4">Milestone'lar (Aşamalar)</h2>
                <div className="space-y-4">
                  {[
                    { title: "Arayüz Tasarımı ve Onayı", amount: "30.00", status: "completed" },
                    { title: "Sepet ve Ödeme Altyapısı", amount: "50.00", status: "in_progress" },
                    { title: "Test ve Canlıya Alma", amount: "20.00", status: "pending" },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      m.status === 'completed' ? 'bg-green-500/5 border-green-500/20 opacity-80' : 
                      m.status === 'in_progress' ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)] relative overflow-hidden group' : 
                      'bg-secondary/30 border-border/40'
                    }`}>
                      {m.status === 'in_progress' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                          {/* İnce parlama efekti */}
                          <div className="absolute -inset-px bg-gradient-to-r from-primary/5 to-transparent blur-sm" />
                        </>
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          m.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          m.status === 'in_progress' ? 'bg-primary/20 text-primary animate-pulse' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {m.status === 'completed' ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i+1}</span>}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${m.status === 'completed' ? 'text-green-500/80 line-through' : ''}`}>{m.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {m.status === 'completed' ? 'Ödendi' : m.status === 'in_progress' ? 'Aktif Aşama (Kanıt Bekleniyor)' : 'Beklemede'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <span className="font-mono font-semibold text-sm">{m.amount} SUI</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
            </div>

            {/* Sağ Kolon: Escrow Durumu ve Timeline */}
            <div className="space-y-6">
              
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden group">
                {/* Siberpunk esintili arka plan Glow */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield size={100} />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4 relative z-10">
                  <Shield size={16} className="text-primary" /> Escrow Bakiyesi
                </h3>
                <div className="mb-4 relative z-10 flex items-baseline gap-2">
                  <span className="text-5xl font-mono font-bold tracking-tighter shadow-inner">100.00</span>
                  <span className="text-xl text-primary font-bold">SUI</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-4 mt-4 relative z-10">
                  <div className="flex justify-between">
                    <span>Toplam Bütçe:</span>
                    <span className="font-mono">100.00 SUI</span>
                  </div>
                  <div className="flex justify-between text-green-500">
                    <span>Serbest Bırakılan:</span>
                    <span className="font-mono">30.00 SUI</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Kilitli Kalan:</span>
                    <span className="font-mono">70.00 SUI</span>
                  </div>
                </div>
              </Card>

              {/* Aktivite Geçmişi (Timeline) */}
              <Card className="p-6 bg-card border-border/50 flex-1">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
                  <History size={16} /> Zincir Aktiviteleri
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  
                  {/* Timeline Ögesi (Dinamik simülasyon) */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(var(--primary),0.5)] z-10">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border/50 bg-secondary/20 ml-4 md:ml-0 transition-all group-hover:border-primary/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary">Aşama 2 Devam Ediyor</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} /> Az önce
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border/50 bg-background ml-4 md:ml-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">1. Aşama Ödendi</span>
                        <a href="#" className="text-muted-foreground hover:text-primary"><ExternalLink size={12} /></a>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} /> 2 gün önce
                      </p>
                    </div>
                  </div>

                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}