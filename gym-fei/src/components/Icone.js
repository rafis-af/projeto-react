import { Lucide } from "@react-native-vector-icons/lucide";

import { cores } from "../theme";

// Ícones Lucide (traço uniforme). Nomes em https://lucide.dev/icons
export default function Icone({
  nome,
  tamanho = 20,
  cor = cores.texto,
  estilo,
}) {
  return (
    <Lucide
      name={nome}
      size={tamanho}
      color={cor}
      style={estilo}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
