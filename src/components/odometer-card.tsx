"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Check, Loader2, Pencil, X, Truck } from "lucide-react";
import { updateOdometerAction } from "@/app/actions";
import { Vehicle } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";
import { cn } from "@/lib/utils";

interface OdometerCardProps {
  vehicle: Vehicle;
}

export function OdometerCard({ vehicle }: OdometerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newKm, setNewKm] = useState(vehicle.HODOMETRO.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const km = parseInt(newKm, 10);
    if (isNaN(km) || km < 0) return;

    setIsLoading(true);
    const result = await updateOdometerAction(vehicle.PLACA, km);
    setIsLoading(false);

    if (result.success) {
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCancel = () => {
    setNewKm(vehicle.HODOMETRO.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        saved && "ring-2 ring-green-500 bg-green-50"
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
          {saved && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <Check className="h-3 w-3" />
              Salvo!
            </span>
          )}
        </div>

        {/* Model */}
        <p className="mb-3 truncate text-sm text-gray-600" title={vehicle.MODELO}>
          {vehicle.MODELO}
        </p>

        {/* Odometer */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Hodômetro</span>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={newKm}
                  onChange={(e) => setNewKm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-10"
                  autoFocus
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  km
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                disabled={isLoading}
                className="h-9 w-9 text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-9 w-9 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900">{formatKm(vehicle.HODOMETRO)}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
