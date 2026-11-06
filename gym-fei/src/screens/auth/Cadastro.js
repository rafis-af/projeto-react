import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  Botao,
  Cabecalho,
  CampoTexto,
  EstadoVazio,
  Icone,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { traduzirErro } from "../../services/erros";
import { cores, espaco, raio } from "../../theme";
import { vibrarSelecao } from "../../utils/feedback";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIPOS = [
  {
    id: "aluno",
    icone: "dumbbell",
    titulo: "Sou aluno",
    texto: "Recebo e faço os treinos do meu personal",
  },
  {
    id: "personal",
    icone: "clipboard-list",
    titulo: "Sou personal",
    texto: "Monto e acompanho treinos dos alunos",
  },
];

export default function Cadastro({ navigation }) {
  const { cadastrar } = useAuth();
  const [tipo, setTipo] = useState("aluno");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [personalEncontrado, setPersonalEncontrado] = useState(null);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const campoEmail = useRef(null);
  const campoSenha = useRef(null);
  const campoCodigo = useRef(null);

  // Confere o código do personal assim que os 6 caracteres são digitados
  useEffect(() => {
    const valor = codigo.trim().toUpperCase();
    setPersonalEncontrado(null);
    if (valor.length !== 6) return undefined;
    let ativo = true;
    setVerificandoCodigo(true);
    api
      .verificarCodigo(valor)
      .then((personal) => {
        if (!ativo) return;
        setPersonalEncontrado(personal);
        setErros((e) => ({
          ...e,
          codigo: personal
            ? undefined
            : "Código não encontrado. Confira com seu personal.",
        }));
      })
      .catch(
        () =>
          ativo &&
          setErros((e) => ({
            ...e,
            codigo: "Não foi possível verificar o código agora.",
          }))
      )
      .finally(() => ativo && setVerificandoCodigo(false));
    return () => {
      ativo = false;
    };
  }, [codigo]);

  const limparErro = (campo) =>
    erros[campo] && setErros((e) => ({ ...e, [campo]: undefined }));

  const enviar = async () => {
    const novosErros = {};
    if (nome.trim().length < 2) novosErros.nome = "Digite seu nome.";
    if (!EMAIL_VALIDO.test(email.trim()))
      novosErros.email = "Digite um e-mail válido.";
    if (senha.length < 6) novosErros.senha = "Use pelo menos 6 caracteres.";
    const codigoLimpo = codigo.trim();
    if (
      tipo === "aluno" &&
      codigoLimpo &&
      (codigoLimpo.length !== 6 || (!personalEncontrado && !verificandoCodigo))
    ) {
      novosErros.codigo =
        "Código inválido. Corrija ou deixe em branco para vincular depois.";
    }
    setErros(novosErros);
    setErroGeral("");
    if (Object.keys(novosErros).length) return;

    setCarregando(true);
    try {
      const { precisaConfirmarEmail } = await cadastrar({
        nome,
        email,
        senha,
        tipo,
        codigoPersonal: tipo === "aluno" ? codigoLimpo : null,
      });
      if (precisaConfirmarEmail) {
        setAguardandoConfirmacao(true);
        setCarregando(false);
      }
      // Sem confirmação de e-mail, a sessão é criada e o app troca de tela sozinho
    } catch (erro) {
      setErroGeral(traduzirErro(erro));
      setCarregando(false);
    }
  };

  if (aguardandoConfirmacao) {
    return (
      <Tela cabecalho={<Cabecalho />}>
        <EstadoVazio
          icone="mail-check"
          titulo="Confirme seu e-mail"
          descricao={`Enviamos um link de confirmação para ${email.trim()}. Abra o e-mail, confirme e depois faça login.`}
          acao={{
            titulo: "Ir para o login",
            icone: "log-in",
            onPress: () => navigation.replace("Login"),
          }}
        />
      </Tela>
    );
  }

  return (
    <Tela teclado cabecalho={<Cabecalho />}>
      <Texto variante="display" accessibilityRole="header">
        Crie sua conta
      </Texto>
      <Texto variante="corpo" cor="textoSecundario" estilo={estilos.subtitulo}>
        Leva menos de um minuto.
      </Texto>

      <Texto
        variante="legendaForte"
        cor="textoSecundario"
        estilo={estilos.rotulo}
      >
        Como você vai usar o GymFEI?
      </Texto>
      <View style={estilos.tipos} accessibilityRole="radiogroup">
        {TIPOS.map((t) => {
          const ativo = tipo === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                vibrarSelecao();
                setTipo(t.id);
              }}
              accessibilityRole="radio"
              aria-checked={ativo}
              accessibilityLabel={`${t.titulo}. ${t.texto}`}
              style={({ pressed }) => [
                estilos.tipo,
                ativo && estilos.tipoAtivo,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View
                style={[estilos.tipoIcone, ativo && estilos.tipoIconeAtivo]}
              >
                <Icone
                  nome={t.icone}
                  tamanho={20}
                  cor={ativo ? "#FFFFFF" : cores.primariaClara}
                />
              </View>
              <Texto variante="corpoForte">{t.titulo}</Texto>
              <Texto variante="legenda" cor="textoSecundario">
                {t.texto}
              </Texto>
              <View style={[estilos.radio, ativo && estilos.radioAtivo]}>
                {ativo && <View style={estilos.radioPonto} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <CampoTexto
        rotulo="Nome completo"
        icone="user-round"
        placeholder="Como você se chama?"
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          limparErro("nome");
        }}
        erro={erros.nome}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => campoEmail.current?.focus()}
        submitBehavior="submit"
        maxLength={80}
      />
      <CampoTexto
        ref={campoEmail}
        rotulo="E-mail"
        icone="mail"
        placeholder="voce@email.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          limparErro("email");
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
        placeholder="Mínimo de 6 caracteres"
        senha
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          limparErro("senha");
        }}
        erro={erros.senha}
        dica={
          senha.length > 0 && senha.length < 6
            ? `Faltam ${6 - senha.length} caracteres`
            : undefined
        }
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType={tipo === "aluno" ? "next" : "done"}
        onSubmitEditing={() =>
          tipo === "aluno" ? campoCodigo.current?.focus() : enviar()
        }
      />

      {tipo === "aluno" && (
        <CampoTexto
          ref={campoCodigo}
          rotulo="Código do seu personal (opcional)"
          icone="ticket"
          placeholder="Ex.: GF7K2P"
          value={codigo}
          onChangeText={(t) => {
            setCodigo(t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
            limparErro("codigo");
          }}
          erro={erros.codigo}
          dica={
            personalEncontrado
              ? undefined
              : "Peça o código ao seu personal. Você também pode vincular depois, pelo perfil."
          }
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={enviar}
          direita={
            verificandoCodigo ? (
              <ActivityIndicator size="small" color={cores.primariaClara} />
            ) : personalEncontrado ? (
              <Icone nome="circle-check-big" tamanho={18} cor="#4ADE80" />
            ) : null
          }
        />
      )}
      {tipo === "aluno" && personalEncontrado && (
        <View style={estilos.personal} accessibilityLiveRegion="polite">
          <Icone nome="badge-check" tamanho={18} cor="#4ADE80" />
          <Texto variante="legendaForte" cor="#4ADE80">
            Personal: {personalEncontrado.nome}
          </Texto>
        </View>
      )}

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
        titulo="Criar conta"
        icone="user-plus"
        onPress={enviar}
        carregando={carregando}
        estilo={estilos.botao}
      />

      <Pressable
        onPress={() => navigation.replace("Login")}
        accessibilityRole="link"
        accessibilityLabel="Já tem conta? Entrar"
        style={estilos.link}
        hitSlop={8}
      >
        <Texto variante="corpo" cor="textoSecundario">
          Já tem conta?{" "}
          <Texto variante="corpoForte" cor="primariaClara">
            Entrar
          </Texto>
        </Texto>
      </Pressable>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  subtitulo: { marginTop: espaco.xs, marginBottom: espaco.xxl },
  rotulo: { marginBottom: espaco.sm },
  tipos: { flexDirection: "row", gap: espaco.md, marginBottom: espaco.xxl },
  tipo: {
    flex: 1,
    padding: espaco.lg,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    gap: 4,
  },
  tipoAtivo: { borderColor: cores.primaria, backgroundColor: "#0E1E3D" },
  tipoIcone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.sm,
  },
  tipoIconeAtivo: { backgroundColor: cores.primaria },
  radio: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: cores.bordaForte,
    alignItems: "center",
    justifyContent: "center",
  },
  radioAtivo: { borderColor: cores.primariaClara },
  radioPonto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.primariaClara,
  },
  personal: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    marginTop: -espaco.sm,
    marginBottom: espaco.lg,
  },
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
});
