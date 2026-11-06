import { StyleSheet, View } from "react-native";

import { MODO_DEMO } from "../lib/config";
import { cores, espaco, raio } from "../theme";
import Icone from "./Icone";
import Texto from "./Texto";

// Aparece só quando o Supabase ainda não foi configurado no .env
export default function AvisoDemo({ estilo }) {
  if (!MODO_DEMO) return null;
  return (
    <View style={[estilos.base, estilo]} accessibilityRole="text">
      <Icone nome="flask-conical" tamanho={18} cor="#FBBF24" />
      <View style={estilos.texto}>
        <Texto variante="legendaForte" cor="#FBBF24">
          Modo demonstração
        </Texto>
        <Texto variante="legenda" cor="textoSecundario">
          Os dados ficam salvos só neste aparelho. Configure o Supabase no
          arquivo .env para usar o banco de dados real.
        </Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: "row",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.alertaSuave,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  texto: { flex: 1, gap: 2 },
});
