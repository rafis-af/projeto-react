import { StyleSheet, View } from "react-native";

import {
  Avatar,
  Botao,
  Cabecalho,
  CabecalhoSecao,
  Cartao,
  CartaoEstatistica,
  CartaoTreino,
  Esqueleto,
  EstadoVazio,
  FaixaSemana,
  Icone,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import { obterGrupo } from "../../data/catalogo";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { traduzirErro } from "../../services/erros";
import { cores, espaco, raio } from "../../theme";
import {
  formatarDataCompleta,
  formatarDataCurta,
  formatarDuracao,
  formatarHora,
} from "../../utils/datas";
import { naSemana } from "../../utils/estatisticas";

export default function DetalheAluno({ navigation, route }) {
  const { alunoId } = route.params;
  const { perfil } = useAuth();
  const { confirmar, toast } = useFeedback();

  const { dados, carregando, atualizando, erro, recarregar } =
    useDados(async () => {
      const [aluno, treinos, historico] = await Promise.all([
        api.obterPessoa(alunoId),
        api.listarTreinosDoPersonal(perfil.id),
        api.listarHistorico({ alunoId }),
      ]);
      return {
        aluno,
        treinos: treinos.filter((t) => t.alunoId === alunoId),
        historico,
      };
    }, [alunoId, perfil.id]);

  const aluno = dados?.aluno;
  const primeiroNome = aluno?.nome.split(" ")[0] ?? "";

  const remover = async () => {
    const ok = await confirmar({
      titulo: `Remover ${primeiroNome}?`,
      mensagem: `Os treinos que você criou para ${primeiroNome} vão para a lixeira e o vínculo é desfeito. Para voltar, basta usar seu código de novo.`,
      textoConfirmar: "Remover",
      perigo: true,
      icone: "user-minus",
    });
    if (!ok) return;
    try {
      await api.removerAluno(alunoId);
      toast(`Vínculo com ${primeiroNome} desfeito`, "info");
      navigation.goBack();
    } catch (e) {
      toast(traduzirErro(e), "erro");
    }
  };

  const novoTreino = () => navigation.navigate("FormTreino", { alunoId });

  return (
    <Tela
      cabecalho={<Cabecalho titulo="Aluno" />}
      aoAtualizar={recarregar}
      atualizando={atualizando}
    >
      {carregando ? (
        <View style={estilos.carregando}>
          <Esqueleto
            altura={80}
            largura={80}
            raio={40}
            estilo={{ alignSelf: "center" }}
          />
          <Esqueleto
            altura={22}
            largura="50%"
            estilo={{ alignSelf: "center" }}
          />
          <Esqueleto altura={104} raio={raio.lg} />
          <Esqueleto altura={92} raio={raio.lg} />
        </View>
      ) : erro || !aluno ? (
        <EstadoVazio
          icone="user-x"
          titulo="Aluno indisponível"
          descricao={erro ?? "Este aluno não está mais vinculado a você."}
          acao={{
            titulo: "Voltar",
            icone: "arrow-left",
            onPress: () => navigation.goBack(),
            variante: "secundario",
          }}
        />
      ) : (
        <>
          <View style={estilos.perfil}>
            <Avatar nome={aluno.nome} tamanho={80} />
            <Texto
              variante="titulo1"
              alinhamento="center"
              estilo={estilos.nome}
            >
              {aluno.nome}
            </Texto>
            <Texto variante="legenda" cor="textoSecundario">
              {aluno.email} · aluno desde {formatarDataCompleta(aluno.criadoEm)}
            </Texto>
          </View>

          <View style={estilos.estatisticas}>
            <CartaoEstatistica
              icone="dumbbell"
              valor={dados.treinos.length}
              rotulo="Treinos"
            />
            <CartaoEstatistica
              icone="circle-check-big"
              valor={dados.historico.length}
              rotulo="Concluídos"
              cor="#4ADE80"
            />
            <CartaoEstatistica
              icone="flame"
              valor={naSemana(dados.historico).length}
              rotulo="Na semana"
              cor="#FBBF24"
            />
          </View>

          <Cartao estilo={estilos.semana}>
            <Texto
              variante="legendaForte"
              cor="textoSecundario"
              estilo={estilos.semanaTitulo}
            >
              Frequência desta semana
            </Texto>
            <FaixaSemana historico={dados.historico} />
          </Cartao>

          <CabecalhoSecao
            titulo="Treinos"
            acao="Novo treino"
            onAcao={novoTreino}
          />
          {dados.treinos.length === 0 ? (
            <EstadoVazio
              icone="clipboard-plus"
              titulo={`${primeiroNome} ainda não tem treinos`}
              descricao="Monte o primeiro treino. Ele aparece na hora no app do aluno."
              acao={{
                titulo: "Criar treino",
                icone: "plus",
                onPress: novoTreino,
              }}
            />
          ) : (
            <View style={estilos.lista}>
              {dados.treinos.map((t) => (
                <CartaoTreino
                  key={t.id}
                  treino={t}
                  subtitulo={t.objetivo ?? undefined}
                  onPress={() =>
                    navigation.navigate("FormTreino", { treinoId: t.id })
                  }
                />
              ))}
            </View>
          )}

          <CabecalhoSecao titulo="Histórico recente" />
          {dados.historico.length === 0 ? (
            <Texto variante="corpo" cor="textoSecundario">
              Nenhum treino concluído ainda.
            </Texto>
          ) : (
            <View style={estilos.lista}>
              {dados.historico.slice(0, 8).map((h) => (
                <View key={h.id} style={estilos.historico}>
                  <View style={estilos.historicoIcone}>
                    <Icone nome="circle-check-big" tamanho={18} cor="#4ADE80" />
                  </View>
                  <View style={estilos.flex}>
                    <Texto variante="corpoForte" numberOfLines={1}>
                      {h.nomeTreino}
                    </Texto>
                    <Texto variante="legenda" cor="textoSecundario">
                      {formatarDataCurta(h.concluidoEm)} às{" "}
                      {formatarHora(h.concluidoEm)} ·{" "}
                      {formatarDuracao(h.duracaoSegundos)}
                    </Texto>
                  </View>
                  <Texto variante="legendaForte" cor="textoSecundario">
                    {obterGrupo(h.grupoMuscular).nome}
                  </Texto>
                </View>
              ))}
            </View>
          )}

          <Botao
            titulo="Remover aluno da lista"
            icone="user-minus"
            variante="perigo"
            onPress={remover}
            estilo={estilos.remover}
          />
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  carregando: { gap: espaco.lg, marginTop: espaco.lg },
  perfil: {
    alignItems: "center",
    marginTop: espaco.md,
    marginBottom: espaco.xl,
  },
  nome: { marginTop: espaco.md },
  estatisticas: { flexDirection: "row", gap: espaco.md },
  semana: { marginTop: espaco.lg },
  semanaTitulo: { marginBottom: espaco.md },
  lista: { gap: espaco.sm },
  historico: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  historicoIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.sucessoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  remover: { marginTop: espaco.xxxl },
});
