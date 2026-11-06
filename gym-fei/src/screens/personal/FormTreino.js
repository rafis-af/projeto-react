import { usePreventRemove } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import {
  Avatar,
  Botao,
  BotaoIcone,
  Cabecalho,
  CampoTexto,
  CartaoConvite,
  Chip,
  EditorExercicios,
  Esqueleto,
  EstadoVazio,
  Icone,
  SeletorGrupo,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import { OBJETIVOS } from "../../data/catalogo";
import { api } from "../../services/api";
import { traduzirErro } from "../../services/erros";
import { cores, espaco, margemTela, raio } from "../../theme";
import {
  estimarDuracaoMin,
  limparExercicios,
  totalSeries,
  validarTreino,
} from "../../utils/treino";

const VAZIO = {
  alunoId: null,
  nome: "",
  grupoMuscular: null,
  objetivo: null,
  observacoes: "",
  exercicios: [],
};

function Secao({ numero, titulo, children, direita }) {
  return (
    <View style={estilos.secao}>
      <View style={estilos.secaoTopo}>
        <View style={estilos.secaoNumero}>
          <Texto variante="pequeno" cor="primariaClara">
            {numero}
          </Texto>
        </View>
        <Texto
          variante="titulo3"
          estilo={estilos.flex}
          accessibilityRole="header"
        >
          {titulo}
        </Texto>
        {direita}
      </View>
      {children}
    </View>
  );
}

export default function FormTreino({ navigation, route }) {
  const { treinoId, alunoId: alunoInicial } = route.params ?? {};
  const editando = !!treinoId;
  const { perfil } = useAuth();
  const { toast, confirmar } = useFeedback();

  const [form, setForm] = useState({ ...VAZIO, alunoId: alunoInicial ?? null });
  const [original, setOriginal] = useState(null);
  const [alunos, setAlunos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const tentouSalvar = useRef(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [lista, treino] = await Promise.all([
          api.listarAlunos(perfil.id),
          editando ? api.obterTreino(treinoId) : Promise.resolve(null),
        ]);
        if (!ativo) return;
        setAlunos(lista);
        const inicial = treino
          ? {
              alunoId: treino.alunoId,
              nome: treino.nome,
              grupoMuscular: treino.grupoMuscular,
              objetivo: treino.objetivo,
              observacoes: treino.observacoes ?? "",
              exercicios: treino.exercicios,
            }
          : {
              ...VAZIO,
              alunoId:
                alunoInicial ?? (lista.length === 1 ? lista[0].id : null),
            };
        setForm(inicial);
        setOriginal(inicial);
      } catch (e) {
        if (ativo) setErroCarga(traduzirErro(e));
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [perfil.id, treinoId, editando, alunoInicial]);

  const alterado = useMemo(
    () => original && JSON.stringify(form) !== JSON.stringify(original),
    [form, original]
  );

  // Evita perder o que foi digitado ao voltar sem salvar (prevenção de erros)
  usePreventRemove(!!alterado && !concluido, ({ data }) => {
    confirmar({
      titulo: "Descartar alterações?",
      mensagem: "Você tem mudanças que ainda não foram salvas.",
      textoConfirmar: "Descartar",
      textoCancelar: "Continuar editando",
      perigo: true,
    }).then((ok) => ok && navigation.dispatch(data.action));
  });

  useEffect(() => {
    if (concluido) navigation.goBack();
  }, [concluido, navigation]);

  const atualizar = (campos) => {
    const novo = { ...form, ...campos };
    setForm(novo);
    // Depois da primeira tentativa de salvar, os erros somem assim que corrigidos
    if (tentouSalvar.current) setErros(validarTreino(novo));
  };

  const salvar = async () => {
    tentouSalvar.current = true;
    const encontrados = validarTreino(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      toast("Revise os campos destacados", "erro");
      return;
    }
    setSalvando(true);
    try {
      const dados = { ...form, exercicios: limparExercicios(form.exercicios) };
      if (editando) await api.atualizarTreino(treinoId, dados);
      else await api.criarTreino(perfil.id, dados);
      toast(
        editando ? "Treino atualizado!" : "Treino criado e enviado ao aluno!"
      );
      setConcluido(true);
    } catch (e) {
      toast(traduzirErro(e), "erro");
      setSalvando(false);
    }
  };

  const excluir = async () => {
    const ok = await confirmar({
      titulo: "Mover para a lixeira?",
      mensagem:
        "O aluno deixa de ver este treino. Você pode restaurá-lo depois pela lixeira.",
      textoConfirmar: "Mover",
      perigo: true,
      icone: "trash-2",
    });
    if (!ok) return;
    try {
      await api.moverParaLixeira(treinoId);
      toast("Treino movido para a lixeira", "info");
      setConcluido(true);
    } catch (e) {
      toast(traduzirErro(e), "erro");
    }
  };

  const cabecalho = (
    <Cabecalho
      titulo={editando ? "Editar treino" : "Novo treino"}
      iconeVoltar="x"
      direita={
        editando && !carregando ? (
          <BotaoIcone
            icone="trash-2"
            rotulo="Mover treino para a lixeira"
            variante="perigo"
            onPress={excluir}
          />
        ) : null
      }
    />
  );

  if (carregando) {
    return (
      <Tela cabecalho={cabecalho}>
        <View style={{ gap: espaco.lg }}>
          <Esqueleto altura={22} largura="50%" />
          <Esqueleto altura={72} raio={raio.lg} />
          <Esqueleto altura={52} raio={raio.md} />
          <Esqueleto altura={220} raio={raio.lg} />
        </View>
      </Tela>
    );
  }

  if (erroCarga) {
    return (
      <Tela cabecalho={cabecalho}>
        <EstadoVazio
          icone="wifi-off"
          titulo="Não foi possível abrir o treino"
          descricao={erroCarga}
          acao={{
            titulo: "Voltar",
            icone: "arrow-left",
            variante: "secundario",
            onPress: () => navigation.goBack(),
          }}
        />
      </Tela>
    );
  }

  if (!alunos.length && !editando) {
    return (
      <Tela cabecalho={cabecalho}>
        <EstadoVazio
          icone="users"
          titulo="Você ainda não tem alunos"
          descricao="Para criar um treino, primeiro convide um aluno com o seu código."
        />
        <CartaoConvite codigo={perfil.codigoConvite} />
      </Tela>
    );
  }

  const series = totalSeries(form);
  const resumo = form.exercicios.length
    ? `${form.exercicios.length} ${form.exercicios.length === 1 ? "exercício" : "exercícios"} · ${series} séries · ≈ ${estimarDuracaoMin(form)} min`
    : "Nenhum exercício ainda";

  return (
    <Tela
      teclado
      cabecalho={cabecalho}
      rodape={
        <View style={estilos.rodape}>
          <View style={estilos.flex}>
            <Texto variante="legendaForte" numberOfLines={1}>
              {form.nome.trim() || "Treino sem nome"}
            </Texto>
            <Texto variante="legenda" cor="textoSecundario" numberOfLines={1}>
              {resumo}
            </Texto>
          </View>
          <Botao
            titulo={editando ? "Salvar" : "Criar treino"}
            icone="check"
            onPress={salvar}
            carregando={salvando}
            larguraTotal={false}
          />
        </View>
      }
    >
      <Secao numero="1" titulo="Para qual aluno?">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={estilos.alunosRolagem}
          contentContainerStyle={estilos.alunosConteudo}
          accessibilityRole="radiogroup"
        >
          {alunos.map((a) => {
            const ativo = form.alunoId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => atualizar({ alunoId: a.id })}
                accessibilityRole="radio"
                aria-checked={ativo}
                accessibilityLabel={a.nome}
                style={({ pressed }) => [
                  estilos.aluno,
                  ativo && estilos.alunoAtivo,
                  !!erros.aluno && estilos.alunoErro,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Avatar nome={a.nome} tamanho={44} />
                <Texto
                  variante="legendaForte"
                  cor={ativo ? "texto" : "textoSecundario"}
                  numberOfLines={1}
                >
                  {a.nome.split(" ")[0]}
                </Texto>
                {ativo && (
                  <View style={estilos.alunoMarca}>
                    <Icone nome="check" tamanho={11} cor="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        {!!erros.aluno && (
          <Texto variante="legenda" cor="#F87171" estilo={estilos.erroSecao}>
            {erros.aluno}
          </Texto>
        )}
      </Secao>

      <Secao numero="2" titulo="Informações">
        <CampoTexto
          rotulo="Nome do treino"
          icone="tag"
          placeholder="Ex.: Treino A · Peito e tríceps"
          value={form.nome}
          onChangeText={(nome) => atualizar({ nome })}
          erro={erros.nome}
          maxLength={80}
          returnKeyType="done"
        />
        <Texto
          variante="legendaForte"
          cor="textoSecundario"
          estilo={estilos.rotulo}
        >
          Objetivo
        </Texto>
        <View style={estilos.objetivos}>
          {OBJETIVOS.map((o) => (
            <Chip
              key={o}
              rotulo={o}
              selecionado={form.objetivo === o}
              onPress={() =>
                atualizar({ objetivo: form.objetivo === o ? null : o })
              }
            />
          ))}
        </View>
      </Secao>

      <Secao numero="3" titulo="Grupo muscular">
        <SeletorGrupo
          valor={form.grupoMuscular}
          aoMudar={(grupoMuscular) => atualizar({ grupoMuscular })}
          erro={erros.grupo}
        />
      </Secao>

      <Secao
        numero="4"
        titulo="Exercícios"
        direita={
          form.exercicios.length ? (
            <Texto variante="legendaForte" cor="textoSecundario">
              {form.exercicios.length}
            </Texto>
          ) : null
        }
      >
        <EditorExercicios
          exercicios={form.exercicios}
          aoMudar={(exercicios) => atualizar({ exercicios })}
          grupo={form.grupoMuscular}
          erro={erros.exercicios}
        />
      </Secao>

      <Secao numero="5" titulo="Observações">
        <CampoTexto
          placeholder="Dicas de execução, aquecimento, cuidados... (opcional)"
          value={form.observacoes}
          onChangeText={(observacoes) => atualizar({ observacoes })}
          multiline
          maxLength={500}
          accessibilityLabel="Observações"
        />
      </Secao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  secao: { marginBottom: espaco.xxl },
  secaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    marginBottom: espaco.md,
  },
  secaoNumero: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  alunosRolagem: { marginHorizontal: -margemTela, flexGrow: 0 },
  alunosConteudo: { paddingHorizontal: margemTela, gap: espaco.sm },
  aluno: {
    width: 84,
    alignItems: "center",
    gap: 6,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  alunoAtivo: { borderColor: cores.primaria, backgroundColor: "#0E1E3D" },
  alunoErro: { borderColor: "rgba(239, 68, 68, 0.5)" },
  alunoMarca: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  erroSecao: { marginTop: espaco.sm },
  rotulo: { marginBottom: espaco.sm },
  objetivos: { flexDirection: "row", flexWrap: "wrap", gap: espaco.sm },
  rodape: { flexDirection: "row", alignItems: "center", gap: espaco.md },
});
