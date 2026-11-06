import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Share, StyleSheet, View } from "react-native";

import { useFeedback } from "../context/FeedbackContext";
import { cores, espaco, fontes, gradientes, raio } from "../theme";
import Botao from "./Botao";
import Icone from "./Icone";
import Texto from "./Texto";

// Código que o personal envia aos alunos para eles se vincularem a ele.
export default function CartaoConvite({ codigo }) {
  const { toast } = useFeedback();
  const mensagem = `Bora treinar! Baixe o GymFEI, crie sua conta como aluno e use meu código de personal: ${codigo}`;

  // Alguns navegadores bloqueiam a área de transferência: nesse caso, mostra o código na mensagem
  const copiarTexto = async (texto, mensagemSucesso) => {
    try {
      await Clipboard.setStringAsync(texto);
      toast(mensagemSucesso);
    } catch {
      toast(
        `Não deu para copiar automaticamente. Seu código é ${codigo}.`,
        "info"
      );
    }
  };

  const copiar = () => copiarTexto(codigo, "Código copiado!");

  const compartilhar = async () => {
    if (Platform.OS !== "web") {
      try {
        await Share.share({ message: mensagem });
      } catch {
        // Compartilhamento cancelado: nada a fazer
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: mensagem });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    copiarTexto(mensagem, "Convite copiado. É só colar na conversa!");
  };

  return (
    <View style={estilos.base}>
      <LinearGradient
        colors={gradientes.destaque}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={estilos.topo}>
        <View style={estilos.icone}>
          <Icone nome="user-plus" tamanho={20} cor={cores.primariaClara} />
        </View>
        <View style={estilos.flex}>
          <Texto variante="titulo3">Convide seus alunos</Texto>
          <Texto variante="legenda" cor="textoSecundario">
            O aluno informa este código ao criar a conta e entra direto na sua
            lista.
          </Texto>
        </View>
      </View>
      <View style={estilos.caixaCodigo}>
        <Texto
          selectable
          estilo={estilos.codigo}
          accessibilityLabel={`Código de convite: ${codigo.split("").join(" ")}`}
        >
          {codigo}
        </Texto>
      </View>
      <View style={estilos.botoes}>
        <Botao
          titulo="Copiar"
          icone="copy"
          variante="secundario"
          tamanho="sm"
          onPress={copiar}
          estilo={estilos.flex}
        />
        <Botao
          titulo="Compartilhar"
          icone="share-2"
          tamanho="sm"
          onPress={compartilhar}
          estilo={estilos.flex}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  base: {
    borderRadius: raio.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: cores.bordaForte,
    padding: espaco.lg,
    gap: espaco.lg,
  },
  topo: { flexDirection: "row", gap: espaco.md, alignItems: "flex-start" },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  caixaCodigo: {
    alignItems: "center",
    paddingVertical: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(91, 155, 255, 0.45)",
    backgroundColor: "rgba(6, 11, 22, 0.35)",
  },
  codigo: {
    fontFamily: fontes.extra,
    fontSize: 30,
    letterSpacing: 8,
    color: cores.texto,
    fontVariant: ["tabular-nums"],
  },
  botoes: { flexDirection: "row", gap: espaco.md },
});
