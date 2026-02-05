"use client";

import { useVehicles } from "@/hooks/use-vehicles";
import { calculateRevisionStats, formatNumber, formatKm, calculateStats } from "@/lib/sheets";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { VehicleTable } from "@/components/vehicle-table";
import { StatsCard } from "@/components/stats-card";
import { Truck, Gauge, AlertTriangle, Wrench, Loader2 } from "lucide-react";

export default function FrotaPage() {
  const { vehicles, vehiclesWithRevision, loading, error } = useVehicles();
  const revisionStats = calculateRevisionStats(vehiclesWithRevision);
  const stats = calculateStats(vehicles);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={stats.totalVehicles} />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Frota de Veículos</h1>
            <p className="text-gray-500">
              Visualize todos os veículos da sua frota
            </p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatsCard
              title="Total de Veículos"
              value={formatNumber(stats.totalVehicles)}
              subtitle="Veículos ativos"
              icon={Truck}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-50"
            />
            <StatsCard
              title="Km Médio"
              value={formatKm(stats.avgKm)}
              subtitle="Média da frota"
              icon={Gauge}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
            />
            <StatsCard
              title="Revisões Críticas"
              value={formatNumber(revisionStats.critical + revisionStats.overdue)}
              subtitle="Precisam de atenção"
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-red-50"
            />
            <StatsCard
              title="Em Dia"
              value={formatNumber(revisionStats.ok)}
              subtitle="Sem revisão pendente"
              icon={Wrench}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
            />
          </div>

          <VehicleTable vehicles={vehicles} />
        </main>
      </div>
    </div>
  );
}
