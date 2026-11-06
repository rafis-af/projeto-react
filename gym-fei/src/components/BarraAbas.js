import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores, espaco, fontes, gradientes, sombras } from "../theme";
import { vibrarSelecao, vibrarToque } from "../utils/feedback";
import Icone from "./Icone";

// Barra de navegação inferior no padrão dos apps mobile: ícone + rótulo,
// indicador em pílula na aba ativa e um botão central opcional de ação rápida.
export default function BarraAbas({
  state,
  descriptors,
  navigation,
  acaoCentral,
}) {
  const insets = useSafeAreaInsets();
  const meio = acaoCentral ? Math.ceil(state.routes.length / 2) : -1;

  const itens = [];
  state.routes.forEach((rota, indice) => {
    if (indice === meio) {
      itens.push(<BotaoCentral key="acao-central" {...acaoCentral} />);
    }
    const { options } = descriptors[rota.key];
    const focado = state.index === indice;

    const aoPressionar = () => {
      const evento = navigation.emit({
        type: "tabPress",
        target: rota.key,
        canPreventDefault: true,
      });
      if (!focado && !evento.defaultPrevented) {
        vibrarSelecao();
        navigation.navigate(rota.name, rota.params);
      }
    };

    itens.push(
      <Pressable
        key={rota.key}
        onPress={aoPressionar}
        onLongPress={() =>
          navigation.emit({ type: "tabLongPress", target: rota.key })
        }
        accessibilityRole="tab"
        aria-selected={focado}
        accessibilityLabel={options.title}
        style={estilos.item}
      >
        <View style={[estilos.pilula, focado && estilos.pilulaAtiva]}>
          <Icone
            nome={options.icone}
            tamanho={22}
            cor={focado ? cores.primariaClara : cores.textoTerciario}
          />
        </View>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[estilos.rotulo, focado && estilos.rotuloAtivo]}
        >
          {options.title}
        </Text>
      </Pressable>
    );
  });

  return (
    <View
      style={[
        estilos.barra,
        { paddingBottom: Math.max(insets.bottom, espaco.sm) },
      ]}
    >
      {itens}
    </View>
  );
}

function BotaoCentral({ icone = "plus", rotulo, onPress }) {
  return (
    <View style={estilos.item}>
      <Pressable
        onPress={() => {
          vibrarToque();
          onPress?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        style={({ pressed }) => [
          estilos.central,
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        <LinearGradient
          colors={gradientes.primario}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={estilos.centralGradiente}
        >
          <Icone nome={icone} tamanho={28} cor="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: espaco.sm,
    paddingHorizontal: espaco.xs,
    backgroundColor: cores.fundoElevado,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.bordaForte,
  },
  item: {
    flex: 1,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "flex-start",
  },
  pilula: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pilulaAtiva: { backgroundColor: cores.primariaSuave },
  rotulo: {
    marginTop: 4,
    fontFamily: fontes.semibold,
    fontSize: 11,
    color: cores.textoTerciario,
  },
  rotuloAtivo: { color: cores.texto },
  central: {
    marginTop: -28,
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 4,
    backgroundColor: cores.fundoElevado,
    ...sombras.brilhoPrimario,
  },
  centralGradiente: {
    flex: 1,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
});
