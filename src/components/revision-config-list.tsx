"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Wrench, Settings2 } from "lucide-react";
import { RevisionConfigRow } from "@/types/revision-config";
import {
  addRevisionConfig,
  updateRevisionConfig,
  deleteRevisionConfig,
} from "@/lib/api";

interface RevisionConfigListProps {
  configs: RevisionConfigRow[];
}

// Agrupa configs por marca
function groupByBrand(configs: RevisionConfigRow[]): Map<string, RevisionConfigRow[]> {
  const grouped = new Map<string, RevisionConfigRow[]>();
  
  configs.forEach((config) => {
    const existing = grouped.get(config.brand) || [];
    existing.push(config);
    grouped.set(config.brand, existing);
  });

  // Ordena por intervalo dentro de cada marca
  grouped.forEach((items, brand) => {
    grouped.set(brand, items.sort((a, b) => a.interval_km - b.interval_km));
  });

  return grouped;
}

function formatKm(km: number): string {
  return km.toLocaleString("pt-BR") + " km";
}

export function RevisionConfigList({ configs }: RevisionConfigListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RevisionConfigRow | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formBrand, setFormBrand] = useState("");
  const [formName, setFormName] = useState("");
  const [formInterval, setFormInterval] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const groupedConfigs = groupByBrand(configs);
  const brands = Array.from(groupedConfigs.keys()).sort();

  const resetForm = () => {
    setFormBrand("");
    setFormName("");
    setFormInterval("");
    setFormDescription("");
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (config: RevisionConfigRow) => {
    setFormBrand(config.brand);
    setFormName(config.revision_name);
    setFormInterval(config.interval_km.toString());
    setFormDescription(config.description || "");
    setEditingConfig(config);
  };

  const handleAdd = () => {
    if (!formBrand.trim() || !formName.trim() || !formInterval) return;

    startTransition(async () => {
      await addRevisionConfig({
        brand: formBrand.toUpperCase().trim(),
        revision_name: formName.trim(),
        interval_km: parseInt(formInterval),
        description: formDescription.trim() || undefined,
      });
      setIsAddDialogOpen(false);
      resetForm();
      window.location.reload();
    });
  };

  const handleUpdate = () => {
    if (!editingConfig || !formBrand.trim() || !formName.trim() || !formInterval) return;

    startTransition(async () => {
      await updateRevisionConfig(editingConfig.id, {
        brand: formBrand.toUpperCase().trim(),
        revision_name: formName.trim(),
        interval_km: parseInt(formInterval),
        description: formDescription.trim() || undefined,
      });
      setEditingConfig(null);
      resetForm();
      window.location.reload();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteRevisionConfig(id);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Ciclos de Revisão por Marca
          </h2>
          <p className="text-sm text-gray-500">
            Configure os intervalos de cada tipo de revisão para cada marca de veículo
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Ciclo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Ciclo de Revisão</DialogTitle>
              <DialogDescription>
                Configure um novo tipo de revisão para uma marca específica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  placeholder="Ex: MERCEDES-BENZ, VOLVO, SCANIA"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Revisão</Label>
                <Input
                  id="name"
                  placeholder="Ex: Troca de Filtro, Revisão Completa"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo (km)</Label>
                <Input
                  id="interval"
                  type="number"
                  placeholder="Ex: 5000, 20000"
                  value={formInterval}
                  onChange={(e) => setFormInterval(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Inclui filtro de óleo e ar"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={isPending}>
                {isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brand Cards */}
      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum ciclo configurado
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Adicione ciclos de revisão para cada marca de veículo
            </p>
            <Button onClick={openAddDialog} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro ciclo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            const brandConfigs = groupedConfigs.get(brand) || [];
            return (
              <Card key={brand} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    {brand}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {brandConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="flex items-start justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {config.revision_name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            A cada {formatKm(config.interval_km)}
                          </Badge>
                          {config.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {config.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(config)}
                          >
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir ciclo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o ciclo "{config.revision_name}" 
                                  de {config.brand}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(config.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ciclo de Revisão</DialogTitle>
            <DialogDescription>
              Altere as informações do ciclo de revisão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marca</Label>
              <Input
                id="edit-brand"
                placeholder="Ex: MERCEDES-BENZ, VOLVO, SCANIA"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Revisão</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Troca de Filtro, Revisão Completa"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Intervalo (km)</Label>
              <Input
                id="edit-interval"
                type="number"
                placeholder="Ex: 5000, 20000"
                value={formInterval}
                onChange={(e) => setFormInterval(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Input
                id="edit-description"
                placeholder="Ex: Inclui filtro de óleo e ar"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConfig(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
