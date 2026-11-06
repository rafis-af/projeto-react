// Utilitários de data em pt-BR, sem depender de Intl (comportamento igual em todas as plataformas).

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_LETRA = ["D", "S", "T", "Q", "Q", "S", "S"];

const DIA_MS = 24 * 60 * 60 * 1000;

export function paraData(valor) {
  return valor instanceof Date ? valor : new Date(valor);
}

export function inicioDoDia(valor) {
  const d = paraData(valor);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Semana começando na segunda-feira
export function inicioDaSemana(valor = new Date()) {
  const d = inicioDoDia(valor);
  const diasDesdeSegunda = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diasDesdeSegunda);
  return d;
}

export function somarDias(valor, dias) {
  const d = paraData(valor);
  const r = new Date(d);
  r.setDate(r.getDate() + dias);
  return r;
}

export function mesmoDia(a, b) {
  return inicioDoDia(a).getTime() === inicioDoDia(b).getTime();
}

export function diasDaSemana(referencia = new Date()) {
  const inicio = inicioDaSemana(referencia);
  return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
}

export function letraDoDia(valor) {
  return DIAS_LETRA[paraData(valor).getDay()];
}

export function saudacao(agora = new Date()) {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

// "12 out"
export function formatarDiaMes(valor) {
  const d = paraData(valor);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// "seg, 12 out"
export function formatarDataCurta(valor) {
  const d = paraData(valor);
  return `${DIAS_CURTOS[d.getDay()]}, ${formatarDiaMes(d)}`;
}

// "12/10/2026"
export function formatarDataCompleta(valor) {
  const d = paraData(valor);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function formatarHora(valor) {
  const d = paraData(valor);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// "agora", "há 5 min", "há 2 h", "ontem", "há 3 dias", "12 out"
export function formatarRelativo(valor, agora = new Date()) {
  const d = paraData(valor);
  const diffMs = agora.getTime() - d.getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24 && mesmoDia(d, agora)) return `há ${horas} h`;
  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(d)) / DIA_MS);
  if (dias <= 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return formatarDiaMes(d);
}

// 2700 -> "45 min" | 3900 -> "1h 05min"
export function formatarDuracao(segundos) {
  const total = Math.max(0, Math.round((segundos ?? 0) / 60));
  if (total < 60) return `${total} min`;
  const horas = Math.floor(total / 60);
  const minutos = total % 60;
  return `${horas}h ${String(minutos).padStart(2, "0")}min`;
}

// 75 -> "01:15" | 3725 -> "1:02:05"
export function formatarCronometro(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}
