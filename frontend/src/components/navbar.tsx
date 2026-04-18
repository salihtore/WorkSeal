"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useDisconnectWallet, ConnectButton } from "@mysten/dapp-kit";
import { useNotifications } from "@/contexts/NotificationContext";
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
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  // Gerçek zamanlı arayüz (UI Zaman damgası güncelleme)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLabel = (date: Date) => {
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dk önce`;
    return `${Math.floor(diffMins / 60)} saat önce`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 md:px-8">

      {/* Sol Kısım: Sayfa Yolu (Kaldırıldı) */}
      <div></div>

      {/* Sağ Kısım: Ağ, Bildirimler ve Şık Cüzdan Menüsü */}
      <div className="flex items-center gap-5 relative">

        {/* Ağ Durumu */}
        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 bg-secondary/30 border-border/50 text-xs py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          Sui Testnet
        </Badge>

        {/* Bildirim Zili */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-all ${showNotifications ? 'bg-secondary/80' : 'hover:bg-secondary/50'}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) markAllAsRead();
            }}
          >
            <Bell size={18} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
            )}
          </Button>

          {/* Bildirim Çekmecesi */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card border border-border/50 rounded-xl shadow-lg p-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">Son Bildirimler</h4>
                {unreadCount > 0 && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{unreadCount} Yeni</span>}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {notifications.length > 0 ? notifications.map((notif) => (
                  <div key={notif.id} className={`flex gap-3 items-start p-2 rounded-lg transition-colors ${notif.read ? 'hover:bg-secondary/30' : 'bg-primary/5 border border-primary/10'}`}>
                    {notif.type === "success" ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    ) : notif.type === "error" ? (
                      <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <Bell size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-4">
                        <p className={`text-xs font-medium ${!notif.read ? "text-primary" : "text-foreground"}`}>{notif.title}</p>
                        <span className="text-[10px] text-muted-foreground/80 font-medium whitespace-nowrap">{formatTimeLabel(notif.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{notif.description}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Henüz bir bildiriminiz yok.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cüzdan Bölümü */}
        {account ? (
          <div className="relative" ref={walletRef}>
            <Button
              variant="outline"
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all rounded-full pl-2 pr-4 py-2 h-auto"
            >
              {/* Canlı Avatar (Gradyan) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-primary to-purple-500 shadow-inner flex items-center justify-center">
                <Wallet size={14} className="text-white opacity-80" />
              </div>
              <div className="flex flex-col items-start text-left mx-1">
                <span className="font-mono text-xs font-bold leading-none">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">Sui Testnet</span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground ml-1" />
            </Button>

            {/* Açılır Cüzdan Menüsü */}
            {showWalletMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-card border border-border/50 rounded-xl shadow-xl p-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 hover:bg-secondary/50" onClick={() => {
                  navigator.clipboard.writeText(account.address);
                  setShowWalletMenu(false);
                }}>
                  <Copy size={14} className="text-muted-foreground" /> Adresi Kopyala
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 hover:bg-secondary/50" onClick={() => {
                  window.open(`https://suivision.xyz/account/${account.address}`, "_blank");
                  setShowWalletMenu(false);
                }}>
                  <ExternalLink size={14} className="text-muted-foreground" /> Explorer'da Görüntüle
                </Button>
                <div className="h-px bg-border/50 my-1 mx-2"></div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                  disconnect();
                  setShowWalletMenu(false);
                }}>
                  <LogOut size={14} /> Bağlantıyı Kes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="wallet-button-override">
            <ConnectButton
              connectText="Cüzdan Bağla"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all rounded-full px-6 py-2 border-none h-10 text-sm font-semibold"
            />
          </div>
        )}

      </div>
    </header>
  );
}