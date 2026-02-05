"use client";

import { useRevisionConfigs } from "@/hooks/use-vehicles";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { RevisionConfigList } from "@/components/revision-config-list";
import { AuthGuard } from "@/components/auth-guard";
import { Loader2 } from "lucide-react";

function ConfiguracoesContent() {
  const { configs, loading } = useRevisionConfigs();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <Header />
          <main className="flex flex-1 items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Carregando configurações...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={0} />
      
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <RevisionConfigList configs={configs} />
        </main>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <AuthGuard>
      <ConfiguracoesContent />
    </AuthGuard>
  );
}
