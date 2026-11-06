import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import { FeedbackProvider } from "./src/context/FeedbackContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { cores } from "./src/theme";

// Mantém a splash screen até as fontes carregarem (evita "piscar" a fonte padrão)
SplashScreen.preventAutoHideAsync().catch(() => {});

const temaNavegacao = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primariaClara,
    background: cores.fundo,
    card: cores.fundoElevado,
    text: cores.texto,
    border: cores.borda,
    notification: cores.primaria,
  },
};

const WEB = Platform.OS === "web";

export default function App() {
  const [fontesProntas, erroFontes] = useFonts({
    "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("./assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Black": require("./assets/fonts/Montserrat-Black.ttf"),
    // Pré-carrega os ícones para não aparecerem "vazios" na primeira tela
    Lucide: require("@react-native-vector-icons/lucide/fonts/Lucide.ttf"),
  });

  useEffect(() => {
    if (fontesProntas || erroFontes) SplashScreen.hideAsync().catch(() => {});
  }, [fontesProntas, erroFontes]);

  if (!fontesProntas && !erroFontes) return null;

  return (
    <SafeAreaProvider style={estilos.raiz}>
      <View style={estilos.moldura}>
        <View style={estilos.app}>
          <StatusBar style="light" />
          <FeedbackProvider>
            <AuthProvider>
              <NavigationContainer
                theme={temaNavegacao}
                documentTitle={{
                  formatter: (opcoes) =>
                    opcoes?.title ? `${opcoes.title} · GymFEI` : "GymFEI",
                }}
              >
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </FeedbackProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  raiz: { backgroundColor: WEB ? "#03060D" : cores.fundo },
  // Na web (computador), o app fica centralizado com largura de celular
  moldura: { flex: 1, alignItems: "center" },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: WEB ? 480 : undefined,
    backgroundColor: cores.fundo,
    overflow: "hidden",
    ...(WEB && {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: cores.borda,
    }),
  },
});
