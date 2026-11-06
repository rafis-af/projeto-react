import { StyleSheet, View } from "react-native";

import {
  Botao,
  Cabecalho,
  CabecalhoSecao,
  CartaoTreino,
  Icone,
  Tela,
  Texto,
} from "../../components";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { cores, espaco, raio } from "../../theme";
import { resumoExercicio, totalSeries } from "../../utils/treino";

export default function DetalheTreino({ navigation, route }) {
  const inicial = route.params.treino;
  // Mostra na hora o que veio da lista e atualiza em segundo plano
  const { dados } = useDados(() => api.obterTreino(inicial.id), [inicial.id]);
  const treino = dados ?? inicial;

  const informacoes = [
    { icone: "target", rotulo: "Objetivo", valor: treino.objetivo || "Livre" },
    { icone: "layers", rotulo: "Séries", valor: String(totalSeries(treino)) },
    {
      icone: "list-checks",
      rotulo: "Exercícios",
      valor: String(treino.exercicios.length),
    },
  ];

  return (
    <Tela
      cabecalho={<Cabecalho titulo="Detalhes do treino" />}
      rodape={
        <Botao
          titulo="Iniciar treino"
          icone="play"
          tamanho="lg"
          onPress={() => navigation.navigate("TreinoEmAndamento", { treino })}
          desabilitado={!treino.exercicios.length}
        />
      }
    >
      <CartaoTreino variante="destaque" treino={treino} />

      <View style={estilos.informacoes}>
        {informacoes.map((i) => (
          <View key={i.rotulo} style={estilos.informacao}>
            <Icone nome={i.icone} tamanho={18} cor={cores.primariaClara} />
            <Texto variante="corpoForte" numberOfLines={1}>
              {i.valor}
            </Texto>
            <Texto variante="pequeno" cor="textoTerciario">
              {i.rotulo.toUpperCase()}
            </Texto>
          </View>
        ))}
      </View>

      {!!treino.observacoes && (
        <View style={estilos.observacao}>
          <View style={estilos.observacaoTopo}>
            <Icone
              nome="message-square-quote"
              tamanho={18}
              cor={cores.primariaClara}
            />
            <Texto variante="legendaForte" cor="primariaClara">
              Dica do seu personal
            </Texto>
          </View>
          <Texto variante="corpo">{treino.observacoes}</Texto>
        </View>
      )}

      <CabecalhoSecao titulo="Exercícios" />
      <View style={estilos.lista}>
        {treino.exercicios.map((ex, i) => (
          <View key={ex.id ?? i} style={estilos.exercicio}>
            <View style={estilos.numero}>
              <Texto variante="legendaForte" cor="primariaClara">
                {i + 1}
              </Texto>
            </View>
            <View style={estilos.flex}>
              <Texto variante="corpoForte">{ex.nome}</Texto>
              <Texto variante="legenda" cor="textoSecundario">
                {resumoExercicio(ex)}
              </Texto>
            </View>
            {Number(ex.descanso) > 0 && (
              <View style={estilos.descanso}>
                <Icone nome="timer" tamanho={13} cor={cores.textoSecundario} />
                <Texto variante="legendaForte" cor="textoSecundario">
                  {ex.descanso}s
                </Texto>
              </View>
            )}
          </View>
        ))}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  informacoes: { flexDirection: "row", gap: espaco.sm, marginTop: espaco.lg },
  informacao: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  observacao: {
    marginTop: espaco.lg,
    padding: espaco.lg,
    borderRadius: raio.lg,
    backgroundColor: cores.primariaSuave,
    borderWidth: 1,
    borderColor: "rgba(91, 155, 255, 0.3)",
    gap: espaco.sm,
  },
  observacaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
  },
  lista: { gap: espaco.sm },
  exercicio: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  numero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  descanso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficie2,
  },
});
