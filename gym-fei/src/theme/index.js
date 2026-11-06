// Design system do GymFEI: todas as cores, fontes e medidas do app saem daqui.
// Paleta azul-escura (sem roxo), pensada para contraste AA sobre fundo escuro.

export const cores = {
  fundo: "#060B16",
  fundoElevado: "#0A1324",
  superficie: "#0F1A2E",
  superficie2: "#14223B",
  superficie3: "#1B2C4A",
  borda: "#1C2B47",
  bordaForte: "#2A3E63",

  primaria: "#2563EB",
  primariaForte: "#1D4ED8",
  primariaProfunda: "#1E3A8A",
  primariaClara: "#5B9BFF",
  primariaSuave: "rgba(37, 99, 235, 0.16)",
  primariaBrilho: "#8CBBFF",
  ciano: "#38BDF8",

  texto: "#F1F5FF",
  textoSecundario: "#A3B1CC",
  textoTerciario: "#7787A6",
  textoSobrePrimaria: "#FFFFFF",

  sucesso: "#22C55E",
  sucessoSuave: "rgba(34, 197, 94, 0.14)",
  alerta: "#F59E0B",
  alertaSuave: "rgba(245, 158, 11, 0.14)",
  perigo: "#EF4444",
  perigoSuave: "rgba(239, 68, 68, 0.14)",

  sobreposicao: "rgba(3, 6, 14, 0.74)",
  transparente: "transparent",
};

export const gradientes = {
  primario: ["#3B7BFF", "#1D4ED8"],
  destaque: ["#14306B", "#0B1834"],
  capa: ["#0B1630", "#102655"],
  tela: ["#0B1834", "#060B16"],
};

export const fontes = {
  regular: "Montserrat-Regular",
  media: "Montserrat-Medium",
  semibold: "Montserrat-SemiBold",
  negrito: "Montserrat-Bold",
  extra: "Montserrat-ExtraBold",
  black: "Montserrat-Black",
};

export const tipografia = {
  display: {
    fontFamily: fontes.extra,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  titulo1: {
    fontFamily: fontes.extra,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  titulo2: {
    fontFamily: fontes.negrito,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  titulo3: { fontFamily: fontes.negrito, fontSize: 17, lineHeight: 22 },
  corpo: { fontFamily: fontes.media, fontSize: 15, lineHeight: 22 },
  corpoForte: { fontFamily: fontes.semibold, fontSize: 15, lineHeight: 22 },
  legenda: { fontFamily: fontes.media, fontSize: 13, lineHeight: 18 },
  legendaForte: { fontFamily: fontes.semibold, fontSize: 13, lineHeight: 18 },
  pequeno: { fontFamily: fontes.semibold, fontSize: 11, lineHeight: 14 },
  rotulo: {
    fontFamily: fontes.negrito,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  numero: {
    fontFamily: fontes.extra,
    fontSize: 26,
    lineHeight: 30,
    fontVariant: ["tabular-nums"],
  },
  cronometro: {
    fontFamily: fontes.extra,
    fontSize: 56,
    lineHeight: 62,
    fontVariant: ["tabular-nums"],
  },
};

export const espaco = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  gigante: 48,
};

// Margem lateral padrão das telas
export const margemTela = espaco.xl;

export const raio = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pilula: 999,
};

// Área mínima de toque recomendada (Apple HIG 44pt / Material 48dp)
export const alvoToque = 48;

export const sombras = {
  brilhoPrimario: {
    shadowColor: "#2563EB",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cartao: {
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};
