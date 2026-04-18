"use client";

import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { FileText } from "lucide-react";

export default function ContractDetailPage() {
  const params = useParams();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex items-center justify-center">
        <div className="text-center">
          <FileText size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-sm">Sözleşme detayı</p>
          <p className="text-xs text-muted-foreground mt-1">ID: {params.id}</p>
          <p className="text-xs text-muted-foreground mt-4">Backend bağlantısı bekleniyor...</p>
        </div>
      </main>
    </div>
  );
}