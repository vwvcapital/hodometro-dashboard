import { supabase } from "@/lib/supabase";
import { RevisionConfigRow } from "@/types/revision-config";

export async function registerRevision(placa: string, revisaoKm: number) {
  try {
    const { error } = await supabase
      .from("hodometro")
      .update({
        ultima_revisao_km: revisaoKm,
        updated_at: new Date().toISOString(),
      })
      .eq("placa", placa);

    if (error) {
      console.error("Error registering revision:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error registering revision:", error);
    return { success: false, error: "Erro ao registrar revisão" };
  }
}

export async function updateOdometer(placa: string, hodometroKm: number) {
  try {
    const { error } = await supabase
      .from("hodometro")
      .update({
        hodometro_km: hodometroKm,
        updated_at: new Date().toISOString(),
      })
      .eq("placa", placa);

    if (error) {
      console.error("Error updating odometer:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating odometer:", error);
    return { success: false, error: "Erro ao atualizar hodômetro" };
  }
}

export async function addRevisionConfig(
  config: Omit<RevisionConfigRow, "id" | "created_at" | "updated_at">
) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding revision config:", error);
    return { success: false, error: "Erro ao adicionar configuração" };
  }
}

export async function updateRevisionConfig(
  id: string,
  config: Partial<Omit<RevisionConfigRow, "id" | "created_at" | "updated_at">>
) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating revision config:", error);
    return { success: false, error: "Erro ao atualizar configuração" };
  }
}

export async function deleteRevisionConfig(id: string) {
  try {
    const { error } = await supabase
      .from("revision_config")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting revision config:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting revision config:", error);
    return { success: false, error: "Erro ao excluir configuração" };
  }
}
