"use client";

import { useVehicles } from "@/hooks/use-vehicles";
import { calculateRevisionStats, formatNumber } from "@/lib/sheets";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { DonutChart } from "@/components/donut-chart";
import { RevisionTable } from "@/components/revision-table";
import { Truck, AlertTriangle, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { vehiclesWithRevision, loading, error } = useVehicles();
  const stats = calculateRevisionStats(vehiclesWithRevision);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <p className="text-red-500 mb-2">Erro ao carregar dados</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={stats.totalVehicles} />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Dashboard de Revisões
            </h1>
            <p className="text-sm text-gray-500 sm:text-base">
              Gerencie e acompanhe as revisões da sua frota de caminhões
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total de Veículos"
              value={formatNumber(stats.totalVehicles)}
              subtitle="Veículos na frota"
              icon={Truck}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-50"
            />
            <StatsCard
              title="Revisões Atrasadas"
              value={formatNumber(stats.overdue)}
              subtitle="Passaram do prazo"
              icon={XCircle}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-50"
            />
            <StatsCard
              title="Revisões Críticas"
              value={formatNumber(stats.critical)}
              subtitle="Próximos 2.000 km"
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-red-50"
            />
            <StatsCard
              title="Atenção"
              value={formatNumber(stats.warning)}
              subtitle="Próximos 5.000 km"
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-50"
            />
          </div>

          {/* Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <DonutChart
              title="Status das Revisões"
              data={stats.byStatus}
              icon={<CheckCircle className="h-5 w-5" />}
            />
            <DonutChart
              title="Veículos por Marca"
              data={stats.byBrand}
              icon={<Truck className="h-5 w-5" />}
            />
          </div>

          {/* Revision Table */}
          <RevisionTable vehicles={vehiclesWithRevision} />
        </main>
      </div>
    </div>
  );
}