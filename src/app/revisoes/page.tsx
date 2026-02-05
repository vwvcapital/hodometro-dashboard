import { fetchVehicles, calculateVehiclesWithRevision, calculateRevisionStats, formatNumber, fetchRevisionIntervalsFromDB, configsToIntervals } from "@/lib/sheets";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { RevisionView } from "@/components/revision-view";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, XCircle, Wrench } from "lucide-react";

export const revalidate = 60;

export default async function RevisoesPage() {
  const [vehicles, revisionConfigs] = await Promise.all([
    fetchVehicles(),
    fetchRevisionIntervalsFromDB(),
  ]);
  const vehiclesWithRevision = calculateVehiclesWithRevision(vehicles, revisionConfigs);
  const stats = calculateRevisionStats(vehiclesWithRevision);
  const REVISION_INTERVALS = configsToIntervals(revisionConfigs);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={stats.totalVehicles} />
      
      <div className="flex flex-1 flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Revisões</h1>
            <p className="text-gray-500">
              Acompanhe e gerencie as revisões programadas da sua frota
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Em Dia"
              value={formatNumber(stats.ok)}
              subtitle="Fora da zona de atenção"
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
            />
            <StatsCard
              title="Atenção"
              value={formatNumber(stats.warning)}
              subtitle="Próximos 5.000 km"
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-50"
            />
            <StatsCard
              title="Crítico"
              value={formatNumber(stats.critical)}
              subtitle="Próximos 2.000 km"
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-red-50"
            />
            <StatsCard
              title="Atrasado"
              value={formatNumber(stats.overdue)}
              subtitle="Passaram do prazo"
              icon={XCircle}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-50"
            />
          </div>

          {/* Intervalos de Revisão por Marca */}
          <Card className="mb-6 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Wrench className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Intervalos de Revisão por Marca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {REVISION_INTERVALS.filter((item, index, self) => 
                  index === self.findIndex((t) => t.interval === item.interval && t.brand === item.brand)
                ).slice(0, 8).map((interval) => (
                  <div
                    key={interval.brand}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <span className="font-medium text-gray-900">{interval.brand}</span>
                    <span className="text-sm text-blue-600 font-semibold">
                      {(interval.interval / 1000).toFixed(0)}k km
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visualização de Revisões */}
          <RevisionView vehicles={vehiclesWithRevision} />
        </main>
      </div>
    </div>
  );
}
