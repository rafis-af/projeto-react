import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AvisoDemo,
  Botao,
  Cabecalho,
  CampoTexto,
  Icone,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { MODO_DEMO } from "../../lib/config";
import { CONTAS_DEMO } from "../../services/demoSeed";
import { traduzirErro } from "../../services/erros";
import { cores, espaco, raio } from "../../theme";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ navigation }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] = useState(false);
  const campoSenha = useRef(null);

  const fazerLogin = async (credenciais = { email, senha }) => {
    const novosErros = {};
    if (!EMAIL_VALIDO.test(credenciais.email.trim()))
      novosErros.email = "Digite um e-mail válido.";
    if (!credenciais.senha) novosErros.senha = "Digite sua senha.";
    setErros(novosErros);
    setErroGeral("");
    if (Object.keys(novosErros).length) return;

    setCarregando(true);
    try {
      await entrar(credenciais);
      // A navegação muda sozinha quando a sessão é criada (AuthContext)
    } catch (erro) {
      setErroGeral(traduzirErro(erro));
      setCarregando(false);
    }
  };

  const entrarComoDemo = (tipo) => {
    const conta = CONTAS_DEMO[tipo];
    setEmail(conta.email);
    setSenha(conta.senha);
    fazerLogin(conta);
  };

  return (
    <Tela teclado cabecalho={<Cabecalho />}>
      <Texto variante="display" accessibilityRole="header">
        Bem-vindo de volta
      </Texto>
      <Texto variante="corpo" cor="textoSecundario" estilo={estilos.subtitulo}>
        Entre para continuar de onde parou.
      </Texto>

      <CampoTexto
        rotulo="E-mail"
        icone="mail"
        placeholder="voce@email.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (erros.email) setErros((e) => ({ ...e, email: undefined }));
        }}
        erro={erros.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => campoSenha.current?.focus()}
        submitBehavior="submit"
      />
      <CampoTexto
        ref={campoSenha}
        rotulo="Senha"
        icone="lock"
        placeholder="Sua senha"
        senha
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          if (erros.senha) setErros((e) => ({ ...e, senha: undefined }));
        }}
        erro={erros.senha}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => fazerLogin()}
      />

      {!!erroGeral && (
        <View
          style={estilos.erroGeral}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <Icone nome="circle-alert" tamanho={18} cor="#F87171" />
          <Texto variante="legendaForte" cor="#F87171" estilo={estilos.flex}>
            {erroGeral}
          </Texto>
        </View>
      )}

      <Botao
        titulo="Entrar"
        icone="log-in"
        onPress={() => fazerLogin()}
        carregando={carregando}
        estilo={estilos.botao}
      />

      <Pressable
        onPress={() => navigation.replace("Cadastro")}
        accessibilityRole="link"
        accessibilityLabel="Ainda não tem conta? Criar conta"
        style={estilos.link}
        hitSlop={8}
      >
        <Texto variante="corpo" cor="textoSecundario">
          Ainda não tem conta?{" "}
          <Texto variante="corpoForte" cor="primariaClara">
            Criar conta
          </Texto>
        </Texto>
      </Pressable>

      {MODO_DEMO && (
        <View style={estilos.demo}>
          <AvisoDemo />
          <Texto
            variante="rotulo"
            cor="textoTerciario"
            estilo={estilos.demoTitulo}
          >
            Acesso rápido
          </Texto>
          <View style={estilos.demoBotoes}>
            <Botao
              titulo="Sou personal"
              icone="clipboard-list"
              variante="secundario"
              tamanho="sm"
              onPress={() => entrarComoDemo("personal")}
              estilo={estilos.flex}
              desabilitado={carregando}
            />
            <Botao
              titulo="Sou aluno"
              icone="dumbbell"
              variante="secundario"
              tamanho="sm"
              onPress={() => entrarComoDemo("aluno")}
              estilo={estilos.flex}
              desabilitado={carregando}
            />
          </View>
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  subtitulo: { marginTop: espaco.xs, marginBottom: espaco.xxl },
  erroGeral: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.perigoSuave,
    marginBottom: espaco.lg,
  },
  botao: { marginTop: espaco.sm },
  link: {
    alignSelf: "center",
    marginTop: espaco.xl,
    paddingVertical: espaco.sm,
  },
  demo: { marginTop: espaco.xxxl, gap: espaco.md },
  demoTitulo: { marginTop: espaco.sm },
  demoBotoes: { flexDirection: "row", gap: espaco.md },
});
