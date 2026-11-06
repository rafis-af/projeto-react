import { Text } from "react-native";

import { cores, tipografia } from "../theme";

// Texto padrão do app. `variante` vem da escala tipográfica e `cor` aceita
// um nome do tema ("textoSecundario") ou uma cor direta ("#fff").
export default function Texto({
  variante = "corpo",
  cor = "texto",
  alinhamento,
  estilo,
  children,
  ...props
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      {...props}
      style={[
        tipografia[variante],
        { color: cores[cor] ?? cor },
        alinhamento && { textAlign: alinhamento },
        estilo,
      ]}
    >
      {children}
    </Text>
  );
}
