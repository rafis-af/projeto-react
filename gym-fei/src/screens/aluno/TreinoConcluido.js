import { StyleSheet, View } from "react-native";

import {
  AnelProgresso,
  Botao,
  Cartao,
  CartaoEstatistica,
  Icone,
  Selo,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { fraseDoDia, obterGrupo } from "../../data/catalogo";
import { cores, espaco, raio } from "../../theme";
import { formatarDuracao } from "../../utils/datas";

export default function TreinoConcluido({ navigation, route }) {
  const { resumo } = route.params;
  const { perfil } = useAuth();
  const primeiroNome = perfil.nome.split(" ")[0];
  const completo = resumo.seriesConcluidas >= resumo.totalSeries;
  const frase = fraseDoDia();

  const irParaProgresso = () => {
    navigation.popToTop();
    navigation.navigate("AbasAluno", { screen: "Progresso" });
  };

  return (
    <Tela
      rodape={
        <View style={estilos.botoes}>
          <Botao
            titulo="Voltar ao início"
            icone="house"
            onPress={() => navigation.popToTop()}
          />
          <Botao
            titulo="Ver meu progresso"
            icone="chart-column"
            variante="secundario"
            onPress={irParaProgresso}
          />
        </View>
      }
    >
      <View style={estilos.celebracao}>
        <AnelProgresso
          tamanho={176}
          espessura={12}
          progresso={resumo.seriesConcluidas / (resumo.totalSeries || 1)}
        >
          <View style={estilos.selo}>
            <Icone
              nome={completo ? "trophy" : "circle-check-big"}
              tamanho={50}
              cor="#FFFFFF"
            />
          </View>
        </AnelProgresso>
        <Texto
          variante="display"
          alinhamento="center"
          estilo={estilos.titulo}
          accessibilityRole="header"
        >
          {completo ? "Treino concluído!" : "Treino registrado!"}
        </Texto>
        <Texto variante="corpo" cor="textoSecundario" alinhamento="center">
          {completo
            ? `Mandou bem, ${primeiroNome}! Mais um passo na sua evolução.`
            : `Bom trabalho, ${primeiroNome}! Cada série conta.`}
        </Texto>
      </View>

      <Cartao estilo={estilos.treino}>
        <View style={estilos.flex}>
          <Texto variante="corpoForte">{resumo.nome}</Texto>
          <Texto variante="legenda" cor="textoSecundario">
            Salvo no seu histórico · seu personal também acompanha
          </Texto>
        </View>
        <Selo texto={obterGrupo(resumo.grupoMuscular).nome} />
      </Cartao>

      <View style={estilos.estatisticas}>
        <CartaoEstatistica
          icone="clock"
          valor={formatarDuracao(resumo.duracaoSegundos)}
          rotulo="Duração"
          cor={cores.ciano}
        />
        <CartaoEstatistica
          icone="layers"
          valor={`${resumo.seriesConcluidas}/${resumo.totalSeries}`}
          rotulo="Séries"
        />
        <CartaoEstatistica
          icone="list-checks"
          valor={`${resumo.exerciciosCompletos}/${resumo.exercicios}`}
          rotulo="Exercícios"
          cor="#4ADE80"
        />
      </View>

      <View style={estilos.frase}>
        <Icone nome="quote" tamanho={20} cor={cores.primariaClara} />
        <Texto variante="corpoForte">{frase.texto}</Texto>
        <Texto variante="legenda" cor="textoSecundario">
          — {frase.autor}
        </Texto>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  celebracao: {
    alignItems: "center",
    marginTop: espaco.xxl,
    marginBottom: espaco.xxl,
  },
  selo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: { marginTop: espaco.xxl, marginBottom: espaco.sm },
  treino: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  estatisticas: { flexDirection: "row", gap: espaco.md, marginTop: espaco.md },
  frase: {
    marginTop: espaco.xxl,
    padding: espaco.xl,
    borderRadius: raio.xl,
    backgroundColor: cores.fundoElevado,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espaco.sm,
  },
  botoes: { gap: espaco.md },
});
