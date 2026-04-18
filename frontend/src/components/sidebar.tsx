"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Shield, AlertTriangle,
  Receipt, User, LogOut, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contracts", label: "Sözleşmeler", icon: FileText },
  { href: "/escrow", label: "Ödemeler", icon: Shield },
  { href: "/disputes", label: "Anlaşmazlıklar", icon: AlertTriangle },
  { href: "/invoices", label: "Faturalar", icon: Receipt },
  { href: "/profile", label: "Profil", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-border bg-card z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Briefcase size={16} className="text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-foreground">WorkSeal</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Salih</p>
            <p className="text-xs text-muted-foreground truncate">freelancer</p>
          </div>
          <button className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}