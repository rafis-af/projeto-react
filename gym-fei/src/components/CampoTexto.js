import { forwardRef, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { cores, espaco, fontes, raio } from "../theme";
import Icone from "./Icone";
import Texto from "./Texto";

// Campo de formulário com rótulo, ícone, estado de foco, erro inline e
// botão de mostrar/ocultar senha.
const CampoTexto = forwardRef(function CampoTexto(
  {
    rotulo,
    icone,
    erro,
    dica,
    senha = false,
    multiline = false,
    direita,
    estilo,
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={[estilos.campo, estilo]}>
      {!!rotulo && (
        <Texto
          variante="legendaForte"
          cor="textoSecundario"
          estilo={estilos.rotulo}
        >
          {rotulo}
        </Texto>
      )}
      <View
        style={[
          estilos.caixa,
          multiline && estilos.caixaMultilinha,
          focado && estilos.caixaFocada,
          !!erro && estilos.caixaErro,
        ]}
      >
        {!!icone && (
          <Icone
            nome={icone}
            tamanho={18}
            cor={
              erro
                ? "#F87171"
                : focado
                  ? cores.primariaClara
                  : cores.textoTerciario
            }
            estilo={multiline ? estilos.iconeTopo : undefined}
          />
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={cores.textoTerciario}
          selectionColor={cores.primariaClara}
          cursorColor={cores.primariaClara}
          secureTextEntry={senha && !senhaVisivel}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          accessibilityLabel={rotulo}
          maxFontSizeMultiplier={1.3}
          {...props}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[estilos.input, multiline && estilos.inputMultilinha]}
        />
        {senha && (
          <Pressable
            onPress={() => setSenhaVisivel((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={
              senhaVisivel ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <Icone
              nome={senhaVisivel ? "eye-off" : "eye"}
              tamanho={18}
              cor={cores.textoSecundario}
            />
          </Pressable>
        )}
        {direita}
      </View>
      {erro ? (
        <View style={estilos.linhaErro} accessibilityLiveRegion="polite">
          <Icone nome="circle-alert" tamanho={14} cor="#F87171" />
          <Texto variante="legenda" cor="#F87171" estilo={estilos.textoErro}>
            {erro}
          </Texto>
        </View>
      ) : dica ? (
        <Texto variante="legenda" cor="textoTerciario" estilo={estilos.dica}>
          {dica}
        </Texto>
      ) : null}
    </View>
  );
});

export default CampoTexto;

const estilos = StyleSheet.create({
  campo: { marginBottom: espaco.lg },
  rotulo: { marginBottom: espaco.sm },
  caixa: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  caixaMultilinha: {
    alignItems: "flex-start",
    paddingVertical: 12,
    minHeight: 96,
  },
  caixaFocada: {
    borderColor: cores.primaria,
    backgroundColor: cores.superficie2,
  },
  caixaErro: { borderColor: cores.perigo },
  iconeTopo: { marginTop: 2 },
  input: {
    flex: 1,
    alignSelf: "stretch",
    color: cores.texto,
    fontFamily: fontes.media,
    fontSize: 16,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } }),
  },
  inputMultilinha: { minHeight: 72 },
  linhaErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  textoErro: { flex: 1 },
  dica: { marginTop: 6 },
});
