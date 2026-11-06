import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores, espaco, margemTela } from "../theme";
import { BotaoIcone } from "./Botao";
import Texto from "./Texto";

// Estrutura base de todas as telas: fundo, área segura (notch), rolagem,
// "puxar para atualizar", teclado e um rodapé fixo para a ação principal.
export default function Tela({
  children,
  cabecalho,
  rodape,
  rolagem = true,
  teclado = false,
  aoAtualizar,
  atualizando = false,
  semMargem = false,
  estiloConteudo,
}) {
  const insets = useSafeAreaInsets();
  const dentroDeAbas = useContext(BottomTabBarHeightContext) !== undefined;
  const folgaInferior = rodape || dentroDeAbas ? 0 : insets.bottom;

  const estiloInterno = [
    {
      paddingHorizontal: semMargem ? 0 : margemTela,
      paddingTop: cabecalho ? espaco.sm : insets.top + espaco.lg,
      paddingBottom: espaco.xxxl + folgaInferior,
    },
    estiloConteudo,
  ];

  const conteudo = rolagem ? (
    <ScrollView
      style={estilos.flex}
      contentContainerStyle={estiloInterno}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      refreshControl={
        aoAtualizar ? (
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            tintColor={cores.primariaClara}
            colors={[cores.primaria]}
            progressBackgroundColor={cores.superficie2}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[estilos.flex, ...estiloInterno]}>{children}</View>
  );

  const corpo = (
    <>
      {cabecalho}
      {conteudo}
      {rodape && (
        <View
          style={[
            estilos.rodape,
            { paddingBottom: Math.max(insets.bottom, espaco.lg) },
          ]}
        >
          {rodape}
        </View>
      )}
    </>
  );

  return (
    <View style={estilos.tela}>
      {teclado ? (
        <KeyboardAvoidingView behavior="padding" style={estilos.flex}>
          {corpo}
        </KeyboardAvoidingView>
      ) : (
        corpo
      )}
    </View>
  );
}

// Cabeçalho das telas empilhadas (com botão voltar)
export function Cabecalho({
  titulo,
  subtitulo,
  aoVoltar,
  direita,
  iconeVoltar = "chevron-left",
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={[estilos.cabecalho, { paddingTop: insets.top + espaco.sm }]}>
      <BotaoIcone
        icone={iconeVoltar}
        rotulo={iconeVoltar === "x" ? "Fechar" : "Voltar"}
        onPress={aoVoltar ?? (() => navigation.goBack())}
        tamanhoIcone={22}
      />
      <View style={estilos.cabecalhoTitulo}>
        {!!titulo && (
          <Texto
            variante="titulo3"
            alinhamento="center"
            numberOfLines={1}
            accessibilityRole="header"
          >
            {titulo}
          </Texto>
        )}
        {!!subtitulo && (
          <Texto
            variante="legenda"
            cor="textoSecundario"
            alinhamento="center"
            numberOfLines={1}
          >
            {subtitulo}
          </Texto>
        )}
      </View>
      <View style={estilos.cabecalhoDireita}>{direita}</View>
    </View>
  );
}

// Título grande no topo das abas, no estilo dos apps nativos
export function TituloGrande({
  titulo,
  sobretitulo,
  subtitulo,
  direita,
  estilo,
}) {
  return (
    <View style={[estilos.tituloGrande, estilo]}>
      <View style={estilos.flex}>
        {!!sobretitulo && (
          <Texto variante="legendaForte" cor="textoSecundario">
            {sobretitulo}
          </Texto>
        )}
        <Texto variante="display" accessibilityRole="header" numberOfLines={2}>
          {titulo}
        </Texto>
        {!!subtitulo && (
          <Texto
            variante="corpo"
            cor="textoSecundario"
            estilo={estilos.subtitulo}
          >
            {subtitulo}
          </Texto>
        )}
      </View>
      {direita}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  rodape: {
    paddingHorizontal: margemTela,
    paddingTop: espaco.md,
    backgroundColor: cores.fundoElevado,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.sm,
    backgroundColor: cores.fundo,
    gap: espaco.md,
  },
  cabecalhoTitulo: { flex: 1, alignItems: "center" },
  cabecalhoDireita: {
    minWidth: 44,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: espaco.sm,
  },
  tituloGrande: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    marginBottom: espaco.lg,
  },
  subtitulo: { marginTop: espaco.xs },
});
