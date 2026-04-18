"use client";

import { useConnectWallet, useWallets, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Wallet, Shield, ChevronRight,
  CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function ConnectPage() {
  const wallets = useWallets();
  const { mutate: connectWallet, isPending, isError } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();
  const router = useRouter();
  const [step, setStep] = useState("connect");
  const [identityChoice, setIdentityChoice] = useState("");

  useEffect(() => {
    if (account && step === "connect") {
      setStep("identity");
    }
  }, [account, step]);

  const handleConnect = (wallet: (typeof wallets)[0]) => {
    connectWallet({ wallet });
  };

  const handleContinue = () => {
    if (!identityChoice) return;
    document.cookie = "wallet_connected=true; path=/; max-age=86400";
    router.push("/dashboard");
  };

  const handleDisconnect = () => {
    disconnect();
    setStep("connect");
    setIdentityChoice("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <nav className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-semibold text-lg text-foreground">WorkSeal</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Kesfet
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Ana Sayfa
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 text-xs font-medium">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "identity" ? "bg-green-500 text-white" : "bg-primary text-white"
              }`}>
                {step === "identity" ? <CheckCircle2 size={12} /> : "1"}
              </div>
              <span className={step === "connect" ? "text-foreground" : "text-muted-foreground"}>
                Cuzdan Bagla
              </span>
            </div>
            <div className={`h-px w-8 ${step === "identity" ? "bg-primary" : "bg-border"}`} />
            <div className="flex items-center gap-2 text-xs font-medium">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "identity" ? "bg-primary text-white" : "bg-border text-muted-foreground"
              }`}>
                2
              </div>
              <span className={step === "identity" ? "text-foreground" : "text-muted-foreground"}>
                Kimlik Tercihi
              </span>
            </div>
          </div>

          {step === "connect" && (
            <div>
              <div className="text-center mb-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
                    <Wallet size={36} className="text-primary" />
                  </div>
                  {isPending && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2 text-foreground">
                  {isPending ? "Baglanıyor..." : "Cüzdanını Bagla"}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  WorkSeal kullanmak icin Slush Wallet gereklidir.
                  Kimligin blockchain üzerinden dogrulanır, sifre gerekmez.
                </p>
              </div>

              {wallets.length === 0 && (
                <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-400 mb-1">
                        Slush Wallet bulunamadı
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Devam etmek icin tarayıcı uzantısını yükle.
                      </p>
                        <a
                        href="https://slush.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        Slush Wallet Indir <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {wallets.length > 0 && (
                <div className="space-y-3 mb-6">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet)}
                      disabled={isPending}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group disabled:opacity-50"
                    >
                      {wallet.icon ? (
                        <img src={wallet.icon} alt={wallet.name} className="w-9 h-9 rounded-lg" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Wallet size={18} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">Bağlanmak için tıkla</p>
                      </div>
                      {isPending ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isError && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle size={16} className="text-destructive shrink-0" />
                  <p className="text-sm text-destructive">Bağlantı kurulamadı. Tekrar dene.</p>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary">
                <Shield size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cüzdanın sadece kimlik doğrulama icin kullanılır.
                  İzin vermediğin hiçbir işlem gercekleşmez.
                </p>
              </div>
            </div>
          )}

          {step === "identity" && account && (
            <div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">Cüzdan Baglantısı</h2>
                <p className="text-xs text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-full inline-block">
                  {account.address.slice(0, 10)}...{account.address.slice(-8)}
                </p>
              </div>

              <p className="text-sm font-medium text-center mb-4 text-foreground">
                Platformda nasıl görünmek istersin?
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setIdentityChoice("verified")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    identityChoice === "verified"
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    identityChoice === "verified" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <Eye size={18} className={identityChoice === "verified" ? "text-white" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Kimligimi göster</p>
                    <p className="text-xs text-muted-foreground">Isim, bio ve portföy bilgilerini ekle</p>
                  </div>
                  {identityChoice === "verified" && (
                    <CheckCircle2 size={16} className="text-primary" />
                  )}
                </button>

                <button
                  onClick={() => setIdentityChoice("anonymous")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    identityChoice === "anonymous"
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    identityChoice === "anonymous" ? "bg-primary" : "bg-secondary"
                  }`}>
                    <EyeOff size={18} className={identityChoice === "anonymous" ? "text-white" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Anonim kal</p>
                    <p className="text-xs text-muted-foreground">Sadece cüzdan adresinle görün</p>
                  </div>
                  {identityChoice === "anonymous" && (
                    <CheckCircle2 size={16} className="text-primary" />
                  )}
                </button>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!identityChoice}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-sm gap-2 disabled:opacity-40"
              >
                Devam Et <ChevronRight size={16} />
              </Button>

              <button
                onClick={handleDisconnect}
                className="w-full mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors py-2"
              >
                Farklı cüzdan kullan
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}