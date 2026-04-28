"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Wallet, Edit3, Save, Plus,
  X, ExternalLink, Eye, EyeOff, CheckCircle2,
  Trophy, Shield, Loader2, Hexagon
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
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="border-b border-border px-10 pt-10 pb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">
            KİMLİK & PORTFÖY
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none text-foreground">
            Profil
          </h1>
        </div>
        <Button
          onClick={() => setEditing(!editing)}
          className={`h-10 px-8 font-bold text-sm transition-all rounded-none ${editing ? "bg-[#4FC3F7] text-[#050810] hover:bg-[#4FC3F7]/90" : "bg-card text-foreground border border-border hover:bg-white/[0.05]"} gap-2`}
        >
          {editing ? <><Save size={16} /> Kaydet</> : <><Edit3 size={16} /> Düzenle</>}
        </Button>
      </div>

      <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
        
        {/* Sol Kolon - Kimlik ve Cüzdan */}
        <div className="md:col-span-1 space-y-px">
          <div className="bg-card p-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-white/[0.05] border border-border flex items-center justify-center text-foreground text-3xl font-bold font-mono">
                {isAnonymous ? "?" : form.name ? form.name[0].toUpperCase() : <User size={32} className="text-muted-foreground" />}
              </div>
              {!isAnonymous && form.name && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4FC3F7]/10 flex items-center justify-center border border-[#4FC3F7]/30">
                  <CheckCircle2 size={16} className="text-[#4FC3F7]" />
                </div>
              )}
            </div>

            {editing && !isAnonymous ? (
              <div className="w-full space-y-3 mb-4">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Adın Soyadın"
                  className="bg-background border-border text-center font-mono text-sm h-10 focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
                />
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Unvan (örn. Developer)"
                  className="bg-background border-border text-center font-mono text-xs h-10 focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
                />
              </div>
            ) : (
              <div className="mb-4 w-full">
                <h2 className="font-bold text-2xl text-foreground mb-2">
                  {isAnonymous ? "Anonim Kullanıcı" : form.name || "İsim Eklenmedi"}
                </h2>
                {!isAnonymous && form.title && (
                   <span className="font-mono text-[10px] px-2 py-1 bg-white/[0.05] text-muted-foreground border border-border uppercase tracking-wider">
                     {form.title}
                   </span>
                )}
                {isAnonymous && (
                  <span className="font-mono text-[10px] px-2 py-1 bg-background text-muted-foreground border border-border uppercase tracking-wider">
                    Gizli Kimlik
                  </span>
                )}
              </div>
            )}

            <div className="w-full mt-6 pt-6 border-t border-border">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-background border border-border">
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-2">
                      <Wallet size={12} /> Cüzdan
                    </p>
                    <p className="text-xs font-mono font-bold text-foreground">
                      {account ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : "Bağlı Değil"}
                    </p>
                  </div>
                  <a href={account ? `https://suivision.xyz/account/${account.address}` : "#"} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/[0.05] rounded-none">
                      <ExternalLink size={14} />
                    </Button>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background border border-border text-center">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Başarılı İş</p>
                    <p className="font-mono font-bold text-foreground text-xl">
                      {loading ? <Loader2 size={16} className="animate-spin inline-block text-muted-foreground" /> : successfulJobs}
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border text-center">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Kazanılan</p>
                    <p className="font-mono font-bold text-[#4FC3F7] text-xl flex items-baseline justify-center gap-1">
                      {loading ? <Loader2 size={16} className="animate-spin inline-block text-[#4FC3F7]" /> : mistToSui(totalEarned)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 flex items-center justify-center border ${isAnonymous ? 'bg-background border-border text-muted-foreground' : 'bg-[#4FC3F7]/10 border-[#4FC3F7]/20 text-[#4FC3F7]'}`}>
                      {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                   </div>
                   <p className="text-xs font-bold font-mono uppercase tracking-widest">{isAnonymous ? "Anonim Mod" : "Görünür Profil"}</p>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-10 h-5 relative border ${isAnonymous ? "bg-background border-border" : "bg-[#4FC3F7] border-[#4FC3F7]"}`}
                >
                  <div className={`w-3 h-3 bg-white absolute top-[3px] transition-all ${isAnonymous ? "left-1 bg-muted-foreground" : "left-[22px] bg-[#050810]"}`} />
                </button>
             </div>
             <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
               {isAnonymous ? "> Cüzdan adresi harici tüm bilgiler gizlenir." : "> Profil detayların platformda herkese açık olarak yayınlanır."}
             </p>
          </div>
        </div>

        {/* Sağ Kolon - Bio, Yetenekler ve Portföy */}
        <div className="md:col-span-2 space-y-px">
          <div className="bg-card p-8">
            <h2 className="text-xs font-mono font-bold mb-6 text-foreground flex items-center gap-2 uppercase tracking-widest">
              <User size={14} className="text-[#4FC3F7]" /> Hakkımda
            </h2>
            {editing && !isAnonymous ? (
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Kendinden kısaca bahset..."
                className="bg-background border-border min-h-32 text-sm leading-relaxed font-mono focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                {isAnonymous ? "Kullanıcı anonim kalmayı tercih etmiştir. Bio gizlidir." : form.bio || "Biyografi eklenmedi."}
              </p>
            )}
          </div>

          <div className="bg-card p-8">
             <h2 className="text-xs font-mono font-bold mb-6 text-foreground flex items-center gap-2 uppercase tracking-widest">
               <Hexagon size={14} className="text-[#4FC3F7]" /> Yetenekler
             </h2>
             
             <div className="flex flex-wrap gap-2">
               {skills.length > 0 ? skills.map((s) => (
                 <div key={s} className="px-3 py-1.5 text-xs font-mono bg-background border border-border flex items-center gap-2">
                   {s}
                   {editing && (
                     <button onClick={() => removeSkill(s)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                       <X size={12} />
                     </button>
                   )}
                 </div>
               )) : (
                 <p className="text-xs font-mono text-muted-foreground">Henüz yetenek eklenmedi.</p>
               )}
             </div>

             {editing && (
               <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                 <Input
                   placeholder="Yeni yetenek (Örn: Move)"
                   value={newSkill}
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && addSkill()}
                   className="bg-background border-border text-sm w-64 h-10 font-mono focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50"
                 />
                 <Button onClick={addSkill} className="gap-2 bg-white/[0.05] border border-border text-foreground hover:bg-white/[0.1] rounded-none">
                   <Plus size={14} /> Ekle
                 </Button>
               </div>
             )}
          </div>

          {/* On-Chain Başarımlar */}
          <div className="bg-card p-8">
            <h2 className="text-xs font-mono font-bold mb-6 text-foreground flex items-center gap-2 uppercase tracking-widest">
              <Trophy size={14} className="text-[#4FC3F7]" /> On-Chain Başarımlar
            </h2>
            <div className="flex flex-col items-center justify-center py-10 text-center bg-background border border-border">
              {successfulJobs > 0 ? (
                <>
                  <div className="w-16 h-16 bg-[#4FC3F7]/10 flex items-center justify-center mb-4 border border-[#4FC3F7]/20">
                     <Trophy size={24} className="text-[#4FC3F7]" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-widest mb-2">Güvenilir Freelancer</h3>
                  <p className="text-xs font-mono text-muted-foreground max-w-sm">
                    {successfulJobs} sözleşmeyi başarıyla tamamladın.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/[0.02] border border-border flex items-center justify-center mb-4">
                    <Trophy size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground max-w-sm">
                    Henüz on-chain başarım bulunmuyor.
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Admin Bölümü */}
          {isArbitrator && (
            <div className="bg-card p-8 border-l-2 border-l-[#4FC3F7]">
              <h2 className="text-xs font-mono font-bold mb-4 text-[#4FC3F7] flex items-center gap-2 uppercase tracking-widest">
                <Shield size={14} /> Admin: Hakem Kaydı
              </h2>
              <p className="text-xs font-mono text-muted-foreground mb-6">
                Sözleşmeyi yayınlayan cüzdan ile yeni hakemler tanımlayabilirsiniz.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="0x... (Cüzdan Adresi)"
                  value={arbitratorAddress}
                  onChange={(e) => setArbitratorAddress(e.target.value)}
                  className="bg-background border-border text-sm flex-1 font-mono focus-visible:ring-0 focus-visible:border-[#4FC3F7]/50 rounded-none h-10"
                />
                <Button 
                  onClick={handleRegisterArbitrator} 
                  disabled={isRegistering || !arbitratorAddress}
                  className="gap-2 bg-[#4FC3F7] text-[#050810] rounded-none hover:bg-[#4FC3F7]/90 h-10 px-8"
                >
                  {isRegistering ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tanımla
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}