"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Loader2 } from "lucide-react";
import { registerRevision } from "@/lib/api";
import { VehicleWithRevision } from "@/types/vehicle";
import { formatKm } from "@/lib/sheets";

interface RevisionDialogProps {
  vehicle: VehicleWithRevision;
}

export function RevisionDialog({ vehicle }: RevisionDialogProps) {
  const [open, setOpen] = useState(false);
  const [revisaoKm, setRevisaoKm] = useState(vehicle.HODOMETRO.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const km = parseInt(revisaoKm, 10);
    if (isNaN(km) || km <= 0) {
      setError("Por favor, insira um valor válido de quilometragem");
      setIsLoading(false);
      return;
    }

    const result = await registerRevision(vehicle.PLACA, km);

    if (result.success) {
      setOpen(false);
      // Reset form
      setRevisaoKm(vehicle.HODOMETRO.toString());
    } else {
      setError(result.error || "Erro ao registrar revisão");
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Wrench className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Registrar Revisão</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Registrar Nova Revisão
            </DialogTitle>
            <DialogDescription>
              Registre a revisão realizada para o veículo <strong>{vehicle.PLACA}</strong>.
              Isso irá reiniciar o ciclo de revisão.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Vehicle Info */}
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Veículo:</span>
                  <p className="font-medium text-gray-900">{vehicle.MODELO}</p>
                </div>
                <div>
                  <span className="text-gray-500">Marca:</span>
                  <p className="font-medium text-gray-900">{vehicle.MARCA}</p>
                </div>
                <div>
                  <span className="text-gray-500">Hodômetro Atual:</span>
                  <p className="font-medium text-gray-900">{formatKm(vehicle.HODOMETRO)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Intervalo de Revisão:</span>
                  <p className="font-medium text-blue-600">{formatKm(vehicle.revisionInterval)}</p>
                </div>
              </div>
            </div>

            {/* Revision KM Input */}
            <div className="space-y-2">
              <Label htmlFor="revisao-km" className="text-gray-700">
                Quilometragem da Revisão
              </Label>
              <div className="relative">
                <Input
                  id="revisao-km"
                  type="number"
                  value={revisaoKm}
                  onChange={(e) => setRevisaoKm(e.target.value)}
                  placeholder="Ex: 500000"
                  className="pr-12"
                  min={0}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  km
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Informe a quilometragem em que a revisão foi realizada.
                A próxima revisão será calculada automaticamente.
              </p>
            </div>

            {/* Next Revision Preview */}
            {revisaoKm && !isNaN(parseInt(revisaoKm)) && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  <strong>Próxima revisão em:</strong>{" "}
                  {formatKm(parseInt(revisaoKm) + vehicle.revisionInterval)}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Confirmar Revisão
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
