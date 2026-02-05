"use client";

import { useState, useEffect, useCallback } from "react";
import { Vehicle, VehicleWithRevision } from "@/types/vehicle";
import { RevisionConfigRow } from "@/types/revision-config";
import { supabase } from "@/lib/supabase";

// Intervalo padrão para marcas não listadas
const DEFAULT_INTERVAL = 20000;

function mapRowToVehicle(row: any): Vehicle {
  return {
    HODOMETRO: row.hodometro_km || 0,
    PLACA: row.placa || "",
    TIPO: row.tipo || "",
    MARCA: row.marca || "",
    MODELO: row.modelo || "",
    ULTIMA_REVISAO_KM: row.ultima_revisao_km || undefined,
    UPDATED_AT: row.updated_at || undefined,
  };
}

function getRevisionIntervalFromConfigs(brand: string, configs: RevisionConfigRow[]): number {
  const normalizedBrand = brand?.toUpperCase().trim() || "";
  
  const brandConfigs = configs.filter(
    (r) => normalizedBrand.includes(r.brand.toUpperCase()) || r.brand.toUpperCase().includes(normalizedBrand)
  );
  
  if (brandConfigs.length === 0) {
    return DEFAULT_INTERVAL;
  }
  
  return Math.min(...brandConfigs.map(c => c.interval_km));
}

function getAllRevisionIntervalsForBrand(brand: string, configs: RevisionConfigRow[]): { name: string; interval: number }[] {
  const normalizedBrand = brand?.toUpperCase().trim() || "";
  
  const brandConfigs = configs.filter(
    (r) => normalizedBrand.includes(r.brand.toUpperCase()) || r.brand.toUpperCase().includes(normalizedBrand)
  );
  
  if (brandConfigs.length === 0) {
    return [{ name: "Revisão", interval: DEFAULT_INTERVAL }];
  }
  
  return brandConfigs
    .map(c => ({ name: c.revision_name, interval: c.interval_km }))
    .sort((a, b) => a.interval - b.interval);
}

function getNextRevisionType(
  nextRevisionKm: number, 
  brand: string, 
  configs: RevisionConfigRow[]
): "Completa" | "Intermediária" {
  const intervals = getAllRevisionIntervalsForBrand(brand, configs);
  
  if (intervals.length <= 1) {
    return "Completa";
  }
  
  const sortedIntervals = [...intervals].sort((a, b) => a.interval - b.interval);
  const completaInterval = sortedIntervals[sortedIntervals.length - 1].interval;
  
  if (nextRevisionKm % completaInterval === 0) {
    return "Completa";
  }
  
  return "Intermediária";
}

function calculateVehicleRevision(vehicle: Vehicle, configs: RevisionConfigRow[]): VehicleWithRevision {
  const interval = getRevisionIntervalFromConfigs(vehicle.MARCA, configs);
  const currentKm = vehicle.HODOMETRO || 0;
  
  let lastRevisionKm: number;
  
  if (vehicle.ULTIMA_REVISAO_KM && vehicle.ULTIMA_REVISAO_KM > 0) {
    lastRevisionKm = vehicle.ULTIMA_REVISAO_KM;
  } else {
    lastRevisionKm = Math.floor(currentKm / interval) * interval;
  }
  
  const nextRevisionKm = lastRevisionKm + interval;
  const kmUntilRevision = nextRevisionKm - currentKm;
  
  const kmSinceLastRevision = currentKm - lastRevisionKm;
  const revisionPercentage = Math.min(Math.round((kmSinceLastRevision / interval) * 100), 100);
  
  let revisionStatus: "ok" | "warning" | "critical" | "overdue";
  if (kmUntilRevision <= 0) {
    revisionStatus = "overdue";
  } else if (kmUntilRevision <= 2000) {
    revisionStatus = "critical";
  } else if (kmUntilRevision <= 5000) {
    revisionStatus = "warning";
  } else {
    revisionStatus = "ok";
  }
  
  const nextRevisionType = getNextRevisionType(nextRevisionKm, vehicle.MARCA, configs);
  
  return {
    ...vehicle,
    revisionInterval: interval,
    lastRevisionKm,
    nextRevisionKm,
    kmUntilRevision,
    revisionStatus,
    revisionPercentage,
    nextRevisionType,
  };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [revisionConfigs, setRevisionConfigs] = useState<RevisionConfigRow[]>([]);
  const [vehiclesWithRevision, setVehiclesWithRevision] = useState<VehicleWithRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("hodometro")
        .select("*")
        .order("placa", { ascending: true });

      if (vehicleError) {
        console.error("Error fetching vehicles:", vehicleError);
        setError(vehicleError.message);
        return;
      }

      // Fetch revision configs
      const { data: configData, error: configError } = await supabase
        .from("revision_config")
        .select("*")
        .order("brand", { ascending: true })
        .order("interval_km", { ascending: true });

      if (configError) {
        console.error("Error fetching configs:", configError);
        // Continue with empty configs
      }

      const mappedVehicles = (vehicleData || []).map(mapRowToVehicle);
      const configs = configData || [];
      
      setVehicles(mappedVehicles);
      setRevisionConfigs(configs);
      setVehiclesWithRevision(mappedVehicles.map(v => calculateVehicleRevision(v, configs)));
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    vehicles,
    vehiclesWithRevision,
    revisionConfigs,
    loading,
    error,
    refresh,
  };
}

export function useRevisionConfigs() {
  const [configs, setConfigs] = useState<RevisionConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("revision_config")
        .select("*")
        .order("brand", { ascending: true })
        .order("interval_km", { ascending: true });

      if (fetchError) {
        console.error("Error fetching configs:", fetchError);
        setError(fetchError.message);
        return;
      }

      setConfigs(data || []);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const refresh = useCallback(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    refresh,
  };
}
