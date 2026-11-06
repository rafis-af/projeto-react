import { Pressable, StyleSheet, View } from "react-native";

import { cores, espaco, raio } from "../theme";

// Superfície padrão para agrupar conteúdo. Com `onPress` vira um item tocável.
export default function Cartao({
  children,
  onPress,
  destaque = false,
  estilo,
  rotuloAcessivel,
  ...props
}) {
  const base = [estilos.base, destaque && estilos.destaque];
  if (!onPress) {
    return (
      <View style={[...base, estilo]} {...props}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      style={({ pressed }) => [...base, pressed && estilos.pressionado, estilo]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
  },
  destaque: {
    borderColor: cores.bordaForte,
    backgroundColor: cores.superficie2,
  },
  pressionado: {
    backgroundColor: cores.superficie2,
    transform: [{ scale: 0.99 }],
  },
});
