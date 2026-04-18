"use client";

import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Inbox, FileText } from "lucide-react";
import Link from "next/link";

export default function DisputesPage() {
  const disputes: never[] = [];
  const loading = false;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Anlasmazlıklar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {disputes.length > 0
              ? `${disputes.filter((d: never) => d).length} acık anlasmazlık`
              : "Henüz anlasmazlık yok"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : disputes.length === 0 ? (
          <Card className="p-16 bg-card border-border flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5">
              <Inbox size={26} className="text-green-500" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              Hicbir anlasmazlık yok
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Aktif sozlesmelerinde bir sorun yasarsan buradan itiraz baslatabilirsin.
            </p>
            <Link href="/contracts">
              <Button variant="outline" className="border-border gap-2 text-foreground">
                <FileText size={15} /> Sozlesmelere Git
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Backend gelince burası dolacak */}
          </div>
        )}

      </main>
    </div>
  );
}