"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Wallet, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut
} from "lucide-react";

export default function Navbar() {
  // Şimdilik test için true yapıyoruz. (Cüzdan bağlıymış gibi)
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 ml-64 flex items-center justify-between px-8">
      
      {/* Sol Kısım: Sayfa Yolu */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer transition-colors">WorkSeal</span>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="font-medium text-foreground">Aktif Ekran</span>
      </div>

      {/* Sağ Kısım: Ağ, Bildirimler ve Şık Cüzdan Menüsü */}
      <div className="flex items-center gap-5 relative">
        
        {/* Ağ Durumu */}
        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 bg-secondary/30 border-border/50 text-xs py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          Sui Testnet
        </Badge>

        {/* Bildirim Zili */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-secondary/50 transition-all"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
          </Button>

          {/* Bildirim Çekmecesi */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card border border-border/50 rounded-xl shadow-lg p-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <h4 className="text-sm font-semibold mb-3">Son Bildirimler</h4>
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Sözleşme Fonlandı</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">E-Ticaret projesi için 100 SUI kilitlendi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cüzdan Bölümü */}
        {isWalletConnected ? (
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all rounded-full pl-2 pr-4 py-6 h-auto"
            >
              {/* Canlı Avatar (Gradyan) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-primary to-purple-500 shadow-inner flex items-center justify-center">
                <Wallet size={14} className="text-white opacity-80" />
              </div>
              <div className="flex flex-col items-start text-left mx-1">
                <span className="font-mono text-xs font-bold leading-none">0x269...e605</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">14.50 SUI</span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground ml-1" />
            </Button>

            {/* Açılır Cüzdan Menüsü */}
            {showWalletMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-card border border-border/50 rounded-xl shadow-xl p-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 hover:bg-secondary/50">
                  <Copy size={14} className="text-muted-foreground" /> Adresi Kopyala
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 hover:bg-secondary/50">
                  <ExternalLink size={14} className="text-muted-foreground" /> Explorer'da Görüntüle
                </Button>
                <div className="h-px bg-border/50 my-1 mx-2"></div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <LogOut size={14} /> Bağlantıyı Kes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all rounded-full px-6">
            <Wallet size={16} /> Cüzdan Bağla
          </Button>
        )}

      </div>
    </header>
  );
}