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
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Ana Aksiyon */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
              <Badge className={`${
                contract.status === 0 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                contract.status === 1 ? "bg-primary/10 text-primary border-primary/20" :
                contract.status === 2 ? "bg-green-500/10 text-green-500 border-green-500/20" :
                contract.status === 3 ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-muted text-muted-foreground"
              } border`}>
                {contract.status === 0 ? "Ödeme Bekliyor" : 
                 contract.status === 1 ? "Escrow Aktif" : 
                 contract.status === 2 ? "Tamamlandı" : 
                 contract.status === 3 ? "Anlaşmazlık (Dispute)" : "İptal Edildi"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText size={14} /> Sözleşme ID: <span className="font-mono text-foreground/80">{contractId}</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            {isClient && contract.status === 0 && (
              <Button 
                onClick={handleFund}
                disabled={isSubmittingProof}
                className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)] animate-pulse"
              >
                {isSubmittingProof ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
                Sözleşmeyi Fonla ({mistToSui(contract.total_budget.toString())} SUI)
              </Button>
            )}

            <Button 
              variant={activeTab === "chat" ? "default" : "outline"} 
              className={`gap-2 border-border/50 ${activeTab === "chat" ? "bg-primary text-white" : ""}`}
              onClick={() => setActiveTab(activeTab === "chat" ? "details" : "chat")}
            >
              <MessageSquare size={16} /> 
              {activeTab === "chat" ? "Sözleşme Detayları" : "Mesaj Gönder"}
              {(contract.messages?.length || 0) > 0 && activeTab !== "chat" && (
                <Badge className="ml-1 bg-primary text-white px-1.5 py-0.5 h-auto text-[10px]">
                  {contract.messages.length}
                </Badge>
              )}
            </Button>

            {!contract.freelancer && !isClient && (
              <Button 
                onClick={handleTakeJob}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                <CheckCircle2 size={16} /> İşi Üstlen
              </Button>
            )}

            {isFreelancer && contract.status === 1 && activeMilestone && (
              <Button 
                onClick={() => setIsProofOpen(!isProofOpen)}
                variant={isProofOpen ? "outline" : "default"}
                className={`gap-2 transition-all ${!isProofOpen ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "border-border/50"}`}
              >
                <UploadCloud size={16} /> 
                {isProofOpen ? "Kanıt Panelini Kapat" : "İş Kanıtı Yükle"}
              </Button>
            )}

            {isFreelancer && contract.status === 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-xs font-medium animate-pulse">
                <Clock size={14} /> Müşterinin Ödeme Yapması Bekleniyor
              </div>
            )}

            {isFreelancer && contract.status === 1 && !activeMilestone && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 text-xs font-medium">
                <CheckCircle2 size={14} /> Tüm Aşamalar Tamamlandı
              </div>
            )}

            {(isClient || isFreelancer) && contract.status === 1 && (
              <Button 
                onClick={() => setIsDisputeOpen(true)}
                variant="ghost"
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <ShieldAlert size={16} /> Sorun Bildir
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "chat" ? (
              <Card className="flex flex-col h-[600px] border-border/50 bg-card overflow-hidden shadow-xl">
                <div className="p-4 border-b border-border/50 bg-secondary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare size={16} className="text-primary" /> İletişim Merkezi
                    </h3>
                    {contract.arbitrator && (
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                        Hakem Müdahale Ediyor
                      </Badge>
                    )}
                  </div>

                  {/* Kanal Seçici (Sadece Hakem Atandığında Aktif) */}
                  {contract.arbitrator && (
                    <div className="flex gap-1 p-1 bg-background/50 rounded-lg border border-border/50">
                      <button 
                        onClick={() => setChatChannel("group")}
                        className={`flex-1 text-[10px] py-1.5 rounded-md transition-all ${chatChannel === "group" ? "bg-primary text-white shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
                      >
                        Genel Sohbet
                      </button>
                      
                      {(isClient || isArbitrator) && (
                        <button 
                          onClick={() => setChatChannel("client_arb")}
                          className={`flex-1 text-[10px] py-1.5 rounded-md transition-all ${chatChannel === "client_arb" ? "bg-primary text-white shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
                        >
                          Hakem & Müşteri
                        </button>
                      )}

                      {(isFreelancer || isArbitrator) && (
                        <button 
                          onClick={() => setChatChannel("freelancer_arb")}
                          className={`flex-1 text-[10px] py-1.5 rounded-md transition-all ${chatChannel === "freelancer_arb" ? "bg-primary text-white shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
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
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center mb-4">
                      <p className="text-[10px] text-primary font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck size={12} /> Bu kanal sadece Hakem ve {chatChannel === "client_arb" ? "Müşteri" : "Freelancer"} arasında özeldir.
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
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                             <MessageSquare size={24} />
                          </div>
                          <p className="text-sm">Henüz mesaj yok. İlk mesajı siz gönderin.</p>
                        </div>
                      );
                    }

                    return currentMessages.map((msg: any, i: number) => {
                      const isMe = account?.address?.toLowerCase() === msg.sender.toLowerCase();
                      const isArb = contract.arbitrator && msg.sender.toLowerCase() === contract.arbitrator.toLowerCase();
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            isMe ? "bg-primary text-white rounded-tr-none shadow-sm" : 
                            (isArb ? "bg-destructive/10 border border-destructive/20 text-foreground rounded-tl-none" : "bg-secondary text-foreground rounded-tl-none shadow-sm")
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

                <div className="p-4 border-t border-border/50 bg-secondary/10">
                  {isClient || isFreelancer || isArbitrator ? (
                    <>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={chatChannel === "group" ? "Genel kanala mesaj yaz..." : "Özel mesaj yaz..."}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          disabled={isSendingMessage}
                          className="bg-background border-border/50 h-10 text-sm"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !chatInput.trim()}
                          className="bg-primary text-white h-10 px-6 font-semibold"
                        >
                          {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : "Gönder"}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                        {chatChannel === "group" 
                          ? "Not: Bu mesaj tüm taraflar tarafından görülebilir." 
                          : "Not: Bu mesaj blockchain üzerine şifreli olmasa da sadece yetkili taraflara gösterilir."}
                      </p>
                    </>
                  ) : (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                      <p className="text-xs text-destructive font-medium flex items-center justify-center gap-2">
                        <XCircle size={14} /> Mesaj göndermek için yetkiniz bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <>
                {/* İş Kanıtı Yükleme Paneli */}
                {isProofOpen && (
                  <Card className="p-6 bg-primary/5 border-primary/40 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300 ring-1 ring-primary/20">
                    <div className="flex items-center gap-3 mb-4 border-b border-primary/10 pb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <UploadCloud size={24} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">İş Kanıtı (Proof of Work) Sun</h2>
                        <p className="text-xs text-muted-foreground">Teslimat bilgilerini girerek onaya gönder.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Teslimat Linki</Label>
                        <div className="relative">
                          <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            placeholder="GitHub, Figma, Vercel veya Dosya Linki" 
                            value={proofForm.link}
                            onChange={(e) => setProofForm({...proofForm, link: e.target.value})}
                            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/50 h-11" 
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                          * Müşterinin işi kontrol edebileceği bir URL adresi girin.
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Müşteriye Notlar</Label>
                        <Textarea 
                          placeholder="Neler yapıldı? Önemli detayları buraya yazabilirsiniz..." 
                          value={proofForm.notes}
                          onChange={(e) => setProofForm({...proofForm, notes: e.target.value})}
                          className="bg-background/50 border-border/50 focus-visible:ring-primary/50 min-h-32 resize-none" 
                        />
                      </div>
                      <div className="pt-2 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsProofOpen(false)} className="hover:bg-secondary">İptal</Button>
                        <Button 
                          onClick={() => handleSubmitProof(activeMilestone.originalIndex)}
                          disabled={isSubmittingProof}
                          className="gap-2 bg-primary text-white hover:bg-primary/90 px-6 h-11 font-semibold shadow-lg shadow-primary/20"
                        >
                          {isSubmittingProof ? (
                            <> <Loader2 size={18} className="animate-spin" /> İşlem Yapılıyor...</>
                          ) : (
                            <> <CheckCircle2 size={18} /> Kanıtı Zincire İşle</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Hakem Paneli (Sadece Anlaşmazlık Durumunda) */}
                {contract.status === 3 && (
                  <Card className="p-6 bg-card border-destructive/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Scale size={80} className="text-destructive" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Gavel size={20} className="text-destructive" /> Hakem ve Uyuşmazlık Yönetimi
                        </h2>
                        {contract.arbitrator ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Bağımsız Hakem Atandı</Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive border-destructive/30">Hakem Atanıyor...</Badge>
                        )}
                      </div>

                      {!contract.arbitrator ? (
                        <div className="py-8 text-center space-y-4">
                          <Loader2 className="animate-spin text-destructive mx-auto" size={32} />
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">Sistem Hakem Atıyor</p>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                              Manipülasyonu önlemek için bağımsız bir hakem otomatik olarak atanmaktadır. Lütfen bekleyin.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 text-center py-6">
                           <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                             <Scale size={40} className="text-green-500" />
                           </div>
                           <div>
                             <h3 className="text-lg font-bold">Sistem Hakemi Atandı</h3>
                             <p className="text-sm font-semibold mt-2 text-primary">
                               Bağımsız Sistem Hakemi
                             </p>
                             <p className="text-[10px] text-muted-foreground mt-3 italic">
                               * Hakem ücreti (%2) otomatik olarak haksız bulunan tarafın bakiyesinden düşülecektir.
                             </p>
                           </div>

                           {account?.address?.toLowerCase() === contract.arbitrator?.toLowerCase() && (
                             <div className="pt-8 border-t border-border/50 max-w-md mx-auto">
                               <p className="text-sm font-semibold mb-6 flex items-center justify-center gap-2">
                                 <UserCheck size={16} className="text-primary" /> Karar Verme Yetkiniz Var
                               </p>
                               <div className="grid grid-cols-2 gap-4">
                                  <Button 
                                    onClick={() => handleResolveDispute("client")}
                                    variant="outline" 
                                    disabled={isActionLoading === 999}
                                    className="flex-col h-auto py-4 gap-2 border-destructive/20 hover:bg-destructive/10"
                                  >
                                    <span className="text-destructive font-bold text-sm">Müşteri Haklı</span>
                                    <span className="text-[10px] text-muted-foreground">İade Et (%2 Kesintiyle)</span>
                                  </Button>
                                  <Button 
                                    onClick={() => handleResolveDispute("freelancer")}
                                    disabled={isActionLoading === 999}
                                    className="flex-col h-auto py-4 gap-2 bg-green-600 hover:bg-green-700"
                                  >
                                    <span className="text-white font-bold text-sm">Freelancer Haklı</span>
                                    <span className="text-[10px] text-white/70">Öde (%2 Kesintiyle)</span>
                                  </Button>
                               </div>
                               <div className="mt-4 pt-4 border-t border-border/50">
                                  <Button 
                                    onClick={handleResumeContract}
                                    disabled={isActionLoading === 888}
                                    variant="outline"
                                    className="w-full h-11 gap-2 border-primary/50 text-primary hover:bg-primary/10"
                                  >
                                    {isActionLoading === 888 ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                                    Anlaşmazlığı Kapat, İşi Devam Ettir
                                  </Button>
                                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                    * Bu seçenek iş henüz teslim edilmediyse veya revize gerekiyorsa kullanılır.
                                  </p>
                               </div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <Card className="p-6 bg-card border-border/50 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> İş Tanımı
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {contract.description}
                  </p>
                </Card>
              </>
            )}

              <Card className="p-6 bg-card border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-semibold flex items-center gap-2">
                     <Clock size={18} className="text-primary" /> İş Aşamaları
                   </h2>
                   <Badge variant="outline" className="bg-secondary/30">
                     {contract.milestones?.length} Aşama
                   </Badge>
                </div>
                
                <div className="space-y-4">
                  {mappedMilestones?.map((m: any, i: number) => (
                    <div key={i} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      m.status === 'completed' ? 'bg-green-500/5 border-green-500/20 opacity-80' : 
                      m.status === 'awaiting_approval' ? 'bg-yellow-500/5 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] relative group' :
                      m.status === 'in_progress' ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)] relative overflow-hidden group' : 
                      'bg-secondary/30 border-border/40'
                    }`}>
                      {m.status === 'in_progress' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                          <div className="absolute -inset-px bg-gradient-to-r from-primary/5 to-transparent blur-sm" />
                        </>
                      )}
                      {m.status === 'awaiting_approval' && (
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-xl"></div>
                      )}
                      
                      <div className="flex items-start gap-4 relative z-10 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          m.status === 'completed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                          m.status === 'awaiting_approval' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          m.status === 'in_progress' ? 'bg-primary/20 text-primary animate-pulse border border-primary/30' :
                          'bg-secondary text-muted-foreground border border-border/50'
                        }`}>
                          {m.status === 'completed' ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i+1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${m.status === 'completed' ? 'text-green-500/80 line-through' : 'text-foreground'}`}>
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] h-4 font-normal">
                              {m.status === 'completed' ? 'Ödendi' : 
                               m.status === 'awaiting_approval' ? 'Onay Bekleniyor' : 
                               m.status === 'in_progress' ? 'Aktif' : 'Beklemede'}
                            </Badge>
                          </div>
                          
                          {m.proof_link && (
                            <div className="mt-4 p-4 rounded-xl bg-background/80 border border-border/50 shadow-sm">
                               <div className="flex items-center justify-between mb-2">
                                 <p className="font-bold text-xs flex items-center gap-1.5"><UploadCloud size={14} className="text-primary"/> Teslim Edilen Kanıt:</p>
                                 <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 border-primary/20 text-primary">Zincir Verisi</Badge>
                               </div>
                               <a 
                                 href={m.proof_link} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="text-xs text-primary hover:underline flex items-center gap-1 font-mono break-all bg-primary/5 p-2 rounded border border-primary/10"
                               >
                                 <ExternalLink size={12}/> {m.proof_link}
                               </a>
                               {m.proof_notes && (
                                 <div className="mt-3 pt-3 border-t border-border/30">
                                   <p className="text-xs text-muted-foreground italic leading-relaxed">"{m.proof_notes}"</p>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 relative z-10 shrink-0 min-w-fit">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold text-base text-foreground">{mistToSui(m.amount)} SUI</span>
                          <span className="text-[10px] text-muted-foreground">Aşama Bütçesi</span>
                        </div>
                        
                        {isClient && m.status === 'awaiting_approval' && (
                          <div className="flex items-center gap-2">
                             <Button 
                                onClick={() => handleReject(i)}
                                disabled={isActionLoading === i}
                                variant="outline" 
                                size="sm" 
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 h-9 text-xs font-semibold whitespace-nowrap"
                             >
                               {isActionLoading === i ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} className="mr-1.5" />}
                               Revize İste
                             </Button>
                             <Button 
                                onClick={() => handleApprove(i)}
                                disabled={isActionLoading === i}
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white h-9 text-xs font-semibold shadow-lg shadow-green-600/20 whitespace-nowrap"
                             >
                               {isActionLoading === i ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={14} className="mr-1.5" />}
                               Onayla
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield size={100} />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4 relative z-10">
                <Shield size={16} className="text-primary" /> Escrow Bakiyesi
              </h3>
              <div className="mb-4 relative z-10 flex items-baseline gap-2">
                <span className="text-5xl font-mono font-bold tracking-tighter shadow-inner">
                  {mistToSui(totalBudget)}
                </span>
                <span className="text-xl text-primary font-bold">SUI</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-4 mt-4 relative z-10">
                <div className="flex justify-between">
                  <span>Toplam Bütçe:</span>
                  <span className="font-mono">{mistToSui(totalBudget)} SUI</span>
                </div>
                <div className="flex justify-between text-green-500">
                  <span>Serbest Bırakılan:</span>
                  <span className="font-mono">{mistToSui(releasedAmount)} SUI</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Kilitli Kalan:</span>
                  <span className="font-mono">{mistToSui(lockedAmount)} SUI</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border/50 flex-1">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
                <History size={16} /> Zincir Aktiviteleri
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {(() => {
                  const events = [];
                  
                  // 1. Başlangıç
                  events.push({
                    id: 'created',
                    title: 'Sözleşme Başlatıldı',
                    desc: 'Sözleşme şartları on-chain kaydedildi.',
                    time: contract.created_at,
                    icon: <FileText size={12} className="text-primary" />,
                    status: 'success'
                  });

                  // 2. Fonlama
                  if (contract.status >= 1) {
                    events.push({
                      id: 'funded',
                      title: 'Escrow Fonlandı',
                      desc: `${mistToSui(contract.total_budget)} SUI güvenli kasaya alındı.`,
                      time: contract.created_at + 1000,
                      icon: <Shield size={12} className="text-blue-500" />,
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
                        icon: <CheckCircle2 size={12} className="text-green-500" />,
                        status: 'success'
                      });
                    } else if (m.is_completed) {
                      events.push({
                        id: `delivered-${idx}`,
                        title: 'İş Teslim Edildi',
                        desc: `${m.title} aşaması tamamlandı, onay bekleniyor.`,
                        time: contract.created_at + 1500 + idx,
                        icon: <UploadCloud size={12} className="text-primary" />,
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
                      icon: <Scale size={12} className="text-destructive" />,
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
                      icon: <AlertTriangle size={12} className="text-destructive" />,
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
                      icon: <RotateCcw size={12} className="text-primary" />,
                      status: 'success'
                    });
                  }

                  if (contract.status === 2 && contract.dispute_history.length > 0) {
                    events.push({
                      id: 'dispute-resolved',
                      title: 'Hakem Kararı: Uyuşmazlık Çözüldü',
                      desc: 'Hakem nihai kararını verdi ve ödemeyi uygun tarafa aktardı.',
                      time: Date.now(), // Mevcut durum için yaklaşık
                      icon: <ShieldCheck size={12} className="text-green-600" />,
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
                      icon: <CheckCircle2 size={12} className="text-green-600" />,
                      status: 'success'
                    });
                  }

                  return events.sort((a, b) => b.time - a.time).map((event) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${event.status === 'error' ? 'border-destructive bg-destructive/10' : 'border-border bg-background'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm`}>
                        {event.icon}
                      </div>
                      <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border/50 ${event.status === 'error' ? 'bg-destructive/5 border-destructive/20' : 'bg-background'} ml-4 md:ml-0 hover:border-primary/30 transition-colors`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${event.status === 'error' ? 'text-destructive' : 'text-foreground'}`}>{event.title}</span>
                          <span className="text-[9px] text-muted-foreground">{formatTimestamp(event.time)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Anlaşmazlık Başlatma Dialogu */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent className="sm:max-w-[500px] border-destructive/20 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-destructive" size={24} />
            </div>
            <DialogTitle className="text-xl">Anlaşmazlık (İhtilaf) Başlat</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Bu işlemi başlattığınızda sözleşme dondurulur ve platform yöneticileri hakem olarak sürece dahil olur. 
              Lütfen sorunu ve talebinizi detaylıca açıklayın.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">Anlaşmazlık Nedeni</Label>
              <Textarea 
                id="reason"
                placeholder="Örn: İş zamanında teslim edilmedi veya kriterlere uygun değil..." 
                className="min-h-[120px] bg-background border-border/80 focus-visible:ring-destructive/50 shadow-inner"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 text-[11px] text-muted-foreground border border-border/30">
               <Info size={14} className="shrink-0 mt-0.5 text-primary" />
               <p>İhtilaf başlatıldıktan sonra platform hakemleri her iki tarafın sunduğu kanıtları ve iş geçmişini inceleyerek fonların kime aktarılacağına karar verir.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDisputeOpen(false)}>Vazgeç</Button>
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={handleDispute}
              disabled={isSubmittingProof || !disputeReason.trim()}
            >
              {isSubmittingProof ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              Resmi İhtilaf Başlat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}