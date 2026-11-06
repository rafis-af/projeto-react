import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { cores } from "../theme";

// Anel de progresso (0 a 1), usado no cronômetro de descanso e no resumo do treino.
export default function AnelProgresso({
  tamanho = 120,
  espessura = 10,
  progresso = 0,
  corTrilha = cores.superficie3,
  children,
  estilo,
}) {
  const id = `anelProgresso${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const valor = Math.min(1, Math.max(0, progresso));
  const centro = tamanho / 2;

  return (
    <View style={[{ width: tamanho, height: tamanho }, estilos.base, estilo]}>
      <Svg width={tamanho} height={tamanho} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8CBBFF" />
            <Stop offset="1" stopColor="#2563EB" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={centro}
          cy={centro}
          r={raio}
          stroke={corTrilha}
          strokeWidth={espessura}
          fill="none"
        />
        {valor > 0 && (
          <Circle
            cx={centro}
            cy={centro}
            r={raio}
            stroke={`url(#${id})`}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={`${circunferencia} ${circunferencia}`}
            strokeDashoffset={circunferencia * (1 - valor)}
            fill="none"
            transform={`rotate(-90, ${centro}, ${centro})`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
