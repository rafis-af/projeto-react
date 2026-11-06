import { StyleSheet, Text, View } from "react-native";

import { fontes } from "../theme";

// Tons de azul, ciano e verde-água (sem roxo) para diferenciar as pessoas.
const PALETA = [
  "#2563EB",
  "#0EA5E9",
  "#14B8A6",
  "#3B82F6",
  "#0284C7",
  "#0891B2",
  "#1D4ED8",
];

function corDoNome(nome) {
  let soma = 0;
  for (let i = 0; i < nome.length; i += 1)
    soma = (soma * 31 + nome.charCodeAt(i)) >>> 0;
  return PALETA[soma % PALETA.length];
}

export function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

export default function Avatar({ nome = "", tamanho = 44, estilo }) {
  const cor = corDoNome(nome);
  return (
    <View
      accessible={false}
      style={[
        estilos.base,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: `${cor}38`,
          borderColor: `${cor}80`,
        },
        estilo,
      ]}
    >
      <Text
        style={[estilos.texto, { fontSize: Math.round(tamanho * 0.36) }]}
        maxFontSizeMultiplier={1}
      >
        {iniciais(nome)}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  texto: { fontFamily: fontes.negrito, color: "#DCE8FF" },
});
