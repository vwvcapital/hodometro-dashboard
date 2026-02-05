import { supabase } from "./supabase";
import { AuthUser } from "@/types/auth";

const AUTH_KEY = "hodometro_auth";

export async function login(usuario: string, senha: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("login_hodometro")
      .select("id, usuario, senha")
      .eq("usuario", usuario)
      .single();

    if (error || !data) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Verificar senha (comparação simples - em produção, use hash)
    if (data.senha !== senha) {
      return { success: false, error: "Senha incorreta" };
    }

    const user: AuthUser = {
      id: data.id,
      usuario: data.usuario,
    };

    // Salvar no localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }

    return { success: true, user };
  } catch {
    return { success: false, error: "Erro ao fazer login" };
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthUser;
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}
