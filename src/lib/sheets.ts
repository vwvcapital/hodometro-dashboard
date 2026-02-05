import { Vehicle, VehicleStats, VehicleWithRevision, RevisionStats, RevisionInterval } from "@/types/vehicle";
import { RevisionConfigRow } from "@/types/revision-config";
import { supabase, HodometroRow } from "./supabase";

// Intervalo padrão para marcas não listadas
const DEFAULT_INTERVAL = 20000;

// Cache para armazenar os intervalos de revisão do banco
let revisionIntervalsCache: RevisionConfigRow[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minuto

// Busca os intervalos de revisão do Supabase
export async function fetchRevisionIntervalsFromDB(): Promise<RevisionConfigRow[]> {
  const now = Date.now();
  
  // Retorna cache se ainda for válido
  if (revisionIntervalsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return revisionIntervalsCache;
  }
  
  try {
    const { data, error } = await supabase
      .from("revision_config")
      .select("*")
      .order("brand", { ascending: true })
      .order("interval_km", { ascending: true });

    if (error) {
      console.error("Error fetching revision intervals:", error);
      return [];
    }

    revisionIntervalsCache = data || [];
    cacheTimestamp = now;
    return revisionIntervalsCache;
  } catch (error) {
    console.error("Error fetching revision intervals:", error);
    return [];
  }
}

// Busca o menor intervalo de revisão para uma marca (revisão intermediária)
export function getRevisionIntervalFromConfigs(brand: string, configs: RevisionConfigRow[]): number {
  const normalizedBrand = brand?.toUpperCase().trim() || "";
  
  // Encontra todas as configurações para esta marca
  const brandConfigs = configs.filter(
    (r) => normalizedBrand.includes(r.brand.toUpperCase()) || r.brand.toUpperCase().includes(normalizedBrand)
  );
  
  if (brandConfigs.length === 0) {
    return DEFAULT_INTERVAL;
  }
  
  // Retorna o menor intervalo (revisão intermediária)
  return Math.min(...brandConfigs.map(c => c.interval_km));
}

// Busca todos os intervalos de revisão para uma marca
export function getAllRevisionIntervalsForBrand(brand: string, configs: RevisionConfigRow[]): { name: string; interval: number }[] {
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

// Determina o tipo da próxima revisão baseado no km
export function getNextRevisionType(
  nextRevisionKm: number, 
  brand: string, 
  configs: RevisionConfigRow[]
): "Completa" | "Intermediária" {
  const intervals = getAllRevisionIntervalsForBrand(brand, configs);
  
  if (intervals.length <= 1) {
    return "Completa"; // Se só tem um tipo, é completa
  }
  
  // Ordena por intervalo (menor = intermediária, maior = completa)
  const sortedIntervals = [...intervals].sort((a, b) => a.interval - b.interval);
  const completaInterval = sortedIntervals[sortedIntervals.length - 1].interval;
  
  // Verifica se a próxima revisão é múltiplo do intervalo da completa
  if (nextRevisionKm % completaInterval === 0) {
    return "Completa";
  }
  
  return "Intermediária";
}

// Converte configs do banco para o formato RevisionInterval (para exibição)
export function configsToIntervals(configs: RevisionConfigRow[]): RevisionInterval[] {
  // Agrupa por marca e pega o menor intervalo
  const brandMap = new Map<string, number>();
  
  configs.forEach((config) => {
    const currentMin = brandMap.get(config.brand);
    if (!currentMin || config.interval_km < currentMin) {
      brandMap.set(config.brand, config.interval_km);
    }
  });
  
  return Array.from(brandMap.entries()).map(([brand, interval]) => ({
    brand,
    interval,
    description: `A cada ${interval.toLocaleString("pt-BR")} km`,
  }));
}

// Converte dados do Supabase para o formato Vehicle
function mapRowToVehicle(row: HodometroRow): Vehicle {
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

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from("hodometro")
      .select("*")
      .order("placa", { ascending: true });

    if (error) {
      console.error("Error fetching vehicles from Supabase:", error);
      return [];
    }

    return (data || []).map(mapRowToVehicle);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

// Função para atualizar o hodômetro de um veículo
export async function updateVehicleOdometer(placa: string, hodometroKm: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("hodometro")
      .update({ 
        hodometro_km: hodometroKm,
        updated_at: new Date().toISOString()
      })
      .eq("placa", placa);

    if (error) {
      console.error("Error updating odometer:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating odometer:", error);
    return false;
  }
}

// Função para registrar uma revisão
export async function registerRevision(placa: string, revisaoKm: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("hodometro")
      .update({ 
        ultima_revisao_km: revisaoKm,
        updated_at: new Date().toISOString()
      })
      .eq("placa", placa);

    if (error) {
      console.error("Error registering revision:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error registering revision:", error);
    return false;
  }
}

// ==========================================
// CONFIGURAÇÕES DE CICLOS DE REVISÃO
// ==========================================

export async function fetchRevisionConfigs(): Promise<RevisionConfigRow[]> {
  try {
    const { data, error } = await supabase
      .from("revision_config")
      .select("*")
      .order("brand", { ascending: true })
      .order("interval_km", { ascending: true });

    if (error) {
      console.error("Error fetching revision configs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching revision configs:", error);
    return [];
  }
}

export async function addRevisionConfig(config: Omit<RevisionConfigRow, "id" | "created_at" | "updated_at">): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("revision_config")
      .insert({
        brand: config.brand,
        revision_name: config.revision_name,
        interval_km: config.interval_km,
        description: config.description,
      });

    if (error) {
      console.error("Error adding revision config:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error adding revision config:", error);
    return false;
  }
}

export async function updateRevisionConfig(
  id: string,
  config: Partial<Omit<RevisionConfigRow, "id" | "created_at" | "updated_at">>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("revision_config")
      .update({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating revision config:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating revision config:", error);
    return false;
  }
}

export async function deleteRevisionConfig(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("revision_config")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting revision config:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error deleting revision config:", error);
    return false;
  }
}

// Função para adicionar um novo veículo
export async function addVehicle(vehicle: Omit<Vehicle, "ULTIMA_REVISAO_KM">): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("hodometro")
      .insert({
        placa: vehicle.PLACA,
        tipo: vehicle.TIPO,
        marca: vehicle.MARCA,
        modelo: vehicle.MODELO,
        hodometro_km: vehicle.HODOMETRO,
        ultima_revisao_km: 0,
      });

    if (error) {
      console.error("Error adding vehicle:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return false;
  }
}

export function calculateStats(vehicles: Vehicle[]): VehicleStats {
  const totalVehicles = vehicles.length;
  const totalKm = vehicles.reduce((sum, v) => sum + (v.HODOMETRO || 0), 0);
  const avgKm = totalVehicles > 0 ? Math.round(totalKm / totalVehicles) : 0;

  // Count by brand
  const brandCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const brand = v.MARCA || "Outros";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  const byBrand = Object.entries(brandCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalVehicles) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // Count by type
  const typeCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const type = v.TIPO || "Outros";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const byType = Object.entries(typeCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalVehicles) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalVehicles,
    totalKm,
    avgKm,
    byBrand,
    byType,
  };
}

/**
 * Calcula informações de revisão para cada veículo
 * A lógica considera que:
 * - Se ULTIMA_REVISAO_KM está preenchido, usa como base
 * - Senão, estima baseado no hodômetro atual e intervalo
 */
export function calculateVehicleRevision(vehicle: Vehicle, configs: RevisionConfigRow[]): VehicleWithRevision {
  const interval = getRevisionIntervalFromConfigs(vehicle.MARCA, configs);
  const currentKm = vehicle.HODOMETRO || 0;
  
  // Se temos a última revisão registrada, usamos ela
  // Senão, estimamos baseado no hodômetro atual
  let lastRevisionKm: number;
  
  if (vehicle.ULTIMA_REVISAO_KM && vehicle.ULTIMA_REVISAO_KM > 0) {
    lastRevisionKm = vehicle.ULTIMA_REVISAO_KM;
  } else {
    // Estima a última revisão baseada no hodômetro
    // Ex: Se hodômetro = 873.000 e intervalo = 20.000
    // Última revisão foi em 860.000 (873.000 - (873.000 % 20.000))
    lastRevisionKm = Math.floor(currentKm / interval) * interval;
  }
  
  const nextRevisionKm = lastRevisionKm + interval;
  const kmUntilRevision = nextRevisionKm - currentKm;
  
  // Calcula o % do ciclo atual (quanto já foi percorrido desde última revisão)
  const kmSinceLastRevision = currentKm - lastRevisionKm;
  const revisionPercentage = Math.min(Math.round((kmSinceLastRevision / interval) * 100), 100);
  
  // Define o status baseado na quilometragem restante
  let revisionStatus: "ok" | "warning" | "critical" | "overdue";
  if (kmUntilRevision <= 0) {
    revisionStatus = "overdue"; // Passou da revisão
  } else if (kmUntilRevision <= 2000) {
    revisionStatus = "critical"; // Próximos 2.000 km
  } else if (kmUntilRevision <= 5000) {
    revisionStatus = "warning"; // Próximos 5.000 km
  } else {
    revisionStatus = "ok";
  }
  
  // Determina o tipo da próxima revisão
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

export function calculateVehiclesWithRevision(vehicles: Vehicle[], configs: RevisionConfigRow[]): VehicleWithRevision[] {
  return vehicles.map((v) => calculateVehicleRevision(v, configs));
}

export function calculateRevisionStats(vehicles: VehicleWithRevision[]): RevisionStats {
  const totalVehicles = vehicles.length;
  
  const overdue = vehicles.filter((v) => v.revisionStatus === "overdue").length;
  const critical = vehicles.filter((v) => v.revisionStatus === "critical").length;
  const warning = vehicles.filter((v) => v.revisionStatus === "warning").length;
  const ok = vehicles.filter((v) => v.revisionStatus === "ok").length;
  
  // Count by brand
  const brandCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const brand = v.MARCA || "Outros";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  const byBrand = Object.entries(brandCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalVehicles) * 100),
    }))
    .sort((a, b) => b.value - a.value);
  
  // Status distribution
  const byStatus = [
    { name: "Em dia", value: ok, percentage: Math.round((ok / totalVehicles) * 100), color: "#10B981" },
    { name: "Atenção", value: warning, percentage: Math.round((warning / totalVehicles) * 100), color: "#F59E0B" },
    { name: "Crítico", value: critical, percentage: Math.round((critical / totalVehicles) * 100), color: "#EF4444" },
    { name: "Atrasado", value: overdue, percentage: Math.round((overdue / totalVehicles) * 100), color: "#7C3AED" },
  ].filter((s) => s.value > 0);
  
  return {
    totalVehicles,
    overdue,
    critical,
    warning,
    ok,
    byBrand,
    byStatus,
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR").format(num);
}

export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}
