export interface RevisionType {
  id: string;
  name: string; // Ex: "Troca de Filtro", "Revisão Completa"
  interval_km: number; // Intervalo em km
  description?: string;
}

export interface BrandRevisionConfig {
  id: string;
  brand: string; // Ex: "MERCEDES-BENZ", "VOLVO"
  revision_types: RevisionType[];
  created_at?: string;
  updated_at?: string;
}

// Para o Supabase
export interface RevisionConfigRow {
  id: string;
  brand: string;
  revision_name: string;
  interval_km: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
