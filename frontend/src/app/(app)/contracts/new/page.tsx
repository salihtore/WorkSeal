"use client";

import { useState, use } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronRight, ChevronLeft, FileText, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatMistToSui, parseSuiToMist } from "@/lib/utils/format";

// EKLENEN: Sui Dapp Kit ve Yazdığımız Hook Importları
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useWorkSealTransactions } from "@/hooks/useWorkSealTransactions";

const steps = ["Temel Bilgiler", "Maddeler", "Ödeme Özeti", "Önizleme"];

// 1. Zod şeması tanımı (clientWallet tamamen kaldırıldı)
const contractSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır."),
  description: z.string().min(10, "Açıklama çok kısa, lütfen detaylandırın."),
  deadline: z.string().min(1, "Bitiş tarihi seçilmelidir"),
  identityPreference: z.enum(["any", "verified", "anonymous"]),
  milestones: z.array(
    z.object({
      title: z.string().min(3, "Aşama başlığı girin."),
      amount: z.string().min(1, "Tutar girilmelidir").refine((val) => parseSuiToMist(val) > 0n, {
        message: "0 SUI'den büyük olmalıdır",
      }),
      deadline: z.string().min(1, "Aşama tarihi girin"),
    })
  ).min(1, "En az bir aşama (milestone) eklenmelidir."),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = use(searchParams);
  const openedFromMobile = resolvedSearchParams.source === "mobile-slush";
  const [step, setStep] = useState(0);
  
  // EKLENEN: Yüklenme Durumu (Loading State) ve Sui Hook'ları
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();
  const { createContract } = useWorkSealTransactions();

  // 2. React Hook Form Entegrasyonu
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      identityPreference: "any",
      milestones: [{ title: "", amount: "", deadline: "" }],
    },
    mode: "onChange",
  });

  const { fields: milestones, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const watchAll = watch();

  const totalAmountStr = watchAll.milestones?.reduce((sum, m) => {
    return sum + (parseFloat(m.amount) || 0);
  }, 0).toLocaleString("en-US", { maximumFractionDigits: 4 });

  const handleNextStep = async () => {
    let isValid = false;
    if (step === 0) {
      // clientWallet trigger'dan da çıkarıldı
      isValid = await trigger(["title", "description", "deadline", "identityPreference"]);
    } else if (step === 1) {
      isValid = await trigger("milestones");
    } else {
      isValid = true;
    }

    if (isValid) {
      setStep((p) => p + 1);
    }
  };

  // EKLENEN/DEĞİŞTİRİLEN: Gerçek Blockchain İşleminin Yapıldığı Yer
  const onSubmit = async (data: ContractFormValues) => {
    if (!account) {
      alert("İşlem yapabilmek için lütfen sağ üstten Web3 cüzdanınızı bağlayın.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Son teslim tarihini Unix Zaman Damgasına (Milisaniye) çeviriyoruz
      const deadlineMs = new Date(data.deadline).getTime();

      // 2. Milestones verilerini kontratın beklediği iki ayrı diziye ayırıyoruz
      const milestoneTitles = data.milestones.map((m) => m.title);
      const milestoneAmounts = data.milestones.map((m) => parseSuiToMist(m.amount));

      // 3. Yazdığımız hook üzerinden Cüzdan onayı (Sign) istiyoruz ve işlemi gönderiyoruz
      const txResult = await createContract({
        title: data.title,
        description: data.description,
        client: account.address, // <-- DEĞİŞTİ: Artık bağlı cüzdan otomatik olarak müşteri oluyor
        deadline_ms: deadlineMs,
        milestone_titles: milestoneTitles,
        milestone_amounts: milestoneAmounts,
      });

      console.log("İşlem başarılı, Tx Bilgileri:", txResult);
      alert("Tebrikler! Sözleşme blockchain ağına başarıyla kaydedildi.");
      
    } catch (error: any) {
      console.error("Sözleşme oluşturulurken hata:", error);
      alert(`Bir hata oluştu: ${error?.message || "İşlem reddedildi veya ağ hatası."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Yeni Sözleşme</h1>
        <p className="text-sm text-muted-foreground mt-1">İş güvenceni blockchain üzerinde adım adım inşa et.</p>
      </div>

      {openedFromMobile && (
        <div className="mb-6 border border-[#4FC3F7]/30 bg-[#4FC3F7]/5 px-5 py-4 text-xs font-mono text-[#4FC3F7] uppercase tracking-widest">
          Slush mobile akisi: bu formu Slush hesabinla doldurup son adimda wallet onayini ver.
        </div>
      )}

      {/* Adım göstergesi */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
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
              <div className={`h-[2px] w-4 sm:w-8 rounded-full transition-all duration-300 ${i < step ? "bg-green-500/50" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6 md:p-8 bg-card border-border/50 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Adım 1: Temel Bilgiler */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <Label className="text-sm font-medium mb-2 block">Sözleşme Başlığı</Label>
                <Input 
                  {...register("title")}
                  placeholder="örn. E-ticaret Web Sitesi Geliştirme" 
                  className={`bg-background/50 ${errors.title ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                />
                {errors.title && <p className="text-[10px] text-destructive mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">İş Tanımı</Label>
                <Textarea 
                  {...register("description")}
                  placeholder="İşin kapsamını, teslim edilecekleri ve beklentileri açıkla..." 
                  className={`bg-background/50 min-h-32 resize-none ${errors.description ? "border-destructive" : "focus-visible:ring-primary/50"}`} 
                />
                {errors.description && <p className="text-[10px] text-destructive mt-1">{errors.description.message}</p>}
              </div>

              {/* clientWallet inputu kaldırıldı, layout düzeni bozulmaması için deadline ve identityPreference yan yana alındı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Son Teslim Tarihi</Label>
                  <Input 
                    type="date" 
                    {...register("deadline")}
                    className={`bg-background/50 ${errors.deadline ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                  />
                  {errors.deadline && <p className="text-[10px] text-destructive mt-1">{errors.deadline.message}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Müşteri Kimlik Tercihi</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { val: "any", label: "Farketmez" },
                      { val: "verified", label: "Doğrulanmış" },
                      { val: "anonymous", label: "Anonim" },
                    ].map(({ val, label }) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setValue("identityPreference", val as "any"|"verified"|"anonymous", { shouldValidate: true })}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                          watchAll.identityPreference === val
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
                <Button type="button" onClick={() => append({ title: "", amount: "", deadline: "" })} variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors">
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
                      <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-50 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Teslimat Başlığı</Label>
                    <Input 
                      {...register(`milestones.${i}.title`)}
                      placeholder="örn. Arayüz Tasarımlarının Onayı" 
                      className={`bg-background text-sm ${errors.milestones?.[i]?.title ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                    />
                    {errors.milestones?.[i]?.title && <p className="text-[10px] text-destructive mt-1">{errors.milestones[i].title?.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Tutar (SUI)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...register(`milestones.${i}.amount`)}
                        placeholder="0.00" 
                        className={`bg-background text-sm font-mono ${errors.milestones?.[i]?.amount ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                      />
                      {errors.milestones?.[i]?.amount && <p className="text-[10px] text-destructive mt-1">{errors.milestones[i].amount?.message}</p>}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Tarih</Label>
                      <Input 
                        type="date" 
                        {...register(`milestones.${i}.deadline`)}
                        className={`bg-background text-sm ${errors.milestones?.[i]?.deadline ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary/50"}`} 
                      />
                      {errors.milestones?.[i]?.deadline && <p className="text-[10px] text-destructive mt-1">{errors.milestones[i].deadline?.message}</p>}
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
                <h2 className="text-5xl font-bold text-foreground font-mono">{parseFloat(totalAmountStr) > 0 ? totalAmountStr : "0.00"} <span className="text-2xl text-primary">SUI</span></h2>
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
                  {watchAll.milestones?.map((m, i) => m.title && (
                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors">
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
                  <h3 className="text-xl font-bold">{watchAll.title}</h3>
                  <p className="text-sm text-primary flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Taslak Oluşturuldu
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 overflow-hidden">
                   <p className="text-xs text-muted-foreground mb-1">Müşteri Cüzdanı</p>
                   {/* DEĞİŞTİRİLEN: Form verisi yerine doğrudan bağlı olan cüzdan adresini gösteriyoruz */}
                   <p className="text-sm font-mono truncate">{account?.address || "Bağlı Cüzdan Yok"}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                   <p className="text-xs text-muted-foreground mb-1">Bitiş Tarihi</p>
                   <p className="text-sm font-medium">{watchAll.deadline}</p>
                 </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Aşama Özeti</h4>
                <div className="space-y-2">
                  {watchAll.milestones?.map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
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
              type="button"
              onClick={() => setStep((p) => p - 1)} 
              disabled={step === 0 || isSubmitting} 
              variant="outline" 
              className="gap-2 px-6"
            >
              <ChevronLeft size={16} /> Geri
            </Button>

            {step < steps.length - 1 ? (
              <Button 
                type="button"
                onClick={handleNextStep} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 transition-all"
              >
                İleri <ChevronRight size={16} />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] text-primary-foreground gap-2 px-8 transition-all"
              >
                {isSubmitting ? (
                  <> İşleniyor... <Loader2 className="animate-spin" size={18} /> </>
                ) : (
                  <> Sözleşmeyi İmzala & Gönder <CheckCircle2 size={18} /> </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
