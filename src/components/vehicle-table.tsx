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
import { Vehicle } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";
import { Truck } from "lucide-react";

interface VehicleTableProps {
  vehicles: Vehicle[];
}

function getOdometerStatus(km: number) {
  if (km >= 500000) {
    return { label: "Alta", variant: "destructive" as const };
  } else if (km >= 300000) {
    return { label: "Média", variant: "secondary" as const };
  } else {
    return { label: "Normal", variant: "default" as const };
  }
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <CardTitle className="text-lg font-semibold text-gray-900">
          Frota de Veículos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-semibold text-gray-600">
                  Placa
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Modelo
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Marca
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600">
                  Hodômetro
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, index) => {
                const status = getOdometerStatus(vehicle.HODOMETRO);
                return (
                  <TableRow
                    key={`${vehicle.PLACA}-${index}`}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {vehicle.PLACA}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {vehicle.MODELO}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {vehicle.TIPO}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {vehicle.MARCA}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatKm(vehicle.HODOMETRO)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
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
