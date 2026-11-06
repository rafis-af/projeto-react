import { useId } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import { cores, fontes } from "../theme";

// Marca do GymFEI: um "G" em forma de anel de progresso com um halter
// rompendo a abertura, simbolizando superação ("Seu treino. Sua evolução.").
export function MarcaLogo({ tamanho = 64, corHalter = "#FFFFFF" }) {
  const id = `anel${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={id} x1="0.1" y1="0.9" x2="0.9" y2="0.1">
          <Stop offset="0" stopColor="#1D4ED8" />
          <Stop offset="0.6" stopColor="#2F6BFF" />
          <Stop offset="1" stopColor="#8CBBFF" />
        </LinearGradient>
      </Defs>
      <Path
        d="M 71.29 28.99 A 33 33 0 1 0 92.28 66.86"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={15}
        strokeLinecap="round"
      />
      <G transform="rotate(-42, 72, 50)" fill={corHalter}>
        <Rect x={55} y={46} width={34} height={8} rx={4} />
        <Rect x={50} y={35} width={10} height={30} rx={4} />
        <Rect x={84} y={35} width={10} height={30} rx={4} />
      </G>
    </Svg>
  );
}

export default function Logo({
  tamanho = 48,
  slogan = false,
  vertical = false,
}) {
  const tamanhoTexto = Math.round(tamanho * (vertical ? 0.62 : 0.58));
  return (
    <View
      style={[estilos.base, vertical && estilos.vertical]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="GymFEI"
    >
      <MarcaLogo tamanho={vertical ? tamanho * 1.6 : tamanho} />
      <View style={vertical ? estilos.textoVertical : estilos.textoHorizontal}>
        <Text
          style={[
            estilos.nome,
            { fontSize: tamanhoTexto, lineHeight: tamanhoTexto * 1.1 },
          ]}
        >
          Gym<Text style={estilos.destaque}>FEI</Text>
        </Text>
        {slogan && (
          <Text style={[estilos.slogan, vertical && { textAlign: "center" }]}>
            SEU TREINO. SUA EVOLUÇÃO.
          </Text>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center" },
  vertical: { flexDirection: "column" },
  textoHorizontal: { marginLeft: 10 },
  textoVertical: { marginTop: 14, alignItems: "center" },
  nome: { fontFamily: fontes.extra, color: cores.texto, letterSpacing: -0.6 },
  destaque: { color: cores.primariaClara },
  slogan: {
    fontFamily: fontes.negrito,
    fontSize: 10,
    letterSpacing: 2.6,
    color: cores.textoSecundario,
    marginTop: 4,
  },
});
