import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hzdflihidrmsnaqwyxbi.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6ZGZsaWhpZHJtc25hcXd5eGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzAxNTIsImV4cCI6MjA4NTAwNjE1Mn0.jns8WDK-Ag2pu5vW90D8jGTTr5rf8-2jQnZq8k3LSB0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para a tabela hodometro
export interface HodometroRow {
  id: number;
  placa: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  hodometro_km: number;
  ultima_revisao_km: number | null;
  ultima_revisao_tipo: "Completa" | "Intermediária" | null;
  created_at: string;
  updated_at: string;
}
