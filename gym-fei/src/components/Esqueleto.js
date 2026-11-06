import { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";

import { cores } from "../theme";

// Bloco pulsante exibido enquanto os dados carregam (indica o status do sistema).
export default function Esqueleto({
  largura = "100%",
  altura = 16,
  raio = 10,
  estilo,
}) {
  const opacidade = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const nativo = Platform.OS !== "web";
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: nativo,
        }),
        Animated.timing(opacidade, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: nativo,
        }),
      ])
    );
    animacao.start();
    return () => animacao.stop();
  }, [opacidade]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: largura,
          height: altura,
          borderRadius: raio,
          backgroundColor: cores.superficie2,
          opacity: opacidade,
        },
        estilo,
      ]}
    />
  );
}
