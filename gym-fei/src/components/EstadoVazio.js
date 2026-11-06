import { StyleSheet, View } from "react-native";

import { cores, espaco } from "../theme";
import Botao from "./Botao";
import Icone from "./Icone";
import Texto from "./Texto";

// Mensagem amigável para listas vazias, sempre sugerindo o próximo passo.
export default function EstadoVazio({
  icone = "inbox",
  titulo,
  descricao,
  acao,
  estilo,
}) {
  return (
    <View style={[estilos.base, estilo]}>
      <View style={estilos.circulo}>
        <Icone nome={icone} tamanho={28} cor={cores.primariaClara} />
      </View>
      <Texto variante="titulo3" alinhamento="center">
        {titulo}
      </Texto>
      {!!descricao && (
        <Texto
          variante="corpo"
          cor="textoSecundario"
          alinhamento="center"
          estilo={estilos.descricao}
        >
          {descricao}
        </Texto>
      )}
      {acao && (
        <Botao
          titulo={acao.titulo}
          icone={acao.icone}
          onPress={acao.onPress}
          variante={acao.variante ?? "primario"}
          larguraTotal={false}
          estilo={estilos.acao}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: "center",
    paddingVertical: espaco.xxxl,
    paddingHorizontal: espaco.lg,
  },
  circulo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.lg,
  },
  descricao: { marginTop: espaco.sm, maxWidth: 320 },
  acao: { marginTop: espaco.xl },
});
