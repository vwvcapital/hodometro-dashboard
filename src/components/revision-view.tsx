"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleWithRevision } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  LayoutGrid,
  List,
  Search,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RevisionDialog } from "@/components/revision-dialog";

interface RevisionViewProps {
  vehicles: VehicleWithRevision[];
}

function getStatusConfig(status: VehicleWithRevision["revisionStatus"]) {
  switch (status) {
    case "overdue":
      return {
        label: "Atrasado",
        icon: XCircle,
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
        cardBg: "bg-purple-50",
      };
    case "critical":
      return {
        label: "Crítico",
        icon: AlertTriangle,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        cardBg: "bg-red-50",
      };
    case "warning":
      return {
        label: "Atenção",
        icon: Clock,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        cardBg: "bg-amber-50",
      };
    case "ok":
    default:
      return {
        label: "Em dia",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        cardBg: "bg-green-50",
      };
  }
}

function ProgressBar({
  percentage,
  status,
}: {
  percentage: number;
  status: VehicleWithRevision["revisionStatus"];
}) {
  const getColor = () => {
    switch (status) {
      case "overdue":
        return "bg-purple-500";
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn("h-2 rounded-full transition-all", getColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function RevisionCard({ vehicle }: { vehicle: VehicleWithRevision }) {
  const statusConfig = getStatusConfig(vehicle.revisionStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 transition-shadow hover:shadow-md",
        statusConfig.borderColor
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{vehicle.PLACA}</h3>
              <p className="text-xs text-gray-500">{vehicle.MARCA}</p>
            </div>
          </div>
          <Badge
            className={cn(
              "flex items-center gap-1",
              statusConfig.bgColor,
              statusConfig.textColor
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Model */}
        <p className="mb-3 truncate text-sm text-gray-600" title={vehicle.MODELO}>
          {vehicle.MODELO}
        </p>

        {/* Stats Grid */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Hodômetro</p>
            <p className="font-semibold text-gray-900">{formatKm(vehicle.HODOMETRO)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Última Revisão</p>
            <p className="font-semibold text-gray-900">{formatKm(vehicle.lastRevisionKm)}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2">
            <p className="text-xs text-blue-600">Próxima Revisão</p>
            <p className="font-semibold text-blue-700">{formatKm(vehicle.nextRevisionKm)}</p>
            <p className={cn(
              "text-xs font-medium mt-0.5",
              vehicle.nextRevisionType === "Completa" ? "text-purple-600" : "text-blue-500"
            )}>
              {vehicle.nextRevisionType}
            </p>
          </div>
          <div className={cn("rounded-lg p-2", statusConfig.cardBg)}>
            <p className={cn("text-xs", statusConfig.textColor)}>Km Restante</p>
            <p className={cn("font-semibold", statusConfig.textColor)}>
              {vehicle.kmUntilRevision <= 0
                ? `${formatKm(Math.abs(vehicle.kmUntilRevision))} atrás`
                : formatKm(vehicle.kmUntilRevision)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">Ciclo de revisão</span>
            <span className="font-medium text-gray-700">{vehicle.revisionPercentage}%</span>
          </div>
          <ProgressBar percentage={vehicle.revisionPercentage} status={vehicle.revisionStatus} />
        </div>

        {/* Action Button */}
        <RevisionDialog vehicle={vehicle} />
      </CardContent>
    </Card>
  );
}

export function RevisionView({ vehicles }: RevisionViewProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtra e ordena os veículos
  const filteredVehicles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let filtered = vehicles;

    if (query) {
      filtered = vehicles.filter(
        (v) =>
          v.PLACA.toLowerCase().includes(query) ||
          v.MARCA.toLowerCase().includes(query) ||
          v.MODELO.toLowerCase().includes(query) ||
          v.TIPO.toLowerCase().includes(query)
      );
    }

    // Ordena por status (mais urgentes primeiro)
    return [...filtered].sort((a, b) => {
      const statusOrder = { overdue: 0, critical: 1, warning: 2, ok: 3 };
      if (statusOrder[a.revisionStatus] !== statusOrder[b.revisionStatus]) {
        return statusOrder[a.revisionStatus] - statusOrder[b.revisionStatus];
      }
      return a.kmUntilRevision - b.kmUntilRevision;
    });
  }, [vehicles, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Pesquisar por placa, marca, modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Visualização:</span>
          <div className="flex rounded-lg border bg-white p-1">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className={cn(
                "h-8 px-3",
                viewMode === "card" && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3",
                viewMode === "list" && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <List className="mr-1 h-4 w-4" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? "s" : ""} encontrado
          {filteredVehicles.length !== 1 ? "s" : ""}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      </div>

      {/* Content */}
      {filteredVehicles.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-3 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum veículo encontrado</h3>
            <p className="text-sm text-gray-500">
              Tente ajustar os termos da pesquisa
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVehicles.map((vehicle, index) => (
            <RevisionCard key={`${vehicle.PLACA}-${index}`} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <RevisionListView vehicles={filteredVehicles} />
      )}
    </div>
  );
}

// Componente de lista (tabela simplificada)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RevisionListView({ vehicles }: { vehicles: VehicleWithRevision[] }) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-0 sm:p-6">
        {/* Mobile card view */}
        <div className="space-y-3 p-4 sm:hidden">
          {vehicles.map((vehicle, index) => {
            const statusConfig = getStatusConfig(vehicle.revisionStatus);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={`${vehicle.PLACA}-${index}`}
                className={cn(
                  "rounded-lg border-l-4 bg-gray-50 p-3",
                  statusConfig.borderColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{vehicle.PLACA}</span>
                  <Badge 
                    className={cn(
                      "flex items-center gap-1",
                      statusConfig.bgColor,
                      statusConfig.textColor
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{vehicle.MODELO}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Hodômetro:</span>
                    <span className="ml-1 font-medium text-gray-900">{formatKm(vehicle.HODOMETRO)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Próxima:</span>
                    <span className="ml-1 font-medium text-blue-600">{formatKm(vehicle.nextRevisionKm)}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-bold",
                    vehicle.kmUntilRevision <= 0 ? "text-purple-600" :
                    vehicle.kmUntilRevision <= 2000 ? "text-red-600" :
                    vehicle.kmUntilRevision <= 5000 ? "text-amber-600" :
                    "text-green-600"
                  )}>
                    {vehicle.kmUntilRevision <= 0 
                      ? `${formatKm(Math.abs(vehicle.kmUntilRevision))} atrás`
                      : `${formatKm(vehicle.kmUntilRevision)} restantes`
                    }
                  </span>
                  <RevisionDialog vehicle={vehicle} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Desktop table view */}
        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-semibold text-gray-600">Placa</TableHead>
                <TableHead className="font-semibold text-gray-600">Modelo</TableHead>
                <TableHead className="font-semibold text-gray-600">Marca</TableHead>
                <TableHead className="text-right font-semibold text-gray-600">Hodômetro</TableHead>
                <TableHead className="text-right font-semibold text-gray-600">Próxima Revisão</TableHead>
                <TableHead className="text-right font-semibold text-gray-600">Km Restante</TableHead>
                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                <TableHead className="font-semibold text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, index) => {
                const statusConfig = getStatusConfig(vehicle.revisionStatus);
                const StatusIcon = statusConfig.icon;
                return (
                  <TableRow
                    key={`${vehicle.PLACA}-${index}`}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {vehicle.PLACA}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-600">
                      {vehicle.MODELO}
                    </TableCell>
                    <TableCell className="text-gray-600">{vehicle.MARCA}</TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatKm(vehicle.HODOMETRO)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      <div>
                        {formatKm(vehicle.nextRevisionKm)}
                        <span className={cn(
                          "ml-2 text-xs px-1.5 py-0.5 rounded",
                          vehicle.nextRevisionType === "Completa" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-blue-100 text-blue-600"
                        )}>
                          {vehicle.nextRevisionType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        vehicle.kmUntilRevision <= 0
                          ? "text-purple-600"
                          : vehicle.kmUntilRevision <= 2000
                          ? "text-red-600"
                          : vehicle.kmUntilRevision <= 5000
                          ? "text-amber-600"
                          : "text-green-600"
                      )}
                    >
                      {vehicle.kmUntilRevision <= 0
                        ? `${formatKm(Math.abs(vehicle.kmUntilRevision))} atrás`
                        : formatKm(vehicle.kmUntilRevision)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "flex w-fit items-center gap-1",
                          statusConfig.bgColor,
                          statusConfig.textColor
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RevisionDialog vehicle={vehicle} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
