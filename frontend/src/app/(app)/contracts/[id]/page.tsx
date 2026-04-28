"use client";

import { useState, use } from "react";
import { useContractDetails } from "@/hooks/useContractDetails";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Loader2,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Info,
  Scale,
  Gavel,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  User
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { mistToSui } from "@/types";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useWorkSealTransactions } from "@/hooks/useWorkSealTransactions";

const formatTimestamp = (ts: number | string) => {
  const date = new Date(Number(ts));
  return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;

  const { contract, loading, error } = useContractDetails(contractId);

  const account = useCurrentAccount();
  const { submitMilestone, approveAndReleaseFunds, rejectMilestone, takeJob, sendMessage, fundContract, raiseDispute, resolveDispute, sendPrivateMessage, resumeContractArbitrator } = useWorkSealTransactions();

  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [chatChannel, setChatChannel] = useState<"group" | "client_arb" | "freelancer_arb">("group");
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [proofForm, setProofForm] = useState({ link: "", notes: "" });
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const handleResolveDispute = async (winner: "client" | "freelancer") => {
    if (!contract) return;
    const winnerAddr = winner === "client" ? contract.client : contract.freelancer;
    if (!winnerAddr) return;

    try {
      setIsActionLoading(999);
      await resolveDispute({ 
        contract_id: contractId, 
        winner: winnerAddr
      });
      alert("Anlaşmazlık hakem tarafından çözüldü ve fonlar aktarıldı.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleResumeContract = async () => {
    if (!contract) return;
    try {
      setIsActionLoading(888);
      await resumeContractArbitrator({ contract_id: contractId });
      alert("Süreç devam ettiriliyor. Sözleşme tekrar aktif duruma getirildi.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const isClient = account?.address && contract?.client && account.address.toLowerCase() === contract.client.toLowerCase();
  const isFreelancer = account?.address && contract?.freelancer && account.address.toLowerCase() === contract.freelancer.toLowerCase();
  const isArbitrator = account?.address && contract?.arbitrator && account.address.toLowerCase() === contract.arbitrator.toLowerCase();

  const handleSubmitProof = async (milestoneIndex: number) => {
    if (!proofForm.link) {
      alert("Lütfen bir çalışma linki ekleyin.");
      return;
    }

    try {
      setIsSubmittingProof(true);
      await submitMilestone({
        contract_id: contractId,
        milestone_index: milestoneIndex,
        proof_link: proofForm.link,
        proof_notes: proofForm.notes,
      });
      
      setIsProofOpen(false);
      setProofForm({ link: "", notes: "" });
      alert("Başarılı! İş kanıtı zincire işlendi ve müşteri onayına gönderildi.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata oluştu: " + e.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleApprove = async (index: number) => {
    try {
      setIsActionLoading(index);
      await approveAndReleaseFunds({ contract_id: contractId, milestone_index: index });
      alert("Ödeme başarıyla serbest bırakıldı!");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (index: number) => {
    const reason = prompt("Revize isteme nedeninizi kısaca yazın:");
    if (!reason) return;
    
    try {
      setIsActionLoading(index);
      await rejectMilestone({ contract_id: contractId, milestone_index: index, reason });
      alert("Aşama reddedildi ve freelancer'a geri gönderildi.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleTakeJob = async () => {
    try {
      setIsSubmittingProof(true);
      await takeJob(contractId);
      alert("İş başarıyla alındı! Artık çalışmaya başlayabilirsin.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    try {
      setIsSendingMessage(true);
      if (chatChannel === "group") {
        await sendMessage({ contract_id: contractId, content: chatInput });
      } else {
        const target_role = chatChannel === "client_arb" ? 0 : 1;
        await sendPrivateMessage({ contract_id: contractId, content: chatInput, target_role });
      }
      setChatInput("");
      alert("Mesaj gönderildi!");
      window.location.reload();
    } catch (e: any) {
      alert("Mesaj gönderilemedi: " + e.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFund = async () => {
    if (!contract) return;
    try {
      setIsSubmittingProof(true); 
      await fundContract({ contract_id: contractId, amount: contract.total_budget });
      alert("Sözleşme başarıyla fonlandı! Escrow artık güvende.");
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    
    try {
      setIsSubmittingProof(true);
      await raiseDispute({ contract_id: contractId, reason: disputeReason });
      alert("Anlaşmazlık (İhtilaf) süreci başlatıldı. Platform yöneticileri sürece dahil edilecektir.");
      setIsDisputeOpen(false);
      window.location.reload();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (error || !contract) return (
    <div className="min-h-screen flex items-center justify-center text-destructive">
      Sözleşme bulunamadı veya yüklenirken bir hata oluştu.
    </div>
  );

  const mappedMilestones = contract.milestones?.map((m: any, i: number, arr: any[]) => {
    let status = 'pending';
    if (m.is_paid) {
      status = 'completed';
    } else if (m.is_completed) {
      status = 'awaiting_approval';
    } else if (i === 0 || arr[i - 1].is_paid) {
      status = 'in_progress';
    }
    return { ...m, status, originalIndex: i };
  });

  const activeMilestone = mappedMilestones?.find((m: any) => m.status === 'in_progress');

  const totalBudget = Number(contract.total_budget) || 0;
  const releasedAmount = contract.milestones
    ?.filter((m: any) => m.is_paid)
    .reduce((acc: number, m: any) => acc + Number(m.amount), 0) || 0;
  const lockedAmount = totalBudget - releasedAmount;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-2 py-10 space-y-0">
      
      {/* ── Page Header ── */}
      <div className="pb-10 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
              SÖZLEŞME: <span className="text-[#4FC3F7]/60">{contractId.slice(0,14)}...</span>
            </p>
            <Badge className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${
              contract.status === 0 ? "bg-yellow-500/10 text-yellow-500 border-none" :
              contract.status === 1 ? "bg-[#4FC3F7]/10 text-[#4FC3F7] border-none" :
              contract.status === 2 ? "bg-emerald-400/10 text-emerald-400 border-none" :
              contract.status === 3 ? "bg-destructive/10 text-destructive border-none" :
              "bg-muted text-muted-foreground border-none"
            }`}>
              {contract.status === 0 ? "ÖDEME BEKLİYOR" : 
               contract.status === 1 ? "ESCROW AKTİF" : 
               contract.status === 2 ? "TAMAMLANDI" : 
               contract.status === 3 ? "ANLAŞMAZLIK" : "İPTAL EDİLDİ"}
            </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            {contract.title}
          </h1>
        </div>
          
          <div className="flex flex-wrap gap-3">
            {isClient && contract.status === 0 && (
              <Button 
                onClick={handleFund}
                disabled={isSubmittingProof}
                className="h-10 px-6 bg-yellow-600 text-[#050810] font-bold text-sm hover:bg-yellow-700 gap-2 rounded-none"
              >
                {isSubmittingProof ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
                Sözleşmeyi Fonla ({mistToSui(contract.total_budget.toString())} SUI)
              </Button>
            )}

            <Button 
              className={`h-10 px-6 font-bold text-sm gap-2 rounded-none transition-colors ${activeTab === "chat" ? "bg-[#4FC3F7] text-[#050810] hover:bg-[#4FC3F7]/90" : "bg-card border border-border text-foreground hover:bg-white/5"}`}
              onClick={() => setActiveTab(activeTab === "chat" ? "details" : "chat")}
            >
              <MessageSquare size={16} /> 
              {activeTab === "chat" ? "Sözleşme Detayları" : "Mesaj Gönder"}
              {(contract.messages?.length || 0) > 0 && activeTab !== "chat" && (
                <Badge className="ml-2 bg-[#4FC3F7] text-[#050810] px-1.5 py-0.5 h-auto text-[10px] rounded-sm font-mono border-none">
                  {contract.messages.length}
                </Badge>
              )}
            </Button>

            {!contract.freelancer && !isClient && (
              <Button 
                onClick={handleTakeJob}
                className="h-10 px-6 bg-emerald-400 text-[#050810] font-bold text-sm hover:bg-emerald-500 gap-2 rounded-none"
              >
                <CheckCircle2 size={16} /> İşi Üstlen
              </Button>
            )}

            {isFreelancer && contract.status === 1 && activeMilestone && (
              <Button 
                onClick={() => setIsProofOpen(!isProofOpen)}
                className={`h-10 px-6 font-bold text-sm gap-2 rounded-none transition-colors ${!isProofOpen ? "bg-[#4FC3F7] text-[#050810] hover:bg-[#4FC3F7]/90" : "bg-card border border-border text-foreground hover:bg-white/5"}`}
              >
                <UploadCloud size={16} /> 
                {isProofOpen ? "Kanıt Panelini Kapat" : "İş Kanıtı Yükle"}
              </Button>
            )}

            {isFreelancer && contract.status === 0 && (
              <div className="flex items-center gap-2 px-4 h-10 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs font-mono font-bold animate-pulse">
                <Clock size={14} /> MÜŞTERİNİN ÖDEME YAPMASI BEKLENİYOR
              </div>
            )}

            {isFreelancer && contract.status === 1 && !activeMilestone && (
              <div className="flex items-center gap-2 px-4 h-10 bg-[#4FC3F7]/10 border border-[#4FC3F7]/20 text-[#4FC3F7] text-xs font-mono font-bold">
                <CheckCircle2 size={14} /> TÜM AŞAMALAR TAMAMLANDI
              </div>
            )}

            {(isClient || isFreelancer) && contract.status === 1 && (
              <Button 
                onClick={() => setIsDisputeOpen(true)}
                className="h-10 px-6 bg-transparent border border-destructive/50 text-destructive font-bold text-sm hover:bg-destructive/10 gap-2 rounded-none"
              >
                <ShieldAlert size={16} /> Sorun Bildir
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "chat" ? (
              <div className="flex flex-col h-[600px] border border-border bg-card shadow-2xl">
                <div className="p-4 border-b border-border bg-secondary/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#4FC3F7]" /> İLETİŞİM MERKEZİ
                    </p>
                    {contract.arbitrator && (
                      <Badge className="font-mono text-[10px] bg-[#4FC3F7]/5 text-[#4FC3F7] border border-[#4FC3F7]/20 rounded-sm">
                        HAKEM MÜDAHALE EDİYOR
                      </Badge>
                    )}
                  </div>

                  {/* Kanal Seçici (Sadece Hakem Atandığında Aktif) */}
                  {contract.arbitrator && (
                    <div className="flex gap-px bg-border">
                      <button 
                        onClick={() => setChatChannel("group")}
                        className={`flex-1 font-mono text-[10px] py-3 tracking-widest uppercase transition-all ${chatChannel === "group" ? "bg-[#4FC3F7] text-[#050810] font-bold" : "bg-card text-muted-foreground hover:bg-white/5"}`}
                      >
                        Genel Sohbet
                      </button>
                      
                      {(isClient || isArbitrator) && (
                        <button 
                          onClick={() => setChatChannel("client_arb")}
                          className={`flex-1 font-mono text-[10px] py-3 tracking-widest uppercase transition-all ${chatChannel === "client_arb" ? "bg-[#4FC3F7] text-[#050810] font-bold" : "bg-card text-muted-foreground hover:bg-white/5"}`}
                        >
                          Hakem & Müşteri
                        </button>
                      )}

                      {(isFreelancer || isArbitrator) && (
                        <button 
                          onClick={() => setChatChannel("freelancer_arb")}
                          className={`flex-1 font-mono text-[10px] py-3 tracking-widest uppercase transition-all ${chatChannel === "freelancer_arb" ? "bg-[#4FC3F7] text-[#050810] font-bold" : "bg-card text-muted-foreground hover:bg-white/5"}`}
                        >
                          Hakem & Freelancer
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Bilgilendirme Bannerı */}
                  {chatChannel !== "group" && (
                    <div className="bg-[#4FC3F7]/5 border border-[#4FC3F7]/20 p-3 text-center mb-4">
                      <p className="font-mono text-[10px] text-[#4FC3F7] uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <ShieldCheck size={12} /> BU KANAL SADECE HAKEM VE {chatChannel === "client_arb" ? "MÜŞTERİ" : "FREELANCER"} ARASINDA ÖZELDİR.
                      </p>
                    </div>
                  )}

                  {(() => {
                    const currentMessages = chatChannel === "group" 
                      ? contract.messages 
                      : (chatChannel === "client_arb" ? contract.client_arbitrator_messages : contract.freelancer_arbitrator_messages);

                    if (!currentMessages || currentMessages.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                          <span className="text-8xl font-black text-border mb-2 block">·</span>
                          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Henüz mesaj yok.</p>
                        </div>
                      );
                    }

                    return currentMessages.map((msg: any, i: number) => {
                      const isMe = account?.address?.toLowerCase() === msg.sender.toLowerCase();
                      const isArb = contract.arbitrator && msg.sender.toLowerCase() === contract.arbitrator.toLowerCase();
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[80%] p-4 text-sm ${
                            isMe ? "bg-[#4FC3F7] text-[#050810] font-medium" : 
                            (isArb ? "bg-destructive/10 border border-destructive/20 text-foreground" : "bg-secondary/50 border border-border text-foreground")
                          }`}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-2 mt-1 px-1">
                            {!isMe && <span className="text-[10px] font-mono text-muted-foreground">{isArb ? "HAKEM" : msg.sender.slice(0, 6)}...</span>}
                            <span className="text-[10px] text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="p-4 border-t border-border bg-card">
                  {isClient || isFreelancer || isArbitrator ? (
                    <>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={chatChannel === "group" ? "Genel kanala mesaj yaz..." : "Özel mesaj yaz..."}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          disabled={isSendingMessage}
                          className="bg-background border-border h-10 text-sm rounded-none focus-visible:ring-[#4FC3F7]"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !chatInput.trim()}
                          className="bg-[#4FC3F7] text-[#050810] h-10 px-6 font-bold rounded-none hover:bg-[#4FC3F7]/90 uppercase tracking-wider"
                        >
                          {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : "Gönder"}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-3 text-center font-mono uppercase tracking-widest">
                        {chatChannel === "group" 
                          ? "* Bu mesaj tüm taraflar tarafından görülebilir." 
                          : "* Bu mesaj sadece yetkili taraflara gösterilir."}
                      </p>
                    </>
                  ) : (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-center">
                      <p className="text-xs text-destructive font-bold font-mono tracking-widest flex items-center justify-center gap-2 uppercase">
                        <XCircle size={14} /> Mesaj göndermek için yetkiniz yok.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* İş Kanıtı Yükleme Paneli */}
                {isProofOpen && (
                  <div className="border border-[#4FC3F7]/50 bg-[#4FC3F7]/5 shadow-[0_0_20px_rgba(79,195,247,0.1)] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="px-8 py-5 border-b border-[#4FC3F7]/20 flex items-center gap-3">
                      <UploadCloud size={16} className="text-[#4FC3F7]" />
                      <p className="font-mono text-xs text-[#4FC3F7] uppercase tracking-widest font-bold">
                        İş Kanıtı (Proof of Work) Sun
                      </p>
                    </div>
                    
                    <div className="p-8 space-y-6">
                      <div>
                        <Label className="text-xs font-mono uppercase tracking-widest mb-3 block text-muted-foreground">Teslimat Linki</Label>
                        <div className="relative">
                          <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            placeholder="GitHub, Figma, Vercel veya Dosya Linki" 
                            value={proofForm.link}
                            onChange={(e) => setProofForm({...proofForm, link: e.target.value})}
                            className="pl-10 bg-background border-border focus-visible:ring-[#4FC3F7] h-12 rounded-none font-mono text-sm" 
                          />
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-wider">
                          * Müşterinin işi kontrol edebileceği bir URL adresi girin.
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-mono uppercase tracking-widest mb-3 block text-muted-foreground">Müşteriye Notlar</Label>
                        <Textarea 
                          placeholder="Neler yapıldı? Önemli detayları buraya yazabilirsiniz..." 
                          value={proofForm.notes}
                          onChange={(e) => setProofForm({...proofForm, notes: e.target.value})}
                          className="bg-background border-border focus-visible:ring-[#4FC3F7] min-h-32 resize-none rounded-none text-sm font-mono" 
                        />
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-[#4FC3F7]/20">
                        <Button variant="ghost" onClick={() => setIsProofOpen(false)} className="hover:bg-white/5 rounded-none font-mono uppercase tracking-wider text-xs">İptal</Button>
                        <Button 
                          onClick={() => handleSubmitProof(activeMilestone.originalIndex)}
                          disabled={isSubmittingProof}
                          className="gap-2 bg-[#4FC3F7] text-[#050810] hover:bg-[#4FC3F7]/90 px-8 h-10 font-bold rounded-none uppercase tracking-wider text-xs"
                        >
                          {isSubmittingProof ? (
                            <> <Loader2 size={16} className="animate-spin" /> İŞLEM YAPILIYOR...</>
                          ) : (
                            <> <CheckCircle2 size={16} /> KANITI ZİNCİRE İŞLE</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hakem Paneli (Sadece Anlaşmazlık Durumunda) */}
                {contract.status === 3 && (
                  <div className="border border-destructive/50 bg-destructive/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <Scale size={120} className="text-destructive" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between px-8 py-5 border-b border-destructive/20">
                        <p className="font-mono text-xs text-destructive uppercase tracking-widest font-bold flex items-center gap-2">
                          <Gavel size={14} /> HAKEM VE UYUŞMAZLIK YÖNETİMİ
                        </p>
                        {contract.arbitrator ? (
                          <Badge className="font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border-none rounded-sm px-2 py-0.5">BAĞIMSIZ HAKEM ATANDI</Badge>
                        ) : (
                          <Badge className="font-mono text-[10px] bg-destructive/10 text-destructive border-none rounded-sm px-2 py-0.5">HAKEM ATANIYOR...</Badge>
                        )}
                      </div>

                      {!contract.arbitrator ? (
                        <div className="p-12 text-center space-y-4">
                          <Loader2 className="animate-spin text-destructive mx-auto" size={32} />
                          <div className="space-y-1">
                            <p className="font-black text-xl text-destructive tracking-tight">SİSTEM HAKEM ATIYOR</p>
                            <p className="font-mono text-[10px] text-muted-foreground max-w-xs mx-auto uppercase tracking-widest">
                              Manipülasyonu önlemek için bağımsız bir hakem otomatik olarak atanmaktadır.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 space-y-6 text-center">
                           <div>
                             <h3 className="text-3xl font-black text-destructive tracking-tight">SİSTEM HAKEMİ ATANDI</h3>
                             <p className="font-mono text-xs text-foreground mt-2 uppercase tracking-widest">
                               BAĞIMSIZ SİSTEM HAKEMİ
                             </p>
                             <p className="font-mono text-[10px] text-muted-foreground mt-4 uppercase tracking-wider">
                               * Hakem ücreti (%2) otomatik olarak haksız bulunan tarafın bakiyesinden düşülecektir.
                             </p>
                           </div>

                           {account?.address?.toLowerCase() === contract.arbitrator?.toLowerCase() && (
                             <div className="pt-8 border-t border-destructive/20 max-w-xl mx-auto">
                               <p className="font-mono text-xs text-destructive font-bold mb-6 flex items-center justify-center gap-2 uppercase tracking-widest">
                                 <UserCheck size={14} /> KARAR VERME YETKİNİZ VAR
                               </p>
                               <div className="grid grid-cols-2 gap-4">
                                  <Button 
                                    onClick={() => handleResolveDispute("client")}
                                    variant="outline" 
                                    disabled={isActionLoading === 999}
                                    className="flex-col h-auto py-6 gap-2 border-destructive/30 hover:bg-destructive/10 rounded-none bg-background"
                                  >
                                    <span className="text-destructive font-black text-lg tracking-tight">MÜŞTERİ HAKLI</span>
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">İade Et (%2 Kesintiyle)</span>
                                  </Button>
                                  <Button 
                                    onClick={() => handleResolveDispute("freelancer")}
                                    disabled={isActionLoading === 999}
                                    className="flex-col h-auto py-6 gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-none text-[#050810]"
                                  >
                                    <span className="font-black text-lg tracking-tight">FREELANCER HAKLI</span>
                                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Öde (%2 Kesintiyle)</span>
                                  </Button>
                               </div>
                               <div className="mt-4 pt-4 border-t border-destructive/20">
                                  <Button 
                                    onClick={handleResumeContract}
                                    disabled={isActionLoading === 888}
                                    className="w-full h-12 gap-2 bg-transparent border border-destructive text-destructive hover:bg-destructive/10 rounded-none font-bold uppercase tracking-wider text-xs"
                                  >
                                    {isActionLoading === 888 ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                                    ANLAŞMAZLIĞI KAPAT, İŞİ DEVAM ETTİR
                                  </Button>
                                  <p className="font-mono text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-widest">
                                    * Bu seçenek iş henüz teslim edilmediyse veya revize gerekiyorsa kullanılır.
                                  </p>
                               </div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border border-border bg-card">
                  <div className="px-8 py-5 border-b border-border">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} className="text-[#4FC3F7]" /> İŞ TANIMI
                    </p>
                  </div>
                  <div className="p-8">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                      {contract.description}
                    </p>
                  </div>
                </div>
              </>
            )}

              <div className="border border-border bg-card">
                <div className="flex items-center justify-between px-8 py-5 border-b border-border">
                   <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                     <Clock size={14} className="text-[#4FC3F7]" /> İŞ AŞAMALARI
                   </p>
                   <Badge className="font-mono text-[10px] bg-secondary text-foreground rounded-sm px-2 py-0.5 border-none">
                     {contract.milestones?.length} AŞAMA
                   </Badge>
                </div>
                
                <div className="divide-y divide-border">
                  {mappedMilestones?.map((m: any, i: number) => (
                    <div key={i} className={`p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all relative group ${
                      m.status === 'completed' ? 'bg-emerald-500/5 opacity-80' : 
                      m.status === 'awaiting_approval' ? 'bg-yellow-500/5' :
                      m.status === 'in_progress' ? 'bg-[#4FC3F7]/5' : 
                      'bg-transparent'
                    }`}>
                      {m.status === 'in_progress' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4FC3F7]"></div>
                          <div className="absolute -inset-px bg-gradient-to-r from-[#4FC3F7]/10 to-transparent blur-sm" />
                        </>
                      )}
                      {m.status === 'awaiting_approval' && (
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                      )}
                      
                      <div className="flex items-start gap-4 relative z-10 flex-1">
                        <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 mt-1 font-mono font-bold text-xs ${
                          m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                          m.status === 'awaiting_approval' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          m.status === 'in_progress' ? 'bg-[#4FC3F7]/20 text-[#4FC3F7] animate-pulse border border-[#4FC3F7]/30' :
                          'bg-secondary text-muted-foreground border border-border'
                        }`}>
                          {m.status === 'completed' ? <CheckCircle2 size={14} /> : <span>{i+1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xl font-bold tracking-tight ${m.status === 'completed' ? 'text-emerald-500/80 line-through' : 'text-foreground'}`}>
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="font-mono text-[10px] rounded-sm px-2 py-0.5 border-none bg-background text-muted-foreground uppercase tracking-widest">
                              {m.status === 'completed' ? 'ÖDENDİ' : 
                               m.status === 'awaiting_approval' ? 'ONAY BEKLENİYOR' : 
                               m.status === 'in_progress' ? 'AKTİF' : 'BEKLEMEDE'}
                            </Badge>
                          </div>
                          
                          {m.proof_link && (
                            <div className="mt-6 p-6 bg-background border border-border">
                               <div className="flex items-center justify-between mb-4">
                                 <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2"><UploadCloud size={14} className="text-[#4FC3F7]"/> TESLİM EDİLEN KANIT</p>
                                 <Badge className="font-mono text-[10px] bg-[#4FC3F7]/10 text-[#4FC3F7] rounded-sm border-none uppercase">ZİNCİR VERİSİ</Badge>
                               </div>
                               <a 
                                 href={m.proof_link} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="text-xs text-[#4FC3F7] hover:underline flex items-center gap-2 font-mono break-all bg-[#4FC3F7]/5 p-3 border border-[#4FC3F7]/20"
                               >
                                 <ExternalLink size={14}/> {m.proof_link}
                               </a>
                               {m.proof_notes && (
                                 <div className="mt-4 pt-4 border-t border-border">
                                   <p className="text-sm text-foreground italic leading-relaxed font-medium">"{m.proof_notes}"</p>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 relative z-10 shrink-0 min-w-fit">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-black text-3xl tracking-tighter text-foreground">{mistToSui(m.amount)} SUI</span>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Aşama Bütçesi</span>
                        </div>
                        
                        {isClient && m.status === 'awaiting_approval' && (
                          <div className="flex items-center gap-2 mt-2">
                             <Button 
                                onClick={() => handleReject(i)}
                                disabled={isActionLoading === i}
                                className="bg-transparent border border-destructive text-destructive hover:bg-destructive/10 h-10 px-4 text-xs font-bold rounded-none uppercase tracking-wider"
                             >
                               {isActionLoading === i ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} className="mr-2" />}
                               Revize İste
                             </Button>
                             <Button 
                                onClick={() => handleApprove(i)}
                                disabled={isActionLoading === i}
                                className="bg-emerald-400 text-[#050810] hover:bg-emerald-500 h-10 px-6 text-xs font-bold rounded-none uppercase tracking-wider"
                             >
                               {isActionLoading === i ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} className="mr-2" />}
                               Onayla
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>

          <div className="space-y-6">
            <div className="border border-[#4FC3F7]/50 bg-[#4FC3F7]/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Shield size={120} className="text-[#4FC3F7]" />
              </div>
              <div className="px-8 py-5 border-b border-[#4FC3F7]/20 relative z-10">
                <p className="font-mono text-xs text-[#4FC3F7] uppercase tracking-widest flex items-center gap-2 font-bold">
                  <Shield size={14} /> ESCROW BAKİYESİ
                </p>
              </div>
              <div className="p-8 relative z-10">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter text-foreground">
                    {mistToSui(totalBudget)}
                  </span>
                  <span className="text-xl text-[#4FC3F7] font-bold">SUI</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-muted-foreground uppercase tracking-widest pt-6 border-t border-[#4FC3F7]/20">
                  <div className="flex justify-between">
                    <span>Toplam Bütçe:</span>
                    <span className="text-foreground">{mistToSui(totalBudget)} SUI</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Serbest Bırakılan:</span>
                    <span>{mistToSui(releasedAmount)} SUI</span>
                  </div>
                  <div className="flex justify-between text-[#4FC3F7]">
                    <span>Kilitli Kalan:</span>
                    <span>{mistToSui(lockedAmount)} SUI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card flex-1">
              <div className="px-8 py-5 border-b border-border">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-[#4FC3F7]" /> ZİNCİR AKTİVİTELERİ
                </p>
              </div>
              <div className="p-8 space-y-6 relative before:absolute before:inset-0 before:ml-[51px] before:h-full before:w-px before:bg-border">
                {(() => {
                  const events = [];
                  
                  // 1. Başlangıç
                  events.push({
                    id: 'created',
                    title: 'Sözleşme Başlatıldı',
                    desc: 'Sözleşme şartları on-chain kaydedildi.',
                    time: contract.created_at,
                    icon: <FileText size={14} className="text-[#4FC3F7]" />,
                    status: 'success'
                  });

                  // 2. Fonlama
                  if (contract.status >= 1) {
                    events.push({
                      id: 'funded',
                      title: 'Escrow Fonlandı',
                      desc: `${mistToSui(contract.total_budget)} SUI güvenli kasaya alındı.`,
                      time: contract.created_at + 1000,
                      icon: <Shield size={14} className="text-[#4FC3F7]" />,
                      status: 'success'
                    });
                  }

                  // 3. Ödemeler ve Teslimatlar
                  contract.milestones.forEach((m, idx) => {
                    if (m.is_paid) {
                      events.push({
                        id: `paid-${idx}`,
                        title: 'Ödeme Yapıldı',
                        desc: `${m.title} aşaması için fonlar serbest bırakıldı.`,
                        time: contract.created_at + 2000 + idx,
                        icon: <CheckCircle2 size={14} className="text-emerald-400" />,
                        status: 'success'
                      });
                    } else if (m.is_completed) {
                      events.push({
                        id: `delivered-${idx}`,
                        title: 'İş Teslim Edildi',
                        desc: `${m.title} aşaması tamamlandı, onay bekleniyor.`,
                        time: contract.created_at + 1500 + idx,
                        icon: <UploadCloud size={14} className="text-[#4FC3F7]" />,
                        status: 'pending'
                      });
                    }
                  });

                  // 4. Hakem Atandı (Eğer varsa)
                  if (contract.arbitrator) {
                    events.push({
                      id: 'arbitrator-assigned',
                      title: 'Bağımsız Hakem Atandı',
                      desc: 'Uyuşmazlık çözümü için sistem tarafından tarafsız bir hakem görevlendirildi.',
                      time: contract.dispute_history[0]?.timestamp || contract.created_at + 5000,
                      icon: <Scale size={14} className="text-destructive" />,
                      status: 'danger'
                    });
                  }

                  // 5. Anlaşmazlıklar
                  contract.dispute_history.forEach((d, idx) => {
                    events.push({
                      id: `dispute-${idx}`,
                      title: 'İhtilaf Başlatıldı',
                      desc: d.reason,
                      time: d.timestamp,
                      icon: <AlertTriangle size={14} className="text-destructive" />,
                      status: 'error'
                    });
                  });

                  // 6. Hakem Kararları
                  if (contract.status === 1 && contract.dispute_history.length > 0) {
                    events.push({
                      id: 'resumed',
                      title: 'Hakem Kararı: İşin Devamı',
                      desc: 'Hakem tarafları dinledi ve işin kaldığı yerden devam etmesine karar verdi.',
                      time: Date.now(), // Mevcut durum için yaklaşık
                      icon: <RotateCcw size={14} className="text-[#4FC3F7]" />,
                      status: 'success'
                    });
                  }

                  if (contract.status === 2 && contract.dispute_history.length > 0) {
                    events.push({
                      id: 'dispute-resolved',
                      title: 'Hakem Kararı: Uyuşmazlık Çözüldü',
                      desc: 'Hakem nihai kararını verdi ve ödemeyi uygun tarafa aktardı.',
                      time: Date.now(), // Mevcut durum için yaklaşık
                      icon: <ShieldCheck size={14} className="text-emerald-400" />,
                      status: 'success'
                    });
                  }

                  // 7. Tamamlanma (Eğer bittiyse)
                  if (contract.status === 2) {
                    events.push({
                      id: 'completed',
                      title: 'Sözleşme Tamamlandı',
                      desc: 'Tüm süreç başarıyla sonuçlandırıldı.',
                      time: Date.now(), // Yaklaşık
                      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
                      status: 'success'
                    });
                  }

                  return events.sort((a, b) => b.time - a.time).map((event) => (
                    <div key={event.id} className="relative flex items-start group">
                      <div className={`flex items-center justify-center w-10 h-10 border ${event.status === 'error' || event.status === 'danger' ? 'border-destructive bg-destructive/10' : 'border-border bg-card'} shrink-0 z-10 mr-6`}>
                        {event.icon}
                      </div>
                      <div className={`flex-1 p-4 border border-border ${event.status === 'error' || event.status === 'danger' ? 'bg-destructive/5 border-destructive/20' : 'bg-background'} transition-colors`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${event.status === 'error' || event.status === 'danger' ? 'text-destructive' : 'text-foreground'}`}>{event.title}</span>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">{formatTimestamp(event.time)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anlaşmazlık Başlatma Dialogu */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent className="sm:max-w-[500px] border border-destructive/50 bg-background rounded-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-destructive/5 px-8 py-6 border-b border-destructive/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-none border border-destructive flex items-center justify-center mb-6 bg-background">
              <AlertTriangle className="text-destructive" size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-destructive tracking-tight uppercase">İhtilaf Başlat</DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase tracking-widest mt-4">
              Bu işlemi başlattığınızda sözleşme dondurulur ve platform yöneticileri hakem olarak sürece dahil olur. 
            </DialogDescription>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">Anlaşmazlık Nedeni</Label>
              <Textarea 
                id="reason"
                placeholder="Örn: İş zamanında teslim edilmedi veya kriterlere uygun değil..." 
                className="min-h-[140px] bg-secondary/20 border-border focus-visible:ring-destructive rounded-none text-sm font-mono"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#4FC3F7]/5 text-[10px] font-mono text-[#4FC3F7] border border-[#4FC3F7]/20 uppercase tracking-widest leading-relaxed">
               <Info size={16} className="shrink-0 text-[#4FC3F7]" />
               <p>İhtilaf başlatıldıktan sonra platform hakemleri her iki tarafın sunduğu kanıtları ve iş geçmişini inceleyerek fonların kime aktarılacağına karar verir.</p>
            </div>
          </div>

          <div className="p-8 pt-0 flex gap-4">
            <Button variant="outline" onClick={() => setIsDisputeOpen(false)} className="flex-1 rounded-none border-border font-mono uppercase tracking-widest text-xs h-12">Vazgeç</Button>
            <Button 
              variant="destructive" 
              className="flex-[2] rounded-none gap-2 font-bold uppercase tracking-widest text-xs h-12"
              onClick={handleDispute}
              disabled={isSubmittingProof || !disputeReason.trim()}
            >
              {isSubmittingProof ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              Resmi İhtilaf Başlat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}