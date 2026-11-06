import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Botao from "../components/Botao";
import CampoTexto from "../components/CampoTexto";
import Icone from "../components/Icone";
import Texto from "../components/Texto";
import { traduzirErro } from "../services/erros";
import { cores, espaco, raio, sombras } from "../theme";
import { vibrarAviso, vibrarSucesso } from "../utils/feedback";

// Feedback do sistema sem travar o usuário: avisos rápidos (toast),
// diálogos de confirmação e um diálogo com campo de texto.
// Substitui o alert() do app antigo, que nem funciona direito na web.

const FeedbackContext = createContext(null);

const TIPOS_TOAST = {
  sucesso: { icone: "circle-check-big", cor: "#4ADE80" },
  erro: { icone: "circle-alert", cor: "#F87171" },
  info: { icone: "info", cor: cores.primariaClara },
};

export function FeedbackProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const [dialogo, setDialogo] = useState(null);
  const animacao = useRef(new Animated.Value(0)).current;
  const temporizador = useRef(null);

  const mostrarToast = useCallback(
    (mensagem, tipo = "sucesso") => {
      clearTimeout(temporizador.current);
      if (tipo === "erro") vibrarAviso();
      else if (tipo === "sucesso") vibrarSucesso();
      setToast({ mensagem, tipo, chave: Date.now() });
      animacao.setValue(0);
      Animated.spring(animacao, {
        toValue: 1,
        useNativeDriver: Platform.OS !== "web",
        friction: 8,
      }).start();
      temporizador.current = setTimeout(() => {
        Animated.timing(animacao, {
          toValue: 0,
          duration: 220,
          useNativeDriver: Platform.OS !== "web",
        }).start(() => setToast(null));
      }, 2800);
    },
    [animacao]
  );

  // confirmar({ titulo, mensagem, textoConfirmar, perigo }) => Promise<boolean>
  const confirmar = useCallback(
    (opcoes) =>
      new Promise((resolver) =>
        setDialogo({ tipo: "confirmar", ...opcoes, resolver })
      ),
    []
  );

  // pedirTexto({ titulo, mensagem, rotulo, aoConfirmar }) => Promise<boolean>
  // `aoConfirmar` pode lançar um erro para mostrar a mensagem dentro do diálogo.
  const pedirTexto = useCallback(
    (opcoes) =>
      new Promise((resolver) =>
        setDialogo({ tipo: "texto", ...opcoes, resolver })
      ),
    []
  );

  const fecharDialogo = useCallback(
    (resultado) => {
      dialogo?.resolver(resultado);
      setDialogo(null);
    },
    [dialogo]
  );

  const valor = useMemo(
    () => ({ toast: mostrarToast, confirmar, pedirTexto }),
    [mostrarToast, confirmar, pedirTexto]
  );

  const tipoToast = toast
    ? (TIPOS_TOAST[toast.tipo] ?? TIPOS_TOAST.info)
    : null;

  return (
    <FeedbackContext.Provider value={valor}>
      {children}

      {toast && (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            estilos.toast,
            {
              top: insets.top + espaco.sm,
              opacity: animacao,
              transform: [
                {
                  translateY: animacao.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Icone nome={tipoToast.icone} tamanho={20} cor={tipoToast.cor} />
          <Texto variante="corpoForte" estilo={estilos.toastTexto}>
            {toast.mensagem}
          </Texto>
        </Animated.View>
      )}

      <Modal
        visible={!!dialogo}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => fecharDialogo(false)}
      >
        {dialogo && (
          <KeyboardAvoidingView behavior="padding" style={estilos.fundoDialogo}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => fecharDialogo(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            />
            {dialogo.tipo === "texto" ? (
              <DialogoTexto opcoes={dialogo} aoFechar={fecharDialogo} />
            ) : (
              <DialogoConfirmar opcoes={dialogo} aoFechar={fecharDialogo} />
            )}
          </KeyboardAvoidingView>
        )}
      </Modal>
    </FeedbackContext.Provider>
  );
}

function DialogoConfirmar({ opcoes, aoFechar }) {
  const {
    titulo,
    mensagem,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    textoAlternativo,
    perigo,
    icone,
  } = opcoes;
  return (
    <View style={estilos.dialogo} accessibilityViewIsModal>
      <View
        style={[
          estilos.dialogoIcone,
          perigo && { backgroundColor: cores.perigoSuave },
        ]}
      >
        <Icone
          nome={icone ?? (perigo ? "triangle-alert" : "circle-help")}
          tamanho={24}
          cor={perigo ? "#F87171" : cores.primariaClara}
        />
      </View>
      <Texto variante="titulo2" alinhamento="center">
        {titulo}
      </Texto>
      {!!mensagem && (
        <Texto
          variante="corpo"
          cor="textoSecundario"
          alinhamento="center"
          estilo={estilos.dialogoMensagem}
        >
          {mensagem}
        </Texto>
      )}
      <View style={estilos.dialogoBotoes}>
        <Botao
          titulo={textoCancelar}
          variante="secundario"
          onPress={() => aoFechar(false)}
          estilo={estilos.flex}
        />
        <Botao
          titulo={textoConfirmar}
          variante={perigo ? "perigoSolido" : "primario"}
          onPress={() => aoFechar(true)}
          estilo={estilos.flex}
        />
      </View>
      {!!textoAlternativo && (
        <Botao
          titulo={textoAlternativo}
          variante="fantasma"
          tamanho="sm"
          onPress={() => aoFechar("alternativo")}
          estilo={estilos.dialogoAlternativo}
        />
      )}
    </View>
  );
}

function DialogoTexto({ opcoes, aoFechar }) {
  const {
    titulo,
    mensagem,
    rotulo,
    placeholder,
    valorInicial = "",
    textoConfirmar = "Salvar",
    icone = "pencil",
    aoConfirmar,
    tipo: _tipo,
    resolver: _resolver,
    ...propsCampo
  } = opcoes;
  const [valor, setValor] = useState(valorInicial);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const confirmarValor = async () => {
    setErro("");
    setCarregando(true);
    try {
      await aoConfirmar?.(valor.trim());
      aoFechar(true);
    } catch (e) {
      setErro(traduzirErro(e));
      setCarregando(false);
    }
  };

  return (
    <View style={estilos.dialogo} accessibilityViewIsModal>
      <View style={estilos.dialogoIcone}>
        <Icone nome={icone} tamanho={24} cor={cores.primariaClara} />
      </View>
      <Texto variante="titulo2" alinhamento="center">
        {titulo}
      </Texto>
      {!!mensagem && (
        <Texto
          variante="corpo"
          cor="textoSecundario"
          alinhamento="center"
          estilo={estilos.dialogoMensagem}
        >
          {mensagem}
        </Texto>
      )}
      <CampoTexto
        rotulo={rotulo}
        placeholder={placeholder}
        value={valor}
        onChangeText={(t) => {
          setValor(t);
          if (erro) setErro("");
        }}
        erro={erro}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={confirmarValor}
        estilo={estilos.dialogoCampo}
        {...propsCampo}
      />
      <View style={estilos.dialogoBotoes}>
        <Botao
          titulo="Cancelar"
          variante="secundario"
          onPress={() => aoFechar(false)}
          estilo={estilos.flex}
        />
        <Botao
          titulo={textoConfirmar}
          onPress={confirmarValor}
          carregando={carregando}
          desabilitado={!valor.trim()}
          estilo={estilos.flex}
        />
      </View>
    </View>
  );
}

export function useFeedback() {
  const contexto = useContext(FeedbackContext);
  if (!contexto)
    throw new Error("useFeedback precisa estar dentro de <FeedbackProvider>");
  return contexto;
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  toast: {
    position: "absolute",
    left: espaco.lg,
    right: espaco.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingHorizontal: espaco.lg,
    paddingVertical: 14,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie3,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    zIndex: 1000,
    ...sombras.cartao,
  },
  toastTexto: { flex: 1 },
  fundoDialogo: {
    flex: 1,
    backgroundColor: cores.sobreposicao,
    alignItems: "center",
    justifyContent: "center",
    padding: espaco.xl,
  },
  dialogo: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: cores.superficie,
    borderRadius: raio.xl,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    padding: espaco.xxl,
    alignItems: "stretch",
    ...sombras.cartao,
  },
  dialogoIcone: {
    alignSelf: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.lg,
  },
  dialogoMensagem: { marginTop: espaco.sm },
  dialogoCampo: { marginTop: espaco.xl, marginBottom: 0 },
  dialogoBotoes: {
    flexDirection: "row",
    gap: espaco.md,
    marginTop: espaco.xxl,
  },
  dialogoAlternativo: { marginTop: espaco.md },
});
