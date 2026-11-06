// Lê as variáveis de ambiente públicas do Expo (arquivo .env / .env.local).
// Sem elas o app roda em "modo demonstração", com dados salvos só no aparelho.

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_CHAVE =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const MODO_DEMO = !SUPABASE_URL || !SUPABASE_CHAVE;

export const VERSAO_APP = "2.0.0";
