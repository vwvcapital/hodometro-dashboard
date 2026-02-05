"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Gauge, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { OdometerRow } from "./odometer-row";
import { OdometerCard } from "./odometer-card";
import { cn } from "@/lib/utils";

type SortOption = "placa-asc" | "placa-desc" | "km-asc" | "km-desc" | "marca-asc" | "recent";

interface OdometerListProps {
  vehicles: Vehicle[];
}

export function OdometerList({ vehicles }: OdometerListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sortBy, setSortBy] = useState<SortOption>("placa-asc");

  const filteredAndSortedVehicles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = vehicles;
    if (query) {
      filtered = vehicles.filter(
        (v) =>
          v.PLACA.toLowerCase().includes(query) ||
          v.MARCA.toLowerCase().includes(query) ||
          v.MODELO.toLowerCase().includes(query)
      );
    }

    // Ordenação
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "placa-asc":
          return a.PLACA.localeCompare(b.PLACA);
        case "placa-desc":
          return b.PLACA.localeCompare(a.PLACA);
        case "km-asc":
          return a.HODOMETRO - b.HODOMETRO;
        case "km-desc":
          return b.HODOMETRO - a.HODOMETRO;
        case "marca-asc":
          return a.MARCA.localeCompare(b.MARCA);
        case "recent":
          const dateA = a.UPDATED_AT ? new Date(a.UPDATED_AT).getTime() : 0;
          const dateB = b.UPDATED_AT ? new Date(b.UPDATED_AT).getTime() : 0;
          return dateB - dateA; // Mais recente primeiro
        default:
          return 0;
      }
    });
  }, [vehicles, searchQuery, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search, Sort, and View Toggle */}
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

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Editado recentemente</SelectItem>
                <SelectItem value="placa-asc">Placa (A-Z)</SelectItem>
                <SelectItem value="placa-desc">Placa (Z-A)</SelectItem>
                <SelectItem value="km-desc">Maior Km</SelectItem>
                <SelectItem value="km-asc">Menor Km</SelectItem>
                <SelectItem value="marca-asc">Marca (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
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

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filteredAndSortedVehicles.length} veículo{filteredAndSortedVehicles.length !== 1 ? "s" : ""}
        {searchQuery && ` encontrado${filteredAndSortedVehicles.length !== 1 ? "s" : ""} para "${searchQuery}"`}
      </p>

      {/* Vehicle List */}
      {filteredAndSortedVehicles.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gauge className="mb-3 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum veículo encontrado</h3>
            <p className="text-sm text-gray-500">Tente ajustar os termos da pesquisa</p>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedVehicles.map((vehicle, index) => (
            <OdometerCard key={`${vehicle.PLACA}-${index}`} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedVehicles.map((vehicle, index) => (
            <OdometerRow key={`${vehicle.PLACA}-${index}`} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
