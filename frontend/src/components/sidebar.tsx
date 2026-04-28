"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Shield, AlertTriangle, Receipt, User, Gavel, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisconnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { useContracts } from "@/hooks/useContracts";

export default function Sidebar() {
  const pathname = usePathname();
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();
  const { isArbitrator, loading } = useContracts(account?.address);

  const handleLogout = () => {
    disconnect();
    document.cookie = "wallet_connected=; path=/; max-age=0";
    window.location.href = "/";
  };

  const navItems = useMemo(() => {
    if (loading && !isArbitrator) return [];

    if (isArbitrator) {
      return [
        { href: "/arbitrator", label: "Hakem Portalı", icon: Gavel },
        { href: "/profile", label: "Profil", icon: User },
      ];
    }

    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/explore", label: "Keşfet", icon: Search },
      { href: "/contracts", label: "Sözleşmeler", icon: FileText },
      { href: "/escrow", label: "Ödemeler", icon: Shield },
      { href: "/disputes", label: "Anlaşmazlıklar", icon: AlertTriangle },
      { href: "/invoices", label: "Faturalar", icon: Receipt },
      { href: "/profile", label: "Profil", icon: User },
    ];
  }, [isArbitrator, loading]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-border bg-card z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <span className="font-black text-base tracking-tight">
          Work<span className="text-[#4FC3F7]">Seal</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-0.5">
        {loading && navItems.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={16} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : (
          navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative",
                  active
                    ? "text-[#4FC3F7] font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4FC3F7]" />
                )}
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })
        )}
      </nav>

      {/* Wallet Info */}
      {account && (
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-3 bg-background border border-border">
            <p className="font-mono text-[10px] text-[#4FC3F7]/60 mb-1">BAĞLI CÜZDAN</p>
            <p className="font-mono text-xs text-muted-foreground truncate">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 text-[10px] text-muted-foreground hover:text-destructive transition-colors font-mono"
            >
              Bağlantıyı Kes
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}