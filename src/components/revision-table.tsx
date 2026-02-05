"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleWithRevision } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";
import { Wrench, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevisionDialog } from "@/components/revision-dialog";

interface RevisionTableProps {
  vehicles: VehicleWithRevision[];
  showAll?: boolean;
}

function getStatusConfig(status: VehicleWithRevision["revisionStatus"]) {
  switch (status) {
    case "overdue":
      return {
        label: "Atrasado",
        variant: "destructive" as const,
        icon: XCircle,
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
      };
    case "critical":
      return {
        label: "Crítico",
        variant: "destructive" as const,
        icon: AlertTriangle,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    case "warning":
      return {
        label: "Atenção",
        variant: "secondary" as const,
        icon: Clock,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    case "ok":
    default:
      return {
        label: "Em dia",
        variant: "default" as const,
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      };
  }
}

function ProgressBar({ percentage, status }: { percentage: number; status: VehicleWithRevision["revisionStatus"] }) {
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
    <div className="w-24">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn("h-2 rounded-full transition-all", getColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{percentage}%</span>
    </div>
  );
}

export function RevisionTable({ vehicles, showAll = false }: RevisionTableProps) {
  // Ordena por status (mais urgentes primeiro) e km restante
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const statusOrder = { overdue: 0, critical: 1, warning: 2, ok: 3 };
    if (statusOrder[a.revisionStatus] !== statusOrder[b.revisionStatus]) {
      return statusOrder[a.revisionStatus] - statusOrder[b.revisionStatus];
    }
    return a.kmUntilRevision - b.kmUntilRevision;
  });

  const displayVehicles = showAll ? sortedVehicles : sortedVehicles.slice(0, 10);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <Wrench className="h-5 w-5 shrink-0 text-blue-600" />
        <CardTitle className="text-base font-semibold text-gray-900 sm:text-lg">
          Próximas Revisões
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {/* Mobile card view */}
        <div className="space-y-3 p-4 sm:hidden">
          {displayVehicles.map((vehicle, index) => {
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
                <TableHead className="text-right font-semibold text-gray-600">Última Revisão</TableHead>
                <TableHead className="text-right font-semibold text-gray-600">Próxima Revisão</TableHead>
                <TableHead className="text-right font-semibold text-gray-600">Km Restante</TableHead>
                <TableHead className="font-semibold text-gray-600">Ciclo</TableHead>
                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                <TableHead className="font-semibold text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayVehicles.map((vehicle, index) => {
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
                    <TableCell className="text-gray-600 max-w-[200px] truncate">
                      {vehicle.MODELO}
                    </TableCell>
                    <TableCell className="text-gray-600">{vehicle.MARCA}</TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatKm(vehicle.HODOMETRO)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatKm(vehicle.lastRevisionKm)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {formatKm(vehicle.nextRevisionKm)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-bold",
                      vehicle.kmUntilRevision <= 0 ? "text-purple-600" :
                      vehicle.kmUntilRevision <= 2000 ? "text-red-600" :
                      vehicle.kmUntilRevision <= 5000 ? "text-amber-600" :
                      "text-green-600"
                    )}>
                      {vehicle.kmUntilRevision <= 0 
                        ? `${formatKm(Math.abs(vehicle.kmUntilRevision))} atrás`
                        : formatKm(vehicle.kmUntilRevision)
                      }
                    </TableCell>
                    <TableCell>
                      <ProgressBar 
                        percentage={vehicle.revisionPercentage} 
                        status={vehicle.revisionStatus} 
                      />
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
