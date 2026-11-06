import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { MODO_DEMO, SUPABASE_CHAVE, SUPABASE_URL } from "./config";

// Cliente único do Supabase. Fica nulo no modo demonstração.
export const supabase = MODO_DEMO
  ? null
  : createClient(SUPABASE_URL, SUPABASE_CHAVE, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

// No celular, só renova o token enquanto o app está em primeiro plano
// (recomendação da documentação do Supabase para React Native).
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (estado) => {
    if (estado === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
