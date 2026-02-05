import { fetchVehicles, calculateStats, formatNumber, formatKm } from "@/lib/sheets";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { OdometerList } from "@/components/odometer-list";
import { Gauge, Truck, TrendingUp } from "lucide-react";

export const revalidate = 0; // Sempre buscar dados frescos

export default async function HodometrosPage() {
  const vehicles = await fetchVehicles();
  const stats = calculateStats(vehicles);

  // Ordenar por placa
  const sortedVehicles = [...vehicles].sort((a, b) => 
    a.PLACA.localeCompare(b.PLACA)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={stats.totalVehicles} />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Atualizar Hodômetros</h1>
            <p className="text-gray-500">
              Atualize a quilometragem de cada veículo da frota
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Total de Veículos"
              value={formatNumber(stats.totalVehicles)}
              subtitle="Veículos na frota"
              icon={Truck}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-50"
            />
            <StatsCard
              title="Km Total da Frota"
              value={formatKm(stats.totalKm)}
              subtitle="Soma de todos os hodômetros"
              icon={Gauge}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
            />
            <StatsCard
              title="Média por Veículo"
              value={formatKm(stats.avgKm)}
              subtitle="Quilometragem média"
              icon={TrendingUp}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-50"
            />
          </div>

          {/* Instructions */}
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> Clique no ícone de lápis ✏️ para editar o hodômetro de um veículo. 
              Pressione <kbd className="rounded bg-blue-100 px-1 py-0.5 text-xs">Enter</kbd> para salvar 
              ou <kbd className="rounded bg-blue-100 px-1 py-0.5 text-xs">Esc</kbd> para cancelar.
            </p>
          </div>

          {/* Odometer List */}
          <OdometerList vehicles={sortedVehicles} />
        </main>
      </div>
    </div>
  );
}
