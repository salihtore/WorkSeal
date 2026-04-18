"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle, Clock, CheckCircle2, Upload,
  ChevronDown, ChevronUp, Shield,
} from "lucide-react";

const disputes = [
  {
    id: "1",
    contract: "SEO & İçerik Yazarlığı",
    counterparty: "Zeynep Kara",
    counterpartyVerified: true,
    amount: "4.800",
    status: "open",
    openedBy: "freelancer",
    openedAt: "1 Ara 2024",
    description: "Müşteri teslim edilen içerikleri onaylamıyor ancak içerikler sözleşmede belirlenen kriterleri karşılıyor.",
    evidence: ["sozlesme_detay.pdf", "teslim_ekran_goruntusu.png"],
  },
  {
    id: "2",
    contract: "Mobil Uygulama Testi",
    counterparty: "0x3d4e...5f6a",
    counterpartyVerified: false,
    amount: "2.100",
    status: "resolved",
    openedBy: "client",
    openedAt: "15 Kas 2024",
    description: "Test raporları eksik teslim edildi.",
    evidence: [],
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Açık", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  under_review: { label: "İnceleniyor", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  resolved: { label: "Çözüldü", color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

export default function DisputesPage() {
  const [expanded, setExpanded] = useState<string | null>("1");
  const [response, setResponse] = useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Anlaşmazlıklar</h1>
          <p className="text-sm text-muted-foreground mt-1">{disputes.filter(d => d.status === "open").length} açık anlaşmazlık</p>
        </div>

        <div className="space-y-4">
          {disputes.map((d) => {
            const isExpanded = expanded === d.id;
            const cfg = statusConfig[d.status];
            return (
              <Card key={d.id} className="bg-card border-border overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : d.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      d.status === "open" ? "bg-red-500/10" : "bg-green-500/10"
                    }`}>
                      {d.status === "open"
                        ? <AlertTriangle size={18} className="text-red-400" />
                        : <CheckCircle2 size={18} className="text-green-400" />
                      }
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{d.contract}</p>
                        <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <span>{d.counterparty}</span>
                        {d.counterpartyVerified && <CheckCircle2 size={11} className="text-green-400" />}
                        <span>·</span>
                        <Clock size={10} />
                        <span>{d.openedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold">{d.amount} SUI</p>
                    {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Detay */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border">
                    <div className="pt-4 space-y-5">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Açıklama</p>
                        <p className="text-sm leading-relaxed">{d.description}</p>
                      </div>

                      {d.evidence.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Kanıtlar</p>
                          <div className="flex gap-2">
                            {d.evidence.map((ev) => (
                              <div key={ev} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-xs">
                                <Shield size={12} className="text-primary" />
                                {ev}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {d.status === "open" && (
                        <div>
                          <Label className="text-xs mb-2 block">Yanıt Ekle</Label>
                          <Textarea
                            placeholder="Durumu açıkla, kanıtlarını belirt..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            className="bg-secondary border-border text-sm resize-none min-h-20"
                          />
                          <div className="flex gap-3 mt-3">
                            <Button variant="outline" size="sm" className="border-border gap-2 text-xs">
                              <Upload size={13} /> Kanıt Yükle
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs gap-2">
                              <Shield size={13} /> Wallet ile Gönder
                            </Button>
                          </div>
                        </div>
                      )}

                      {d.status === "resolved" && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-400" />
                            <p className="text-xs text-green-400 font-medium">Anlaşmazlık çözüldü. Ödeme ilgili tarafa aktarıldı.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}