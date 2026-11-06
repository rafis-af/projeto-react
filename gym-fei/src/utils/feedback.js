import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";

// Vibração tátil (haptics) só existe no celular; na web as funções não fazem nada.
const NATIVO = Platform.OS !== "web";

export function vibrarToque() {
  if (NATIVO)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function vibrarSelecao() {
  if (NATIVO) Haptics.selectionAsync().catch(() => {});
}

export function vibrarSucesso() {
  if (NATIVO)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
}

export function vibrarAviso() {
  if (NATIVO)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {}
    );
}

// Fim do descanso: vibração mais longa, para sentir o celular no bolso
export function vibrarFimDescanso() {
  if (NATIVO) {
    Vibration.vibrate([0, 400, 150, 400]);
  } else if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([400, 150, 400]);
  }
}
