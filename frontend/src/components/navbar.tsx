"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useAccounts, useSwitchAccount, useDisconnectWallet, ConnectButton } from "@mysten/dapp-kit";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Bell, Wallet, ChevronDown, Copy, ExternalLink,
  LogOut, CheckCircle2, AlertCircle, LayoutDashboard,
  Search, FileText, Shield, AlertTriangle, Receipt, User, Gavel
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useContracts } from "@/hooks/useContracts";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Keşfet" },
  { href: "/contracts", label: "Sözleşmeler" },
  { href: "/escrow", label: "Ödemeler" },
  { href: "/disputes", label: "Anlaşmazlıklar" },
  { href: "/invoices", label: "Faturalar" },
  { href: "/profile", label: "Profil" },
];

const arbitratorNavItems = [
  { href: "/arbitrator", label: "Hakem Portalı" },
  { href: "/profile", label: "Profil" },
];

export default function Navbar() {
  const pathname = usePathname();
  const account = useCurrentAccount();
  const accounts = useAccounts();
  const { mutate: switchAccount } = useSwitchAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { isArbitrator } = useContracts(account?.address);

  const notifRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

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

  const navItems = isArbitrator ? arbitratorNavItems : userNavItems;

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-[100] flex items-center justify-between px-8 w-full">

      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link href="/dashboard" className="font-black text-base tracking-tight shrink-0">
          Work<span className="text-[#4FC3F7]">Seal</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "text-[#4FC3F7] font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Network + Notifications + Wallet */}
      <div className="flex items-center gap-4">

        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sui Testnet
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) markAllAsRead();
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#4FC3F7] rounded-full border-2 border-card" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-[280px] z-[101] animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="absolute -top-1.5 right-3 w-3 h-3 bg-card border-t border-l border-border transform rotate-45" />
              <div className="relative bg-card border border-border shadow-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bildirimler</p>
                  {unreadCount > 0 && (
                    <span className="font-mono text-[10px] text-[#4FC3F7]">{unreadCount} yeni</span>
                  )}
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} className={`flex gap-3 items-start p-3 border transition-colors ${notif.read ? 'border-border' : 'border-[#4FC3F7]/20 bg-[#4FC3F7]/5'}`}>
                      {notif.type === "success"
                        ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        : notif.type === "error"
                          ? <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
                          : <Bell size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{notif.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">{formatTimeLabel(notif.timestamp)}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground text-center py-6 font-mono">Bildirim yok.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet */}
        {account ? (
          <div className="relative" ref={walletRef}>
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-[#4FC3F7]/40 transition-colors bg-card h-9"
            >
              <div className="w-5 h-5 bg-[#4FC3F7]/20 flex items-center justify-center">
                <Wallet size={11} className="text-[#4FC3F7]" />
              </div>
              <span className="font-mono text-xs">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </button>

            {showWalletMenu && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 w-[220px] z-[101] animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-card border-t border-l border-border transform rotate-45" />
                <div className="relative bg-card border border-border shadow-2xl">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
                    onClick={() => { navigator.clipboard.writeText(account.address); setShowWalletMenu(false); }}
                  >
                    <Copy size={13} /> Adresi Kopyala
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
                    onClick={() => { window.open(`https://suivision.xyz/account/${account.address}`, "_blank"); setShowWalletMenu(false); }}
                  >
                    <ExternalLink size={13} /> Explorer'da Gör
                  </button>
                  <div className="border-t border-border" />
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
                    onClick={() => { disconnect(); setShowWalletMenu(false); }}
                  >
                    <LogOut size={13} /> Bağlantıyı Kes
                  </button>

                  {accounts.length > 1 && (
                    <>
                      <div className="border-t border-border" />
                      <div className="px-4 py-3">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Hesap Değiştir</p>
                        <div className="max-h-40 overflow-y-auto pr-1">
                          {accounts.map(acc => (
                            <button
                              key={acc.address}
                              className={`w-full flex items-center gap-2 px-2 py-2 text-xs transition-colors text-left mb-1 font-mono ${acc.address === account.address ? 'text-[#4FC3F7] bg-[#4FC3F7]/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                              onClick={() => { switchAccount({ account: acc }); setShowWalletMenu(false); }}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${acc.address === account.address ? 'bg-[#4FC3F7]' : 'bg-muted-foreground/30'}`} />
                              <span className="truncate">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ConnectButton
            connectText="Cüzdan Bağla"
            className="h-9 px-5 bg-[#4FC3F7] text-[#050810] font-bold text-sm hover:bg-[#4FC3F7]/90 border-none"
          />
        )}
      </div>
    </header>
  );
}