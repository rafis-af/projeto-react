import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { AvisoDemo, Botao, Icone, Logo, Texto } from "../../components";
import { cores, espaco, gradientes, margemTela, raio } from "../../theme";

const DESTAQUES = [
  {
    icone: "clipboard-list",
    titulo: "Treinos sob medida",
    texto: "Seu personal monta e ajusta cada treino direto pelo app.",
  },
  {
    icone: "timer",
    titulo: "Treino guiado",
    texto: "Séries, cargas e cronômetro de descanso na palma da mão.",
  },
  {
    icone: "trending-up",
    titulo: "Evolução visível",
    texto: "Acompanhe frequência e histórico semana a semana.",
  },
];

export default function BoasVindas({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={estilos.tela}>
      <LinearGradient
        colors={gradientes.tela}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={estilos.brilho} width="100%" height={420}>
        <Defs>
          <RadialGradient id="brilhoBoasVindas" cx="50%" cy="35%" r="55%">
            <Stop offset="0" stopColor="#2563EB" stopOpacity={0.45} />
            <Stop offset="1" stopColor="#2563EB" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#brilhoBoasVindas)" />
      </Svg>

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          {
            paddingTop: insets.top + espaco.xxxl,
            paddingBottom: Math.max(insets.bottom, espaco.xl),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.marca}>
          <Logo tamanho={58} vertical slogan />
        </View>

        <Texto variante="titulo1" alinhamento="center" estilo={estilos.chamada}>
          Seu personal no bolso.
        </Texto>
        <Texto
          variante="corpo"
          cor="textoSecundario"
          alinhamento="center"
          estilo={estilos.apoio}
        >
          Treinos montados para você, séries guiadas e sua evolução em um só
          app.
        </Texto>

        <View style={estilos.destaques}>
          {DESTAQUES.map((d) => (
            <View key={d.titulo} style={estilos.destaque}>
              <View style={estilos.destaqueIcone}>
                <Icone nome={d.icone} tamanho={20} cor={cores.primariaClara} />
              </View>
              <View style={estilos.flex}>
                <Texto variante="corpoForte">{d.titulo}</Texto>
                <Texto variante="legenda" cor="textoSecundario">
                  {d.texto}
                </Texto>
              </View>
            </View>
          ))}
        </View>

        <View style={estilos.flex} />

        <AvisoDemo estilo={estilos.aviso} />
        <Botao
          titulo="Criar minha conta"
          iconeDireita="arrow-right"
          onPress={() => navigation.navigate("Cadastro")}
        />
        <Botao
          titulo="Já tenho uma conta"
          variante="secundario"
          onPress={() => navigation.navigate("Login")}
          estilo={estilos.segundoBotao}
        />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  brilho: { position: "absolute", top: 0, left: 0 },
  conteudo: { flexGrow: 1, paddingHorizontal: margemTela },
  marca: { alignItems: "center" },
  chamada: { marginTop: espaco.xxl },
  apoio: {
    marginTop: espaco.sm,
    marginBottom: espaco.xxl,
    paddingHorizontal: espaco.lg,
  },
  destaques: {
    gap: espaco.lg,
    padding: espaco.lg,
    borderRadius: raio.xl,
    backgroundColor: "rgba(15, 26, 46, 0.7)",
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espaco.xxl,
  },
  destaque: { flexDirection: "row", gap: espaco.md, alignItems: "center" },
  destaqueIcone: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  aviso: { marginBottom: espaco.lg },
  segundoBotao: { marginTop: espaco.md },
});
