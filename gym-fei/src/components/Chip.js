import { Pressable, StyleSheet, Text } from "react-native";

import { cores, fontes, raio } from "../theme";
import { vibrarSelecao } from "../utils/feedback";
import Icone from "./Icone";

export default function Chip({
  rotulo,
  selecionado = false,
  onPress,
  icone,
  estilo,
}) {
  return (
    <Pressable
      onPress={() => {
        vibrarSelecao();
        onPress?.();
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      aria-selected={selecionado}
      style={({ pressed }) => [
        estilos.base,
        selecionado && estilos.selecionado,
        pressed && estilos.pressionado,
        estilo,
      ]}
    >
      {!!icone && (
        <Icone
          nome={icone}
          tamanho={15}
          cor={selecionado ? "#fff" : cores.primariaClara}
        />
      )}
      <Text
        maxFontSizeMultiplier={1.3}
        style={[estilos.texto, selecionado && estilos.textoSelecionado]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficie2,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  selecionado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  pressionado: { opacity: 0.8 },
  texto: {
    fontFamily: fontes.semibold,
    fontSize: 14,
    color: cores.textoSecundario,
  },
  textoSelecionado: { color: "#fff" },
});
