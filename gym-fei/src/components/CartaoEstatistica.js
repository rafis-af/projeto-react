import { StyleSheet, View } from "react-native";

import { cores, espaco, raio, tipografia } from "../theme";
import Icone from "./Icone";
import Texto from "./Texto";

export default function CartaoEstatistica({
  icone,
  valor,
  rotulo,
  cor = cores.primariaClara,
  estilo,
}) {
  return (
    <View
      style={[estilos.base, estilo]}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <View style={[estilos.icone, { backgroundColor: `${cor}22` }]}>
        <Icone nome={icone} tamanho={16} cor={cor} />
      </View>
      <Texto
        variante="numero"
        estilo={estilos.valor}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {valor}
      </Texto>
      <Texto variante="legenda" cor="textoSecundario" numberOfLines={2}>
        {rotulo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
    paddingVertical: 14,
  },
  icone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.sm,
  },
  valor: { ...tipografia.numero, fontSize: 24, lineHeight: 28 },
});
