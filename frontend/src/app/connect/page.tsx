"use client";

import { useConnectWallet, useWallets, useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Wallet, Shield, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

const steps = [
  { title: "Slush Wallet'ı aç", desc: "Tarayıcı uzantısını veya mobil uygulamayı aç." },
  { title: "Bağlan butonuna bas", desc: "Aşağıdaki butona tıkla, cüzdanın onay isteyecek." },
  { title: "Onayla", desc: "Cüzdanında çıkan onay ekranını kabul et." },
];

export default function ConnectPage() {
  const wallets = useWallets();
  const { mutate: connectWallet, isPending, isError } = useConnectWallet();
  const account = useCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (account) router.push("/dashboard");
  }, [account, router]);

  const handleConnect = () => {
    const wallet = wallets[0];
    if (wallet) {
      connectWallet({ wallet });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">WorkSeal</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground">Geri Dön</Button>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {!account ? (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                  <Wallet size={32} className="text-accent-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-foreground">Cüzdanını Bağla</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  WorkSeal'i kullanmak için Slush Wallet bağlantısı gereklidir.
                  Kimliğin blockchain üzerinden doğrulanır.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {steps.map(({ title, desc }, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent-foreground">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {wallets.length === 0 && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle size={16} className="text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    Slush Wallet bulunamadı. Lütfen tarayıcı uzantısını yükle.
                  </p>
                </div>
              )}

              <Button
                onClick={handleConnect}
                disabled={isPending || wallets.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Bağlanıyor...
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    Slush Wallet ile Bağlan
                  </>
                )}
              </Button>

              {isError && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle size={16} className="text-destructive shrink-0" />
                  <p className="text-sm text-destructive">Bağlantı kurulamadı. Tekrar dene.</p>
                </div>
              )}

              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-secondary">
                <Shield size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cüzdanın sadece kimlik doğrulama için kullanılır. İzin vermediğin hiçbir işlem gerçekleşmez.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Bağlantı Başarılı!</h2>
              <p className="text-muted-foreground text-sm mb-2">Cüzdanın bağlandı.</p>
              <Badge className="bg-secondary text-muted-foreground font-mono text-xs mb-8">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </Badge>

              <div className="space-y-3 text-left">
                <p className="text-sm font-medium text-center mb-4 text-foreground">Platformda nasıl görünmek istersin?</p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0 text-lg">👤</div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Kimliğimi göster</p>
                    <p className="text-xs text-muted-foreground">İsim ve profil bilgilerini ekle</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-lg">🕶️</div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Anonim kal</p>
                    <p className="text-xs text-muted-foreground">Sadece cüzdan adresinle görün</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}