import { Pressable, StyleSheet, View } from "react-native";

import {
  Avatar,
  Botao,
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
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { fraseDoDia } from "../../data/catalogo";
import { useDados } from "../../hooks/useDados";
import { useVincularPersonal } from "../../hooks/useVincularPersonal";
import { api } from "../../services/api";
import { cores, espaco, raio } from "../../theme";
import { formatarRelativo, saudacao } from "../../utils/datas";
import {
  minutosTotais,
  naSemana,
  sugerirProximoTreino,
} from "../../utils/estatisticas";

export default function InicioAluno({ navigation }) {
  const { perfil } = useAuth();
  const vincular = useVincularPersonal();
  const { dados, carregando, atualizando, erro, recarregar } =
    useDados(async () => {
      const [treinos, historico, personal] = await Promise.all([
        api.listarTreinosDoAluno(perfil.id),
        api.listarHistorico({ alunoId: perfil.id }),
        api.obterPessoa(perfil.personalId),
      ]);
      return { treinos, historico, personal };
    }, [perfil.id, perfil.personalId]);

  const primeiroNome = perfil.nome.split(" ")[0];
  const frase = fraseDoDia();
  const semana = dados ? naSemana(dados.historico) : [];
  const proximo = dados
    ? sugerirProximoTreino(dados.treinos, dados.historico)
    : null;
  const ultimaVez = proximo
    ? dados.historico.find((h) => h.treinoId === proximo.id)
    : null;

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
        <View style={{ gap: espaco.lg }}>
          <Esqueleto altura={96} raio={raio.lg} />
          <Esqueleto altura={210} raio={raio.xl} />
          <Esqueleto altura={104} raio={raio.lg} />
        </View>
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
          <Cartao>
            <View style={estilos.semanaTopo}>
              <Texto variante="corpoForte">Sua semana</Texto>
              <Texto
                variante="legendaForte"
                cor={semana.length ? "primariaClara" : "textoTerciario"}
              >
                {semana.length} {semana.length === 1 ? "treino" : "treinos"}
              </Texto>
            </View>
            <FaixaSemana historico={dados.historico} />
          </Cartao>

          <CabecalhoSecao
            titulo={proximo ? "Próximo treino" : "Seus treinos"}
            acao={dados.treinos.length > 1 ? "Ver todos" : undefined}
            onAcao={() => navigation.navigate("Treinos")}
          />
          {proximo ? (
            <CartaoTreino
              variante="destaque"
              treino={proximo}
              subtitulo={
                ultimaVez
                  ? `Última vez ${formatarRelativo(ultimaVez.concluidoEm)}`
                  : "Ainda não realizado"
              }
              onPress={() =>
                navigation.navigate("DetalheTreino", { treino: proximo })
              }
              acao={
                <Botao
                  titulo="Começar treino"
                  icone="play"
                  tamanho="sm"
                  larguraTotal={false}
                  onPress={() =>
                    navigation.navigate("TreinoEmAndamento", {
                      treino: proximo,
                    })
                  }
                />
              }
            />
          ) : (
            <Cartao>
              <EstadoVazio
                icone="clipboard-list"
                titulo={
                  perfil.personalId
                    ? "Nenhum treino ainda"
                    : "Vincule-se ao seu personal"
                }
                descricao={
                  perfil.personalId
                    ? "Assim que seu personal montar seus treinos, eles aparecem aqui."
                    : "Com o código do seu personal, você recebe os treinos montados para você."
                }
                acao={
                  perfil.personalId
                    ? undefined
                    : {
                        titulo: "Usar código",
                        icone: "ticket",
                        onPress: vincular,
                      }
                }
              />
            </Cartao>
          )}

          <View style={estilos.estatisticas}>
            <CartaoEstatistica
              icone="flame"
              valor={semana.length}
              rotulo="Na semana"
              cor="#FBBF24"
            />
            <CartaoEstatistica
              icone="timer"
              valor={`${minutosTotais(semana)}`}
              rotulo="Min. na semana"
              cor={cores.ciano}
            />
            <CartaoEstatistica
              icone="trophy"
              valor={dados.historico.length}
              rotulo="Total"
            />
          </View>

          {dados.personal && (
            <>
              <CabecalhoSecao titulo="Seu personal" />
              <Cartao estilo={estilos.personal}>
                <Avatar nome={dados.personal.nome} tamanho={46} />
                <View style={estilos.flex}>
                  <Texto variante="corpoForte">{dados.personal.nome}</Texto>
                  <Texto variante="legenda" cor="textoSecundario">
                    Personal trainer · {dados.treinos.length}{" "}
                    {dados.treinos.length === 1 ? "treino" : "treinos"} para
                    você
                  </Texto>
                </View>
                <Icone
                  nome="badge-check"
                  tamanho={22}
                  cor={cores.primariaClara}
                />
              </Cartao>
            </>
          )}

          <View
            style={estilos.frase}
            accessible
            accessibilityLabel={`Frase do dia: ${frase.texto}, ${frase.autor}`}
          >
            <Icone nome="quote" tamanho={22} cor={cores.primariaClara} />
            <Texto variante="corpoForte" estilo={estilos.fraseTexto}>
              {frase.texto}
            </Texto>
            <Texto variante="legenda" cor="textoSecundario">
              — {frase.autor}
            </Texto>
          </View>
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  semanaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: espaco.md,
  },
  estatisticas: { flexDirection: "row", gap: espaco.md, marginTop: espaco.lg },
  personal: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  frase: {
    marginTop: espaco.xxl,
    padding: espaco.xl,
    borderRadius: raio.xl,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundoElevado,
    gap: espaco.sm,
  },
  fraseTexto: { fontSize: 16, lineHeight: 24 },
});
