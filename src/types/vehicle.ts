export interface Vehicle {
  HODOMETRO: number;
  PLACA: string;
  TIPO: string;
  MARCA: string;
  MODELO: string;
  ULTIMA_REVISAO_KM?: number; // Km em que foi feita a última revisão
  UPDATED_AT?: string; // Data da última atualização
}

// Intervalo de revisão por marca (em km)
export interface RevisionInterval {
  brand: string;
  interval: number; // km entre revisões
  description: string;
}

export interface VehicleWithRevision extends Vehicle {
  revisionInterval: number;
  lastRevisionKm: number;
  nextRevisionKm: number;
  kmUntilRevision: number;
  revisionStatus: "ok" | "warning" | "critical" | "overdue";
  revisionPercentage: number; // % do ciclo de revisão atual
  nextRevisionType: "Completa" | "Intermediária"; // Tipo da próxima revisão
}

export interface RevisionStats {
  totalVehicles: number;
  overdue: number; // Veículos com revisão atrasada
  critical: number; // Próximos 2.000 km
  warning: number; // Próximos 5.000 km
  ok: number; // Fora da zona de atenção
  byBrand: { name: string; value: number; percentage: number }[];
  byStatus: { name: string; value: number; percentage: number; color: string }[];
}

export interface VehicleStats {
  totalVehicles: number;
  totalKm: number;
  avgKm: number;
  byBrand: { name: string; value: number; percentage: number }[];
  byType: { name: string; value: number; percentage: number }[];
}
