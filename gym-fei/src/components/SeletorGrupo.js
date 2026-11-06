import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { GRUPOS_MUSCULARES } from "../data/catalogo";
import { cores, espaco, raio } from "../theme";
import { vibrarSelecao } from "../utils/feedback";
import Icone from "./Icone";
import MapaMuscular from "./MapaMuscular";
import Texto from "./Texto";

const COLUNAS = 3;
const ESPACO = 10;

// Grade de grupos musculares com ilustração: reconhecer é mais fácil que lembrar.
export default function SeletorGrupo({ valor, aoMudar, erro }) {
  const [largura, setLargura] = useState(0);
  // Arredonda para baixo: frações de pixel faziam a 3ª coluna quebrar de linha
  const lado = largura
    ? Math.floor((largura - ESPACO * (COLUNAS - 1)) / COLUNAS)
    : 0;

  return (
    <View>
      <View
        style={estilos.grade}
        onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
        accessibilityRole="radiogroup"
      >
        {lado > 0 &&
          GRUPOS_MUSCULARES.map((grupo) => {
            const ativo = valor === grupo.id;
            return (
              <Pressable
                key={grupo.id}
                onPress={() => {
                  vibrarSelecao();
                  aoMudar(grupo.id);
                }}
                accessibilityRole="radio"
                aria-checked={ativo}
                accessibilityLabel={grupo.nome}
                style={({ pressed }) => [
                  estilos.opcao,
                  { width: lado },
                  ativo && estilos.opcaoAtiva,
                  !!erro && !valor && estilos.opcaoErro,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <MapaMuscular
                  grupo={grupo.id}
                  enquadramento="foco"
                  largura={lado - 24}
                  altura={lado - 34}
                />
                <Texto
                  variante="legendaForte"
                  cor={ativo ? "primariaClara" : "textoSecundario"}
                >
                  {grupo.nome}
                </Texto>
                {ativo && (
                  <View style={estilos.marca}>
                    <Icone nome="check" tamanho={12} cor="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
      </View>
      {!!erro && (
        <View style={estilos.linhaErro}>
          <Icone nome="circle-alert" tamanho={14} cor="#F87171" />
          <Texto variante="legenda" cor="#F87171">
            {erro}
          </Texto>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  grade: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO },
  opcao: {
    aspectRatio: 0.92,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: espaco.sm,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: "#0E1E3D" },
  opcaoErro: { borderColor: "rgba(239, 68, 68, 0.5)" },
  marca: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  linhaErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: espaco.sm,
  },
});
