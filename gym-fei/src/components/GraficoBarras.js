import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { cores } from "../theme";
import Texto from "./Texto";

// Gráfico de barras simples, feito só com Views (sem biblioteca de gráficos).
export default function GraficoBarras({ dados, altura = 128 }) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <View
      style={estilos.base}
      accessible
      accessibilityLabel={dados
        .map((d) => `${d.rotulo}: ${d.valor}`)
        .join(", ")}
    >
      {dados.map((d) => {
        const alturaBarra =
          d.valor > 0 ? Math.max(8, (d.valor / maximo) * altura) : 4;
        return (
          <View key={d.chave ?? d.rotulo} style={estilos.coluna}>
            <Texto
              variante="pequeno"
              cor={d.destaque ? "texto" : "textoSecundario"}
            >
              {d.valor}
            </Texto>
            <View style={[estilos.trilha, { height: altura }]}>
              <LinearGradient
                colors={
                  d.destaque ? ["#8CBBFF", "#2563EB"] : ["#2F4E80", "#1B2C4A"]
                }
                style={[estilos.barra, { height: alturaBarra }]}
              />
            </View>
            <Texto
              variante="pequeno"
              cor={d.destaque ? "primariaClara" : "textoTerciario"}
              numberOfLines={1}
            >
              {d.rotulo}
            </Texto>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  coluna: { flex: 1, alignItems: "center", gap: 6 },
  trilha: { width: "100%", justifyContent: "flex-end", alignItems: "center" },
  barra: {
    width: "72%",
    maxWidth: 28,
    borderRadius: 8,
    backgroundColor: cores.superficie3,
  },
});
