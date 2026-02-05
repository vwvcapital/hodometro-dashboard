"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Check, Loader2, Pencil, X } from "lucide-react";
import { updateOdometer } from "@/lib/api";
import { Vehicle } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";
import { cn } from "@/lib/utils";

interface OdometerRowProps {
  vehicle: Vehicle;
}

export function OdometerRow({ vehicle }: OdometerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newKm, setNewKm] = useState(vehicle.HODOMETRO.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const km = parseInt(newKm, 10);
    if (isNaN(km) || km < 0) return;

    setIsLoading(true);
    const result = await updateOdometer(vehicle.PLACA, km);
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
    <Card className={cn(
      "transition-all",
      saved && "ring-2 ring-green-500 bg-green-50"
    )}>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Vehicle Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Gauge className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{vehicle.PLACA}</p>
            <p className="text-xs text-gray-500">{vehicle.MARCA}</p>
          </div>
        </div>

        {/* Model */}
        <div className="flex-1 hidden sm:block">
          <p className="text-sm text-gray-600 truncate" title={vehicle.MODELO}>
            {vehicle.MODELO}
          </p>
        </div>

        {/* Odometer Edit */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <div className="relative">
                <Input
                  type="number"
                  value={newKm}
                  onChange={(e) => setNewKm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-32 pr-10"
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
            </>
          ) : (
            <>
              <div className="text-right min-w-[120px]">
                <p className="font-semibold text-gray-900">{formatKm(vehicle.HODOMETRO)}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Saved indicator */}
        {saved && (
          <span className="text-sm font-medium text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" />
            Salvo!
          </span>
        )}
      </CardContent>
    </Card>
  );
}
