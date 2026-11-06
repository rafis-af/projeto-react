import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import {
  Avatar,
  Botao,
  CabecalhoSecao,
  CartaoConvite,
  CartaoEstatistica,
  Esqueleto,
  EstadoVazio,
  Icone,
  Selo,
  Tela,
  Texto,
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { obterGrupo } from "../../data/catalogo";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { cores, espaco, gradientes, raio } from "../../theme";
import { formatarDuracao, formatarRelativo, saudacao } from "../../utils/datas";
import { naSemana } from "../../utils/estatisticas";

export default function InicioPersonal({ navigation }) {
  const { perfil } = useAuth();
  const { dados, carregando, atualizando, erro, recarregar } =
    useDados(async () => {
      const [alunos, treinos, historico] = await Promise.all([
        api.listarAlunos(perfil.id),
        api.listarTreinosDoPersonal(perfil.id),
        api.listarHistorico({ limite: 60 }),
      ]);
      return { alunos, treinos, historico };
    }, [perfil.id]);

  const primeiroNome = perfil.nome.split(" ")[0];
  const daSemana = dados ? naSemana(dados.historico) : [];
  const alunosAtivos = new Set(daSemana.map((h) => h.alunoId)).size;

  return (
    <Tela aoAtualizar={recarregar} atualizando={atualizando}>
      <TituloGrande
        sobretitulo={`${saudacao()},`}
        titulo={primeiroNome}
        direita={
          <Pressable
            onPress={() => navigation.navigate("Perfil")}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Avatar nome={perfil.nome} tamanho={48} />
          </Pressable>
        }
      />

      {carregando ? (
        <Carregando />
      ) : erro ? (
        <EstadoVazio
          icone="wifi-off"
          titulo="Não foi possível carregar"
          descricao={erro}
          acao={{
            titulo: "Tentar novamente",
            icone: "refresh-cw",
            onPress: recarregar,
          }}
        />
      ) : (
        <>
          <View style={estilos.resumo}>
            <LinearGradient
              colors={gradientes.destaque}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={estilos.resumoTopo}>
              <Selo texto="Painel do personal" icone="clipboard-list" />
              <Icone nome="activity" tamanho={22} cor={cores.primariaClara} />
            </View>
            <Texto variante="titulo2" estilo={estilos.resumoTitulo}>
              {daSemana.length === 0
                ? "Nenhum treino concluído esta semana ainda."
                : `Seus alunos concluíram ${daSemana.length} ${daSemana.length === 1 ? "treino" : "treinos"} esta semana.`}
            </Texto>
            <Texto variante="legenda" cor="textoSecundario">
              {alunosAtivos} de {dados.alunos.length}{" "}
              {dados.alunos.length === 1 ? "aluno treinou" : "alunos treinaram"}{" "}
              nesta semana
            </Texto>
            <View style={estilos.resumoBotoes}>
              <Botao
                titulo="Novo treino"
                icone="plus"
                tamanho="sm"
                onPress={() => navigation.navigate("FormTreino")}
                estilo={estilos.flex}
              />
              <Botao
                titulo="Ver alunos"
                icone="users"
                tamanho="sm"
                variante="secundario"
                onPress={() => navigation.navigate("Alunos")}
                estilo={estilos.flex}
              />
            </View>
          </View>

          <View style={estilos.estatisticas}>
            <CartaoEstatistica
              icone="users"
              valor={dados.alunos.length}
              rotulo="Alunos"
            />
            <CartaoEstatistica
              icone="dumbbell"
              valor={dados.treinos.length}
              rotulo="Treinos ativos"
              cor={cores.ciano}
            />
            <CartaoEstatistica
              icone="flame"
              valor={daSemana.length}
              rotulo="Na semana"
              cor="#FBBF24"
            />
          </View>

          {dados.alunos.length === 0 && (
            <View style={estilos.convite}>
              <CartaoConvite codigo={perfil.codigoConvite} />
            </View>
          )}

          <CabecalhoSecao
            titulo="Atividade recente"
            acao={dados.historico.length ? "Ver alunos" : undefined}
            onAcao={() => navigation.navigate("Alunos")}
          />
          {dados.historico.length === 0 ? (
            <EstadoVazio
              icone="activity"
              titulo="Sem atividade por enquanto"
              descricao="Quando seus alunos concluírem treinos, eles aparecem aqui em tempo real."
            />
          ) : (
            <View style={estilos.lista}>
              {dados.historico.slice(0, 6).map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() =>
                    h.aluno &&
                    navigation.navigate("DetalheAluno", { alunoId: h.alunoId })
                  }
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    estilos.atividade,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Avatar nome={h.aluno?.nome ?? "?"} tamanho={42} />
                  <View style={estilos.flex}>
                    <Texto variante="legenda" cor="textoSecundario">
                      <Texto variante="legendaForte">
                        {h.aluno?.nome.split(" ")[0] ?? "Aluno"}
                      </Texto>{" "}
                      concluiu
                    </Texto>
                    <Texto variante="corpoForte" numberOfLines={1}>
                      {h.nomeTreino}
                    </Texto>
                    <Texto variante="legenda" cor="textoSecundario">
                      {obterGrupo(h.grupoMuscular).nome} ·{" "}
                      {formatarDuracao(h.duracaoSegundos)}
                    </Texto>
                  </View>
                  <Texto
                    variante="pequeno"
                    cor="textoTerciario"
                    estilo={estilos.quando}
                  >
                    {formatarRelativo(h.concluidoEm)}
                  </Texto>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </Tela>
  );
}

function Carregando() {
  return (
    <View style={{ gap: espaco.lg }}>
      <Esqueleto altura={188} raio={raio.xl} />
      <View style={estilos.estatisticas}>
        <Esqueleto altura={104} raio={raio.lg} estilo={estilos.flex} />
        <Esqueleto altura={104} raio={raio.lg} estilo={estilos.flex} />
        <Esqueleto altura={104} raio={raio.lg} estilo={estilos.flex} />
      </View>
      <Esqueleto altura={20} largura="45%" />
      <Esqueleto altura={64} raio={raio.lg} />
      <Esqueleto altura={64} raio={raio.lg} />
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  resumo: {
    borderRadius: raio.xl,
    overflow: "hidden",
    padding: espaco.xl,
    borderWidth: 1,
    borderColor: cores.bordaForte,
  },
  resumoTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resumoTitulo: { marginTop: espaco.lg, marginBottom: espaco.xs },
  resumoBotoes: { flexDirection: "row", gap: espaco.md, marginTop: espaco.lg },
  estatisticas: { flexDirection: "row", gap: espaco.md, marginTop: espaco.lg },
  convite: { marginTop: espaco.xxl },
  lista: { gap: espaco.sm },
  quando: { alignSelf: "flex-start", marginTop: 2 },
  atividade: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
});
