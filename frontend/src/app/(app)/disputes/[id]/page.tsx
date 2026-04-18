"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send, UploadCloud, FileText, AlertTriangle, User, Paperclip } from "lucide-react";
import Link from "next/link";

export default function DisputeDetailPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Client",
      text: "Performans testlerinde sayfa yüklenme hızı 5 saniyenin üzerinde çıkıyor. Anlaşmada 2 saniyenin altında olması garanti edilmişti. Ayrıca sepete eklerken state yönetimi bazen hata veriyor.",
      time: "2 saat önce",
      role: "client"
    },
    {
      id: 2,
      sender: "Freelancer (Sen)",
      text: "Yüklenme hızı sunucu kaynaklı bir problem. Sağladığınız test environment'ının kaynakları yetersiz. Lokal ortamda ve Vercel demo deploy'unda hız 1.2 sn civarında. Kanıt ekliyorum.",
      time: "1 saat önce",
      hasAttachment: true,
      attachmentName: "Lighthouse_Report_Vercel.pdf",
      role: "me"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: "Freelancer (Sen)",
      text: newMessage,
      time: "Şimdi",
      role: "me"
    }]);
    setNewMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/disputes">
          <Button variant="ghost" size="icon" className="group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Anlaşmazlık: {params.id || "DSP-341"}</h1>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Açık</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            İlgili Sözleşme: <Link href="#" className="font-mono text-primary hover:underline">CTR-088</Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Bilgi Paneli (Sol) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-5 bg-card border-border/50">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50 text-destructive">
              <AlertTriangle size={18} />
              <h3 className="font-semibold text-sm">İhtilaf Bilgileri</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Başlatan</p>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <User size={12} />
                  </div>
                  Müşteri (0x99...2E1)
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Kilitli Tutar</p>
                <p className="font-mono font-bold text-foreground">300.00 SUI</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 mt-2 text-xs text-muted-foreground leading-relaxed">
                Her iki taraf bir uzlaşmaya varana kadar veya Hakem (Platform) karar verene kadar bu tutar kilitli kalacaktır.
              </div>
            </div>
          </Card>

          <Button variant="outline" className="w-full justify-start gap-2 border-border/50 bg-card hover:bg-secondary">
            <FileText size={16} className="text-muted-foreground" />
            <span>Hakem Kararı İste</span>
          </Button>
        </div>

        {/* Sohbet ve Kanıt Alanı (Sağ) */}
        <Card className="md:col-span-2 flex flex-col h-[600px] bg-card border-border/50 overflow-hidden shadow-lg">
          
          <div className="p-4 bg-secondary/20 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Çözüm Merkezi İletişimi</h2>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                <UploadCloud size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundBlendMode: "overlay", backgroundColor: "var(--background)" }}>
             {/* İç mesajlar */}
             {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'me' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                     <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{msg.sender}</span>
                     <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'me' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_5px_15px_rgba(var(--primary),0.2)]' 
                    : 'bg-secondary text-foreground rounded-tl-sm border border-border/50 shadow-sm'
                  }`}>
                    {msg.text}
                    
                    {msg.hasAttachment && (
                      <div className={`mt-3 p-2 rounded-lg flex items-center justify-between gap-3 text-xs border ${
                        msg.role === 'me' ? 'bg-black/10 border-white/10' : 'bg-background border-border'
                      }`}>
                         <div className="flex items-center gap-2">
                           <FileText size={14} className={msg.role === 'me' ? "text-white/70" : "text-muted-foreground"} />
                           <span className="font-mono truncate w-32">{msg.attachmentName}</span>
                         </div>
                         <Button size="sm" variant="ghost" className={`h-6 px-2 text-[10px] ${msg.role === 'me' ? 'hover:bg-white/20' : ''}`}>İndir</Button>
                      </div>
                    )}
                  </div>
                </div>
             ))}
          </div>

          <div className="p-4 bg-background border-t border-border/50">
             <div className="relative flex items-center">
                <Button size="icon" variant="ghost" className="absolute left-2 text-muted-foreground hover:bg-secondary h-8 w-8 rounded-full">
                   <Paperclip size={16} />
                </Button>
                <Textarea 
                  placeholder="Kanıtı açıkla veya yanıtını yaz..." 
                  className="min-h-[50px] resize-none pl-12 pr-12 bg-secondary/20 focus-visible:ring-primary/50 border-border/50 rounded-2xl py-3 text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="absolute right-2 bg-primary hover:bg-primary/90 text-white shadow-md h-8 w-8 rounded-full transition-all"
                >
                   <Send size={14} />
                </Button>
             </div>
             <p className="text-[10px] text-muted-foreground mt-2 text-center">Dosya yüklemek için (+) veya Ataş ikonuna tıklayın. Maximum 10MB.</p>
          </div>

        </Card>
      </div>

    </div>
  );
}
