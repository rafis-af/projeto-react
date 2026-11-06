import { usePreventRemove } from "@react-navigation/native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AnelProgresso,
  Botao,
  BotaoIcone,
  CabecalhoSecao,
  Icone,
  MapaMuscular,
  Selo,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import { api } from "../../services/api";
import { traduzirErro } from "../../services/erros";
import {
  cores,
  espaco,
  gradientes,
  margemTela,
  raio,
  tipografia,
} from "../../theme";
import { formatarCronometro } from "../../utils/datas";
import {
  vibrarFimDescanso,
  vibrarSucesso,
  vibrarToque,
} from "../../utils/feedback";
import { resumoExercicio, totalSeries } from "../../utils/treino";

const TAG_TELA_LIGADA = "treino-em-andamento";

export default function TreinoEmAndamento({ navigation, route }) {
  const { treino } = route.params;
  const exercicios = treino.exercicios;
  const total = totalSeries(treino);
  const { perfil } = useAuth();
  const { confirmar, toast } = useFeedback();
  const insets = useSafeAreaInsets();

  const [indice, setIndice] = useState(0);
  const [feitas, setFeitas] = useState(() => exercicios.map(() => 0));
  const [descanso, setDescanso] = useState(null); // { fim: timestamp, total: segundos }
  const [agora, setAgora] = useState(Date.now());
  const [salvando, setSalvando] = useState(false);
  const [resumoFinal, setResumoFinal] = useState(null);
  const inicio = useRef(Date.now());
  const concluidasRef = useRef(0);

  const concluidas = feitas.reduce((soma, n) => soma + n, 0);
  concluidasRef.current = concluidas;
  const atual = exercicios[indice];
  const feitasAtual = feitas[indice];
  const atualCompleto = feitasAtual >= atual.series;
  const decorrido = Math.floor((agora - inicio.current) / 1000);
  const restante = descanso
    ? Math.max(0, Math.ceil((descanso.fim - agora) / 1000))
    : 0;

  // Relógio baseado em horário real: continua certo mesmo se o app for para segundo plano
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Mantém a tela ligada durante o treino
  useEffect(() => {
    activateKeepAwakeAsync(TAG_TELA_LIGADA).catch(() => {});
    return () => {
      Promise.resolve()
        .then(() => deactivateKeepAwake(TAG_TELA_LIGADA))
        .catch(() => {});
    };
  }, []);

  // Fim do descanso: vibra e volta para o exercício
  useEffect(() => {
    if (descanso && agora >= descanso.fim) {
      vibrarFimDescanso();
      setDescanso(null);
    }
  }, [agora, descanso]);

  useEffect(() => {
    if (resumoFinal)
      navigation.replace("TreinoConcluido", { resumo: resumoFinal });
  }, [resumoFinal, navigation]);

  const proximoPendente = (lista, aPartirDe) => {
    for (let passo = 1; passo <= exercicios.length; passo += 1) {
      const i = (aPartirDe + passo) % exercicios.length;
      if (lista[i] < exercicios[i].series) return i;
    }
    return -1;
  };

  const finalizar = async (lista = feitas) => {
    if (salvando) return;
    const seriesConcluidas = lista.reduce((soma, n) => soma + n, 0);
    const duracaoSegundos = Math.max(
      1,
      Math.round((Date.now() - inicio.current) / 1000)
    );
    setSalvando(true);
    setDescanso(null);
    try {
      await api.registrarConclusao(perfil.id, {
        treino,
        duracaoSegundos,
        seriesConcluidas,
        totalSeries: total,
      });
      vibrarSucesso();
      setResumoFinal({
        nome: treino.nome,
        grupoMuscular: treino.grupoMuscular,
        duracaoSegundos,
        seriesConcluidas,
        totalSeries: total,
        exercicios: exercicios.length,
        exerciciosCompletos: exercicios.filter((ex, i) => lista[i] >= ex.series)
          .length,
      });
    } catch (e) {
      toast(traduzirErro(e), "erro");
      setSalvando(false);
    }
  };

  // Sair do treino (botão X ou "voltar" do Android) sempre pede confirmação
  usePreventRemove(!resumoFinal, ({ data }) => {
    if (concluidasRef.current === 0) {
      confirmar({
        titulo: "Sair do treino?",
        mensagem: "Nenhuma série foi concluída, então nada será salvo.",
        textoConfirmar: "Sair",
        textoCancelar: "Continuar",
        perigo: true,
        icone: "log-out",
      }).then((ok) => ok && navigation.dispatch(data.action));
      return;
    }
    confirmar({
      titulo: "Encerrar treino?",
      mensagem: `Você concluiu ${concluidasRef.current} de ${total} séries. Quer salvar o que já fez?`,
      textoConfirmar: "Salvar e sair",
      textoCancelar: "Continuar",
      textoAlternativo: "Descartar treino",
      icone: "flag",
    }).then((resposta) => {
      if (resposta === true) finalizar();
      else if (resposta === "alternativo") navigation.dispatch(data.action);
    });
  });

  const concluirSerie = () => {
    if (descanso || salvando || atualCompleto) return;
    const novas = [...feitas];
    novas[indice] += 1;
    setFeitas(novas);
    const exercicioCompleto = novas[indice] >= atual.series;
    const proximo = exercicioCompleto ? proximoPendente(novas, indice) : indice;
    if (proximo === -1) {
      finalizar(novas);
      return;
    }
    vibrarToque();
    if (exercicioCompleto) setIndice(proximo);
    const segundos = Number(atual.descanso) || 0;
    if (segundos > 0)
      setDescanso({ fim: Date.now() + segundos * 1000, total: segundos });
  };

  const desfazerSerie = () => {
    if (!feitasAtual) return;
    const novas = [...feitas];
    novas[indice] -= 1;
    setFeitas(novas);
    setDescanso(null);
  };

  const ajustarDescanso = (segundos) =>
    setDescanso((d) => {
      if (!d) return d;
      const fim = d.fim + segundos * 1000;
      return fim <= Date.now()
        ? null
        : { fim, total: Math.max(1, d.total + segundos) };
    });

  const pedirFinalizacao = async () => {
    if (!concluidas) {
      toast("Conclua pelo menos uma série para salvar o treino.", "info");
      return;
    }
    const ok = await confirmar({
      titulo: "Finalizar agora?",
      mensagem: `Você concluiu ${concluidas} de ${total} séries. O treino será salvo no seu histórico.`,
      textoConfirmar: "Finalizar",
      textoCancelar: "Continuar",
      icone: "flag",
    });
    if (ok) finalizar();
  };

  const progresso = total ? concluidas / total : 0;

  return (
    <View style={estilos.tela}>
      <View style={[estilos.topo, { paddingTop: insets.top + espaco.sm }]}>
        <BotaoIcone
          icone="x"
          rotulo="Encerrar treino"
          onPress={() => navigation.goBack()}
          tamanhoIcone={22}
        />
        <View style={estilos.topoCentro}>
          <Texto
            variante="legendaForte"
            cor="textoSecundario"
            numberOfLines={1}
          >
            {treino.nome}
          </Texto>
          <Texto
            variante="titulo2"
            estilo={estilos.relogio}
            accessibilityLabel={`Tempo de treino ${formatarCronometro(decorrido)}`}
          >
            {formatarCronometro(decorrido)}
          </Texto>
        </View>
        <BotaoIcone
          icone="flag"
          rotulo="Finalizar treino"
          onPress={pedirFinalizacao}
        />
      </View>

      <View style={estilos.progresso}>
        <View
          style={estilos.barraFundo}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Progresso do treino"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={concluidas}
        >
          <LinearGradient
            colors={["#8CBBFF", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              estilos.barraValor,
              { width: `${Math.round(progresso * 100)}%` },
            ]}
          />
        </View>
        <Texto variante="legendaForte" cor="textoSecundario">
          {concluidas}/{total} séries
        </Texto>
      </View>

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {descanso ? (
          <View style={estilos.descanso} accessibilityLiveRegion="polite">
            <Texto variante="rotulo" cor="primariaClara">
              Descanso
            </Texto>
            <AnelProgresso
              tamanho={228}
              espessura={14}
              progresso={restante / descanso.total}
              estilo={estilos.anel}
            >
              <Texto
                variante="cronometro"
                accessibilityLabel={`${restante} segundos de descanso`}
              >
                {formatarCronometro(restante)}
              </Texto>
              <Texto variante="legenda" cor="textoSecundario">
                respire e hidrate-se
              </Texto>
            </AnelProgresso>
            <Texto variante="corpo" cor="textoSecundario" alinhamento="center">
              A seguir: <Texto variante="corpoForte">{atual.nome}</Texto>
              {"\n"}série {Math.min(feitasAtual + 1, atual.series)} de{" "}
              {atual.series}
            </Texto>
            <View style={estilos.ajustes}>
              <Botao
                titulo="−15s"
                variante="secundario"
                tamanho="sm"
                onPress={() => ajustarDescanso(-15)}
                estilo={estilos.flex}
              />
              <Botao
                titulo="+15s"
                variante="secundario"
                tamanho="sm"
                onPress={() => ajustarDescanso(15)}
                estilo={estilos.flex}
              />
            </View>
          </View>
        ) : (
          <View style={estilos.exercicio}>
            <LinearGradient
              colors={gradientes.capa}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <MapaMuscular
              grupo={treino.grupoMuscular}
              enquadramento="foco"
              largura={150}
              altura={150}
              estilo={estilos.mapa}
            />
            <Texto variante="rotulo" cor="primariaClara">
              Exercício {indice + 1} de {exercicios.length}
            </Texto>
            <Texto variante="titulo1" estilo={estilos.exercicioNome}>
              {atual.nome}
            </Texto>
            <View style={estilos.infos}>
              <Info icone="repeat" texto={`${atual.repeticoes} reps`} />
              {!!String(atual.carga ?? "").trim() && (
                <Info
                  icone="weight"
                  texto={
                    /^\d+([.,]\d+)?$/.test(String(atual.carga))
                      ? `${atual.carga} kg`
                      : atual.carga
                  }
                />
              )}
              <Info icone="timer" texto={`${atual.descanso}s de descanso`} />
            </View>

            <View
              style={estilos.series}
              accessible
              accessibilityLabel={`${feitasAtual} de ${atual.series} séries concluídas`}
            >
              {Array.from({ length: atual.series }).map((_, s) => {
                const feita = s < feitasAtual;
                const daVez = s === feitasAtual;
                return (
                  <View
                    key={s}
                    style={[
                      estilos.serie,
                      feita && estilos.serieFeita,
                      daVez && estilos.serieDaVez,
                    ]}
                  >
                    {feita ? (
                      <Icone nome="check" tamanho={18} cor="#FFFFFF" />
                    ) : (
                      <Texto
                        variante="corpoForte"
                        cor={daVez ? "texto" : "textoTerciario"}
                      >
                        {s + 1}
                      </Texto>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={estilos.navegacao}>
              <Botao
                titulo="Anterior"
                icone="chevron-left"
                variante="fantasma"
                tamanho="sm"
                larguraTotal={false}
                desabilitado={indice === 0}
                onPress={() => setIndice(indice - 1)}
              />
              {feitasAtual > 0 && (
                <Botao
                  titulo="Desfazer"
                  icone="undo-2"
                  variante="fantasma"
                  tamanho="sm"
                  larguraTotal={false}
                  onPress={desfazerSerie}
                />
              )}
              <Botao
                titulo="Próximo"
                iconeDireita="chevron-right"
                variante="fantasma"
                tamanho="sm"
                larguraTotal={false}
                desabilitado={indice === exercicios.length - 1}
                onPress={() => setIndice(indice + 1)}
              />
            </View>
          </View>
        )}

        <CabecalhoSecao titulo="Exercícios do treino" />
        <View style={estilos.lista}>
          {exercicios.map((ex, i) => {
            const completo = feitas[i] >= ex.series;
            const ativo = i === indice;
            return (
              <Pressable
                key={ex.id ?? i}
                onPress={() => setIndice(i)}
                accessibilityRole="button"
                aria-selected={ativo}
                accessibilityLabel={`${ex.nome}, ${feitas[i]} de ${ex.series} séries`}
                style={({ pressed }) => [
                  estilos.item,
                  ativo && estilos.itemAtivo,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View
                  style={[estilos.itemStatus, completo && estilos.itemCompleto]}
                >
                  {completo ? (
                    <Icone nome="check" tamanho={15} cor="#FFFFFF" />
                  ) : (
                    <Texto
                      variante="legendaForte"
                      cor={ativo ? "primariaClara" : "textoTerciario"}
                    >
                      {i + 1}
                    </Texto>
                  )}
                </View>
                <View style={estilos.flex}>
                  <Texto
                    variante="corpoForte"
                    numberOfLines={1}
                    cor={completo ? "textoSecundario" : "texto"}
                  >
                    {ex.nome}
                  </Texto>
                  <Texto variante="legenda" cor="textoSecundario">
                    {feitas[i]}/{ex.series} séries · {resumoExercicio(ex)}
                  </Texto>
                </View>
                {ativo && <Selo texto="Agora" />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          estilos.rodape,
          { paddingBottom: Math.max(insets.bottom, espaco.lg) },
        ]}
      >
        {descanso ? (
          <Botao
            titulo="Pular descanso"
            icone="skip-forward"
            variante="secundario"
            tamanho="lg"
            onPress={() => setDescanso(null)}
          />
        ) : atualCompleto ? (
          <Botao
            titulo="Ir para o próximo exercício"
            iconeDireita="arrow-right"
            tamanho="lg"
            onPress={() =>
              setIndice(Math.max(0, proximoPendente(feitas, indice)))
            }
          />
        ) : (
          <Botao
            titulo={`Concluir série ${feitasAtual + 1} de ${atual.series}`}
            icone="check"
            tamanho="lg"
            onPress={concluirSerie}
            carregando={salvando}
          />
        )}
      </View>
    </View>
  );
}

function Info({ icone, texto }) {
  return (
    <View style={estilos.info}>
      <Icone nome={icone} tamanho={14} cor={cores.primariaClara} />
      <Texto variante="legendaForte">{texto}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingHorizontal: espaco.lg,
  },
  topoCentro: { flex: 1, alignItems: "center" },
  relogio: { ...tipografia.titulo2, fontVariant: ["tabular-nums"] },
  progresso: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingHorizontal: margemTela,
    paddingVertical: espaco.md,
  },
  barraFundo: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: cores.superficie3,
    overflow: "hidden",
  },
  barraValor: { height: "100%", borderRadius: 4 },
  conteudo: { paddingHorizontal: margemTela, paddingBottom: espaco.xxxl },
  exercicio: {
    borderRadius: raio.xl,
    overflow: "hidden",
    padding: espaco.xl,
    borderWidth: 1,
    borderColor: cores.bordaForte,
  },
  mapa: { position: "absolute", right: -26, top: -10, opacity: 0.55 },
  exercicioNome: { marginTop: espaco.sm, marginRight: 70 },
  infos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginTop: espaco.lg,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: raio.pilula,
    backgroundColor: "rgba(6, 11, 22, 0.55)",
    borderWidth: 1,
    borderColor: cores.borda,
  },
  series: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginTop: espaco.xl,
  },
  serie: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 11, 22, 0.55)",
    borderWidth: 1.5,
    borderColor: cores.bordaForte,
  },
  serieFeita: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  serieDaVez: { borderColor: cores.primariaClara, borderWidth: 2 },
  navegacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: espaco.lg,
    marginHorizontal: -espaco.sm,
  },
  descanso: {
    alignItems: "center",
    gap: espaco.lg,
    padding: espaco.xl,
    borderRadius: raio.xl,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.bordaForte,
  },
  anel: { marginVertical: espaco.sm },
  ajustes: { flexDirection: "row", gap: espaco.md, alignSelf: "stretch" },
  lista: { gap: espaco.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  itemAtivo: { borderColor: cores.primaria, backgroundColor: "#0E1E3D" },
  itemStatus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.superficie2,
  },
  itemCompleto: { backgroundColor: cores.sucesso },
  rodape: {
    paddingHorizontal: margemTela,
    paddingTop: espaco.md,
    backgroundColor: cores.fundoElevado,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
});
