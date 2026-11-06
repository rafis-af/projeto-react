import { StyleSheet, View } from "react-native";

import {
  CartaoTreino,
  Esqueleto,
  EstadoVazio,
  Tela,
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useDados } from "../../hooks/useDados";
import { useVincularPersonal } from "../../hooks/useVincularPersonal";
import { api } from "../../services/api";
import { espaco, raio } from "../../theme";
import { formatarRelativo } from "../../utils/datas";

export default function MeusTreinos({ navigation }) {
  const { perfil } = useAuth();
  const vincular = useVincularPersonal();
  const { dados, carregando, atualizando, erro, recarregar } =
    useDados(async () => {
      const [treinos, historico] = await Promise.all([
        api.listarTreinosDoAluno(perfil.id),
        api.listarHistorico({ alunoId: perfil.id }),
      ]);
      return { treinos, historico };
    }, [perfil.id, perfil.personalId]);

  const total = dados?.treinos.length ?? 0;

  return (
    <Tela aoAtualizar={recarregar} atualizando={atualizando}>
      <TituloGrande
        titulo="Meus treinos"
        subtitulo={
          carregando
            ? " "
            : total
              ? `${total} ${total === 1 ? "treino no seu plano" : "treinos no seu plano"}`
              : undefined
        }
      />

      {carregando ? (
        <View style={estilos.lista}>
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} altura={94} raio={raio.lg} />
          ))}
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
      ) : total === 0 ? (
        <EstadoVazio
          icone="clipboard-list"
          titulo="Seu plano está vazio"
          descricao={
            perfil.personalId
              ? "Seu personal ainda não montou treinos para você. Puxe para atualizar mais tarde."
              : "Vincule-se ao seu personal com o código dele para receber os treinos."
          }
          acao={
            perfil.personalId
              ? undefined
              : { titulo: "Usar código", icone: "ticket", onPress: vincular }
          }
        />
      ) : (
        <View style={estilos.lista}>
          {dados.treinos.map((t) => {
            const ultima = dados.historico.find((h) => h.treinoId === t.id);
            return (
              <CartaoTreino
                key={t.id}
                treino={t}
                subtitulo={
                  ultima
                    ? `Feito ${formatarRelativo(ultima.concluidoEm)}`
                    : "Ainda não realizado"
                }
                onPress={() =>
                  navigation.navigate("DetalheTreino", { treino: t })
                }
              />
            );
          })}
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: espaco.sm },
});
