import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { alvoToque, cores, fontes, gradientes, raio } from "../theme";
import { vibrarToque } from "../utils/feedback";
import Icone from "./Icone";

const VARIANTES = {
  primario: { texto: cores.textoSobrePrimaria, gradiente: gradientes.primario },
  secundario: {
    texto: cores.texto,
    fundo: cores.superficie2,
    borda: cores.bordaForte,
  },
  fantasma: { texto: cores.primariaClara, fundo: cores.transparente },
  perigo: { texto: "#F87171", fundo: cores.perigoSuave },
  perigoSolido: { texto: "#FFFFFF", fundo: "#DC2626" },
  sucesso: { texto: "#4ADE80", fundo: cores.sucessoSuave },
};

const ALTURAS = { sm: 40, md: 52, lg: 58 };

export default function Botao({
  titulo,
  onPress,
  variante = "primario",
  tamanho = "md",
  icone,
  iconeDireita,
  carregando = false,
  desabilitado = false,
  larguraTotal = true,
  estilo,
  rotuloAcessivel,
}) {
  const v = VARIANTES[variante] ?? VARIANTES.primario;
  const inativo = desabilitado || carregando;
  const pequeno = tamanho === "sm";

  const aoPressionar = () => {
    if (variante === "primario") vibrarToque();
    onPress?.();
  };

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      aria-disabled={inativo}
      aria-busy={carregando}
      style={({ pressed }) => [
        estilos.base,
        {
          height: ALTURAS[tamanho],
          minWidth: pequeno ? 0 : alvoToque,
          paddingHorizontal: pequeno ? 14 : 20,
          borderRadius: pequeno ? raio.sm : raio.md,
        },
        larguraTotal ? estilos.larguraTotal : estilos.ajustado,
        v.fundo && { backgroundColor: v.fundo },
        v.borda && { borderWidth: 1, borderColor: v.borda },
        pressed && estilos.pressionado,
        inativo && estilos.inativo,
        estilo,
      ]}
    >
      {v.gradiente && (
        <LinearGradient
          colors={v.gradiente}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={estilos.conteudo}>
        {carregando ? (
          <ActivityIndicator color={v.texto} />
        ) : (
          <>
            {icone && (
              <Icone nome={icone} tamanho={pequeno ? 16 : 19} cor={v.texto} />
            )}
            {!!titulo && (
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
                style={[
                  estilos.texto,
                  pequeno && estilos.textoPequeno,
                  { color: v.texto },
                ]}
              >
                {titulo}
              </Text>
            )}
            {iconeDireita && (
              <Icone
                nome={iconeDireita}
                tamanho={pequeno ? 16 : 19}
                cor={v.texto}
              />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

export function BotaoIcone({
  icone,
  onPress,
  rotulo,
  variante = "superficie",
  tamanho = 44,
  corIcone,
  tamanhoIcone = 20,
  contador,
  desabilitado = false,
  estilo,
}) {
  const fundos = {
    superficie: cores.superficie2,
    transparente: cores.transparente,
    primaria: cores.primaria,
    vidro: "rgba(6, 11, 22, 0.55)",
    perigo: cores.perigoSuave,
  };
  const folga = Math.max(0, (alvoToque - tamanho) / 2);
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      hitSlop={folga}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      aria-disabled={desabilitado}
      style={({ pressed }) => [
        estilos.icone,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: fundos[variante] ?? fundos.superficie,
        },
        variante === "superficie" && estilos.iconeBorda,
        pressed && estilos.pressionado,
        desabilitado && estilos.inativo,
        estilo,
      ]}
    >
      <Icone
        nome={icone}
        tamanho={tamanhoIcone}
        cor={corIcone ?? (variante === "perigo" ? "#F87171" : cores.texto)}
      />
      {!!contador && (
        <View style={estilos.contador}>
          <Text style={estilos.contadorTexto}>
            {contador > 9 ? "9+" : contador}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { overflow: "hidden", justifyContent: "center", alignItems: "center" },
  larguraTotal: { alignSelf: "stretch" },
  ajustado: { alignSelf: "flex-start" },
  conteudo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  texto: { fontFamily: fontes.negrito, fontSize: 16, letterSpacing: 0.1 },
  textoPequeno: { fontSize: 14, fontFamily: fontes.semibold },
  pressionado: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  inativo: { opacity: 0.45 },
  icone: { alignItems: "center", justifyContent: "center" },
  iconeBorda: { borderWidth: 1, borderColor: cores.borda },
  contador: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: cores.fundo,
  },
  contadorTexto: { color: "#fff", fontFamily: fontes.negrito, fontSize: 10 },
});
