"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User, Wallet, Edit3, Save, Plus,
  X, ExternalLink, Eye, EyeOff, CheckCircle2,
  Trophy, Star, Hexagon, Shield, Loader2
} from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { useWorkSealTransactions } from "@/hooks/useWorkSealTransactions";
import { mistToSui } from "@/types";

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

  const { contracts, loading, isArbitrator } = useContracts(account?.address);
  const { registerArbitrator } = useWorkSealTransactions();
  const address = account?.address;

  const [arbitratorAddress, setArbitratorAddress] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterArbitrator = async () => {
    if (!arbitratorAddress) return;
    try {
      setIsRegistering(true);
      await registerArbitrator({ arbitrator_address: arbitratorAddress, max_jobs: 10 });
      alert("Hakem başarıyla kaydedildi!");
      setArbitratorAddress("");
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Gerçek On-Chain İstatistikler
  const completedAsFreelancer = contracts.filter(c => c.status === 2 && c.freelancer === address);
  const successfulJobs = completedAsFreelancer.length;
  const totalEarned = completedAsFreelancer.reduce((acc, c) => acc + BigInt(c.total_budget), 0n);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((p) => [...p, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil</h1>
          <p className="text-sm text-muted-foreground mt-1">Kimlik, yetenekler ve Web3 portföyün.</p>
        </div>
        <Button
          onClick={() => setEditing(!editing)}
          variant={editing ? "default" : "outline"}
          className={`gap-2 transition-all ${editing ? "bg-primary text-white shadow-lg" : "border-border/50 text-foreground hover:bg-secondary"}`}
        >
          {editing ? <><Save size={16} /> Değişiklikleri Kaydet</> : <><Edit3 size={16} /> Profili Düzenle</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sol Kolon - Kimlik ve Cüzdan */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 bg-card border-border/50 relative overflow-hidden group">
            {/* Arka plan glow */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-background">
                  {isAnonymous ? "?" : form.name ? form.name[0].toUpperCase() : <User size={40} />}
                </div>
                {!isAnonymous && form.name && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </div>

              {editing && !isAnonymous ? (
                <div className="w-full space-y-3 mb-2">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Adın Soyadın"
                    className="bg-secondary/50 border-border/50 text-center"
                  />
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Unvan (örn. Developer)"
                    className="bg-secondary/50 border-border/50 text-center text-sm"
                  />
                </div>
              ) : (
                <div className="mb-2 w-full">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="font-bold text-xl text-foreground">
                      {isAnonymous ? "Anonim Kullanıcı" : form.name || "İsim Eklenmedi"}
                    </h2>
                  </div>
                  {!isAnonymous && form.title && (
                     <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{form.title}</Badge>
                  )}
                  {isAnonymous && (
                    <Badge variant="outline" className="text-muted-foreground border-border/50 bg-secondary/50">Gizli Kimlik</Badge>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-6 bg-border/50 relative z-10" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Bağlı Cüzdan</p>
                    <p className="text-xs font-mono font-bold text-foreground">
                      {account ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : "0x269F...e605"}
                    </p>
                  </div>
                </div>
                <a href={account ? `https://suivision.xyz/account/${account.address}` : "#"} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-background">
                    <ExternalLink size={14} />
                  </Button>
                </a>
              </div>

              {/* SUI Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                  <p className="text-[10px] text-muted-foreground font-semibold mb-1">Başarılı İş</p>
                  <p className="font-mono font-bold text-green-500 text-lg">
                    {loading ? <Loader2 size={16} className="animate-spin inline-block" /> : successfulJobs}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-[10px] text-muted-foreground font-semibold mb-1">Kazanılan</p>
                  <p className="font-mono font-bold text-primary text-lg flex items-baseline justify-center gap-0.5">
                    {loading ? <Loader2 size={16} className="animate-spin inline-block" /> : mistToSui(totalEarned)}<span className="text-[10px]"></span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Anonimlik Toggle */}
          <Card className={`p-4 transition-all border ${isAnonymous ? "bg-secondary/30 border-border/50" : "bg-primary/5 border-primary/30"}`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${isAnonymous ? 'bg-background' : 'bg-primary/20 text-primary'}`}>
                      {isAnonymous ? <EyeOff size={16} className="text-muted-foreground" /> : <Eye size={16} />}
                   </div>
                   <div>
                      <p className="text-sm font-semibold">{isAnonymous ? "Anonim Mod Açık" : "Görünür Profil"}</p>
                   </div>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isAnonymous ? "bg-border" : "bg-primary"}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${isAnonymous ? "left-1" : "left-[22px]"}`} />
                </button>
             </div>
             <p className="text-[10px] text-muted-foreground mt-3">
               {isAnonymous ? "Müşteriler gerçel adını değil, sadece cüzdan adresini ve istatistiklerini görebilir." : "Platformdaki herkes adını, unvanını ve yeteneklerini görüntüleyebilir."}
             </p>
          </Card>
        </div>

        {/* Sağ Kolon - Bio, Yetenekler ve Portföy */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-card border-border/50">
            <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <User size={18} className="text-primary" /> Hakkımda
            </h2>
            {editing && !isAnonymous ? (
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Kendinden kısaca bahset..."
                className="bg-secondary/50 border-border/50 min-h-32 text-sm leading-relaxed"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAnonymous ? "Kullanıcı anonim kalmayı tercih etmiştir. Bio gizlidir." : form.bio || "Biyografi eklenmedi."}
              </p>
            )}
          </Card>

          <Card className="p-6 bg-card border-border/50">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                 <Hexagon size={18} className="text-primary" /> Yetenekler
               </h2>
             </div>
             
             <div className="flex flex-wrap gap-2 mb-4">
               {skills.length > 0 ? skills.map((s) => (
                 <Badge key={s} variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-secondary border border-border/50 backdrop-blur-sm gap-1.5">
                   {s}
                   {editing && (
                     <button onClick={() => removeSkill(s)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                       <X size={12} />
                     </button>
                   )}
                 </Badge>
               )) : (
                 <p className="text-sm text-muted-foreground">Henüz yetenek eklenmedi.</p>
               )}
             </div>

             {editing && (
               <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                 <Input
                   placeholder="Yeni yetenek (Örn: TypeScript)"
                   value={newSkill}
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && addSkill()}
                   className="bg-background border-border/50 text-sm w-64"
                 />
                 <Button onClick={addSkill} variant="secondary" className="gap-2">
                   <Plus size={14} /> Ekle
                 </Button>
               </div>
             )}
          </Card>

          {/* On-Chain Başarımlar */}
          <Card className="p-6 bg-card border-border/50">
            <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Trophy size={18} className="text-primary" /> On-Chain Başarımlar
            </h2>
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl bg-secondary/20 border border-dashed border-border/50">
              {successfulJobs > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                     <Trophy size={30} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Güvenilir Freelancer</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    {successfulJobs} sözleşmeyi başarıyla tamamladın.
                  </p>
                </>
              ) : (
                <>
                  <Trophy size={30} className="text-muted-foreground mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">Henüz on-chain başarım yok</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Sui ağında sözleşme imzalayıp tamamladıkça on-chain istatistiklerin gelişecek.
                  </p>
                </>
              )}
            </div>
          </Card>
          
          {/* Admin Bölümü - Sadece Hakem/Admin yetkisi olanlar görebilir */}
          {isArbitrator && (
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
              <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <Shield size={18} className="text-primary" /> Admin: Hakem Kaydı
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Sözleşmeyi yayınlayan (AdminCap sahibi) cüzdan ile yeni hakemler tanımlayabilirsiniz.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="0x... (Hakem olacak cüzdan adresi)"
                  value={arbitratorAddress}
                  onChange={(e) => setArbitratorAddress(e.target.value)}
                  className="bg-background border-border/50 text-sm flex-1 font-mono"
                />
                <Button 
                  onClick={handleRegisterArbitrator} 
                  disabled={isRegistering || !arbitratorAddress}
                  className="gap-2 bg-primary text-white"
                >
                  {isRegistering ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tanımla
                </Button>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}