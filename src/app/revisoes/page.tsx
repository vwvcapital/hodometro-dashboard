"use client";

import { useVehicles } from "@/hooks/use-vehicles";
import { calculateRevisionStats, formatNumber, configsToFullIntervals } from "@/lib/sheets";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { RevisionView } from "@/components/revision-view";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/auth-guard";
import { CheckCircle, Clock, AlertTriangle, XCircle, Wrench, Loader2 } from "lucide-react";

function RevisoesContent() {
  const { vehiclesWithRevision, revisionConfigs, loading, refresh } = useVehicles();
  const stats = calculateRevisionStats(vehiclesWithRevision);
  const BRAND_INTERVALS = configsToFullIntervals(revisionConfigs);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar vehicleCount={0} />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={stats.totalVehicles} />
      
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />
        
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Gestão de Revisões</h1>
            <p className="text-sm text-gray-500 sm:text-base">
              Acompanhe e gerencie as revisões programadas da sua frota
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-base font-semibold text-gray-900 sm:text-lg">
                Intervalos de Revisão por Marca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {BRAND_INTERVALS.map((brand) => (
                  <div
                    key={brand.brand}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{brand.brand}</h4>
                    <div className="space-y-1">
                      {brand.intervals.map((interval, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{interval.name}</span>
                          <span className="font-semibold text-blue-600">
                            {(interval.interval / 1000).toFixed(0)}k km
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visualização de Revisões */}
          <RevisionView vehicles={vehiclesWithRevision} onRefresh={refresh} />
        </main>
      </div>
    </div>
  );
}

export default function RevisoesPage() {
  return (
    <AuthGuard>
      <RevisoesContent />
    </AuthGuard>
  );
}
