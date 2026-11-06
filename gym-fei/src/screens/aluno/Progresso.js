import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Botao,
  CabecalhoSecao,
  Cartao,
  CartaoEstatistica,
  Esqueleto,
  EstadoVazio,
  GraficoBarras,
  Icone,
  MapaMuscular,
  Tela,
  Texto,
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { obterGrupo } from "../../data/catalogo";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { cores, espaco, raio } from "../../theme";
import {
  formatarDataCurta,
  formatarDuracao,
  formatarHora,
} from "../../utils/datas";
import {
  minutosTotais,
  naSemana,
  porGrupo,
  porSemana,
  sequenciaDeSemanas,
} from "../../utils/estatisticas";

export default function Progresso({ navigation }) {
  const { perfil } = useAuth();
  const [mostrarTudo, setMostrarTudo] = useState(false);
  const {
    dados: historico,
    carregando,
    atualizando,
    erro,
    recarregar,
  } = useDados(() => api.listarHistorico({ alunoId: perfil.id }), [perfil.id]);

  if (carregando) {
    return (
      <Tela>
        <TituloGrande titulo="Progresso" />
        <View style={{ gap: espaco.lg }}>
          <Esqueleto altura={104} raio={raio.lg} />
          <Esqueleto altura={230} raio={raio.lg} />
          <Esqueleto altura={180} raio={raio.lg} />
        </View>
      </Tela>
    );
  }

  if (erro) {
    return (
      <Tela>
        <TituloGrande titulo="Progresso" />
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
      </Tela>
    );
  }

  if (!historico.length) {
    return (
      <Tela>
        <TituloGrande titulo="Progresso" />
        <EstadoVazio
          icone="chart-column"
          titulo="Sua evolução começa no primeiro treino"
          descricao="Conclua um treino e acompanhe aqui sua frequência, tempo treinado e grupos mais trabalhados."
          acao={{
            titulo: "Ver meus treinos",
            icone: "dumbbell",
            onPress: () => navigation.navigate("Treinos"),
          }}
        />
      </Tela>
    );
  }

  const semanas = porSemana(historico, 8);
  const grupos = porGrupo(historico).filter((g) => g.total > 0);
  const horas = minutosTotais(historico) / 60;
  const lista = mostrarTudo ? historico : historico.slice(0, 6);

  return (
    <Tela aoAtualizar={recarregar} atualizando={atualizando}>
      <TituloGrande
        titulo="Progresso"
        subtitulo="Sua constância, semana a semana."
      />

      <View style={estilos.grade}>
        <CartaoEstatistica
          icone="trophy"
          valor={historico.length}
          rotulo="Treinos feitos"
        />
        <CartaoEstatistica
          icone="flame"
          valor={naSemana(historico).length}
          rotulo="Nesta semana"
          cor="#FBBF24"
        />
      </View>
      <View style={[estilos.grade, { marginTop: espaco.md }]}>
        <CartaoEstatistica
          icone="clock"
          valor={
            horas >= 1
              ? `${horas.toFixed(1).replace(".", ",")}h`
              : `${minutosTotais(historico)}min`
          }
          rotulo="Tempo treinado"
          cor={cores.ciano}
        />
        <CartaoEstatistica
          icone="zap"
          valor={sequenciaDeSemanas(historico)}
          rotulo="Semanas seguidas"
          cor="#4ADE80"
        />
      </View>

      <CabecalhoSecao titulo="Treinos por semana" />
      <Cartao>
        <GraficoBarras
          dados={semanas.map((s, i) => ({
            chave: s.inicio.toISOString(),
            rotulo:
              i === semanas.length - 1
                ? "Atual"
                : `${s.inicio.getDate()}/${s.inicio.getMonth() + 1}`,
            valor: s.total,
            destaque: i === semanas.length - 1,
          }))}
        />
      </Cartao>

      <CabecalhoSecao titulo="Grupos mais treinados" />
      <Cartao estilo={estilos.grupos}>
        {grupos.map(({ grupo, total, percentual }) => (
          <View
            key={grupo.id}
            style={estilos.grupo}
            accessible
            accessibilityLabel={`${grupo.nome}: ${total} treinos, ${percentual}%`}
          >
            <View style={estilos.grupoMapa}>
              <MapaMuscular
                grupo={grupo.id}
                enquadramento="foco"
                largura={40}
                altura={40}
              />
            </View>
            <View style={estilos.flex}>
              <View style={estilos.grupoTopo}>
                <Texto variante="corpoForte">{grupo.nome}</Texto>
                <Texto variante="legendaForte" cor="textoSecundario">
                  {total} · {percentual}%
                </Texto>
              </View>
              <View style={estilos.barraFundo}>
                <View
                  style={[
                    estilos.barraValor,
                    { width: `${Math.max(4, percentual)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </Cartao>

      <CabecalhoSecao titulo="Histórico" />
      <View style={estilos.lista}>
        {lista.map((h) => (
          <View key={h.id} style={estilos.item}>
            <View style={estilos.itemIcone}>
              <Icone nome="circle-check-big" tamanho={18} cor="#4ADE80" />
            </View>
            <View style={estilos.flex}>
              <Texto variante="corpoForte" numberOfLines={1}>
                {h.nomeTreino}
              </Texto>
              <Texto variante="legenda" cor="textoSecundario">
                {formatarDataCurta(h.concluidoEm)},{" "}
                {formatarHora(h.concluidoEm)} ·{" "}
                {formatarDuracao(h.duracaoSegundos)} · {h.seriesConcluidas}/
                {h.totalSeries} séries
              </Texto>
            </View>
            <Texto variante="pequeno" cor="textoTerciario">
              {obterGrupo(h.grupoMuscular).nome.toUpperCase()}
            </Texto>
          </View>
        ))}
      </View>
      {historico.length > 6 && (
        <Botao
          titulo={
            mostrarTudo ? "Mostrar menos" : `Ver todos (${historico.length})`
          }
          variante="fantasma"
          icone={mostrarTudo ? "chevron-up" : "chevron-down"}
          onPress={() => setMostrarTudo((v) => !v)}
          estilo={estilos.verTudo}
        />
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  grade: { flexDirection: "row", gap: espaco.md },
  grupos: { gap: espaco.lg },
  grupo: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  grupoMapa: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0B1630",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  grupoTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barraFundo: {
    height: 8,
    borderRadius: 4,
    backgroundColor: cores.superficie3,
    overflow: "hidden",
  },
  barraValor: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: cores.primaria,
  },
  lista: { gap: 0 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  itemIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.sucessoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  verTudo: { marginTop: espaco.sm },
});
