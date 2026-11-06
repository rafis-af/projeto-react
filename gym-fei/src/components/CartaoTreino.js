import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import { obterGrupo } from "../data/catalogo";
import { cores, espaco, gradientes, raio } from "../theme";
import { contarExercicios, estimarDuracaoMin } from "../utils/treino";
import Icone from "./Icone";
import MapaMuscular from "./MapaMuscular";
import Selo from "./Selo";
import Texto from "./Texto";

function Meta({ icone, texto }) {
  return (
    <View style={estilos.meta}>
      <Icone nome={icone} tamanho={14} cor={cores.textoSecundario} />
      <Texto variante="legenda" cor="textoSecundario">
        {texto}
      </Texto>
    </View>
  );
}

// Cartão de treino. "destaque" é a capa grande (início do aluno);
// "lista" é a linha compacta usada nas listagens.
export default function CartaoTreino({
  treino,
  onPress,
  variante = "lista",
  subtitulo,
  acao,
  rodape,
}) {
  const grupo = obterGrupo(treino.grupoMuscular);
  const duracao = `≈ ${estimarDuracaoMin(treino)} min`;
  const rotulo = `${treino.nome}, ${grupo.nome}, ${contarExercicios(treino)}, ${duracao}`;

  if (variante === "destaque") {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        style={({ pressed }) => [
          estilos.destaque,
          pressed && estilos.pressionado,
        ]}
      >
        <LinearGradient
          colors={gradientes.capa}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <MapaMuscular
          grupo={grupo.id}
          enquadramento="foco"
          altura={200}
          largura={200}
          estilo={estilos.mapaDestaque}
        />
        <LinearGradient
          colors={[
            "rgba(11,22,48,0.95)",
            "rgba(11,22,48,0.55)",
            "rgba(11,22,48,0)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={estilos.destaqueConteudo}>
          <Selo texto={grupo.nome} />
          <Texto
            variante="titulo1"
            numberOfLines={2}
            estilo={estilos.destaqueTitulo}
          >
            {treino.nome}
          </Texto>
          {!!subtitulo && (
            <Texto variante="legenda" cor="textoSecundario" numberOfLines={1}>
              {subtitulo}
            </Texto>
          )}
          <View style={estilos.metas}>
            <Meta icone="list-checks" texto={contarExercicios(treino)} />
            <Meta icone="clock" texto={duracao} />
          </View>
          {acao && <View style={estilos.destaqueAcao}>{acao}</View>}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={rotulo}
      style={({ pressed }) => [estilos.linha, pressed && estilos.pressionado]}
    >
      <View style={estilos.miniatura}>
        <MapaMuscular
          grupo={grupo.id}
          enquadramento="foco"
          largura={64}
          altura={64}
        />
      </View>
      <View style={estilos.linhaTexto}>
        <Texto variante="corpoForte" numberOfLines={1}>
          {treino.nome}
        </Texto>
        {!!subtitulo && (
          <Texto variante="legenda" cor="textoSecundario" numberOfLines={1}>
            {subtitulo}
          </Texto>
        )}
        <View style={estilos.metas}>
          <Selo texto={grupo.nome} variante="neutro" />
          <Meta
            icone="list-checks"
            texto={String(treino.exercicios?.length ?? 0)}
          />
          <Meta icone="clock" texto={duracao} />
        </View>
        {rodape}
      </View>
      {acao ??
        (onPress ? (
          <Icone nome="chevron-right" tamanho={20} cor={cores.textoTerciario} />
        ) : null)}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  destaque: {
    minHeight: 210,
    borderRadius: raio.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: cores.bordaForte,
  },
  mapaDestaque: { position: "absolute", right: -18, top: 6 },
  destaqueConteudo: {
    padding: espaco.xl,
    paddingRight: 120,
    flex: 1,
    justifyContent: "flex-end",
  },
  destaqueTitulo: { marginTop: espaco.md, marginBottom: espaco.xs },
  destaqueAcao: { marginTop: espaco.lg },
  pressionado: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  metas: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: espaco.md,
    marginTop: espaco.sm,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  miniatura: {
    width: 68,
    height: 68,
    borderRadius: raio.md,
    backgroundColor: "#0B1630",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  linhaTexto: { flex: 1, gap: 2 },
});
