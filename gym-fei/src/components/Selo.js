import { StyleSheet, Text, View } from "react-native";

import { cores, fontes, raio } from "../theme";
import Icone from "./Icone";

const VARIANTES = {
  primaria: { fundo: cores.primariaSuave, texto: cores.primariaClara },
  sucesso: { fundo: cores.sucessoSuave, texto: "#4ADE80" },
  alerta: { fundo: cores.alertaSuave, texto: "#FBBF24" },
  perigo: { fundo: cores.perigoSuave, texto: "#F87171" },
  neutro: { fundo: cores.superficie3, texto: cores.textoSecundario },
  vidro: { fundo: "rgba(6, 11, 22, 0.6)", texto: cores.texto },
};

export default function Selo({ texto, variante = "primaria", icone, estilo }) {
  const v = VARIANTES[variante] ?? VARIANTES.primaria;
  return (
    <View style={[estilos.base, { backgroundColor: v.fundo }, estilo]}>
      {!!icone && <Icone nome={icone} tamanho={12} cor={v.texto} />}
      <Text
        style={[estilos.texto, { color: v.texto }]}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {texto}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: raio.pilula,
  },
  texto: {
    fontFamily: fontes.negrito,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
