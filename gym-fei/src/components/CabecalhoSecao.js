import { Pressable, StyleSheet, View } from "react-native";

import { cores, espaco } from "../theme";
import Icone from "./Icone";
import Texto from "./Texto";

export default function CabecalhoSecao({ titulo, acao, onAcao, estilo }) {
  return (
    <View style={[estilos.base, estilo]}>
      <Texto variante="titulo3" accessibilityRole="header">
        {titulo}
      </Texto>
      {!!acao && (
        <Pressable
          onPress={onAcao}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={acao}
          style={({ pressed }) => [estilos.acao, pressed && { opacity: 0.6 }]}
        >
          <Texto variante="legendaForte" cor="primariaClara">
            {acao}
          </Texto>
          <Icone nome="chevron-right" tamanho={16} cor={cores.primariaClara} />
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: espaco.xxl,
    marginBottom: espaco.md,
  },
  acao: { flexDirection: "row", alignItems: "center", gap: 2 },
});
