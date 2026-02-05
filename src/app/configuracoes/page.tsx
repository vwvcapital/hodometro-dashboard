"use client";

import { useRevisionConfigs } from "@/hooks/use-vehicles";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { RevisionConfigList } from "@/components/revision-config-list";
import { Loader2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const { configs, loading } = useRevisionConfigs();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
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
      
      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <RevisionConfigList configs={configs} />
        </main>
      </div>
    </div>
  );
}
