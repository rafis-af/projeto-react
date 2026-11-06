import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Botao,
  Cabecalho,
  CartaoTreino,
  Esqueleto,
  EstadoVazio,
  Icone,
  Tela,
  Texto,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { traduzirErro } from "../../services/erros";
import { cores, espaco, raio } from "../../theme";
import { formatarRelativo } from "../../utils/datas";

export default function Lixeira() {
  const { perfil } = useAuth();
  const { toast, confirmar } = useFeedback();
  const [ocupado, setOcupado] = useState(null);
  const {
    dados: treinos,
    carregando,
    atualizando,
    erro,
    recarregar,
    definirDados,
  } = useDados(
    () => api.listarTreinosDoPersonal(perfil.id, { deletados: true }),
    [perfil.id]
  );

  const tirarDaLista = (id) =>
    definirDados((lista) => lista.filter((t) => t.id !== id));

  const restaurar = async (treino) => {
    setOcupado(treino.id);
    try {
      await api.restaurarTreino(treino.id);
      tirarDaLista(treino.id);
      toast("Treino restaurado!");
    } catch (e) {
      toast(traduzirErro(e), "erro");
    } finally {
      setOcupado(null);
    }
  };

  const apagar = async (treino) => {
    const ok = await confirmar({
      titulo: "Apagar para sempre?",
      mensagem: `"${treino.nome}" será excluído definitivamente. Essa ação não pode ser desfeita.`,
      textoConfirmar: "Apagar",
      perigo: true,
      icone: "trash-2",
    });
    if (!ok) return;
    setOcupado(treino.id);
    try {
      await api.excluirTreinoDefinitivo(treino.id);
      tirarDaLista(treino.id);
      toast("Treino apagado", "info");
    } catch (e) {
      toast(traduzirErro(e), "erro");
    } finally {
      setOcupado(null);
    }
  };

  return (
    <Tela
      cabecalho={<Cabecalho titulo="Lixeira" />}
      aoAtualizar={recarregar}
      atualizando={atualizando}
    >
      <View style={estilos.info}>
        <Icone nome="info" tamanho={16} cor={cores.textoSecundario} />
        <Texto variante="legenda" cor="textoSecundario" estilo={estilos.flex}>
          Treinos excluídos ficam aqui. O aluno não os vê até você restaurar.
        </Texto>
      </View>

      {carregando ? (
        <View style={estilos.lista}>
          {[0, 1].map((i) => (
            <Esqueleto key={i} altura={130} raio={raio.lg} />
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
      ) : treinos.length === 0 ? (
        <EstadoVazio
          icone="trash-2"
          titulo="Lixeira vazia"
          descricao="Nenhum treino excluído por aqui."
        />
      ) : (
        <View style={estilos.lista}>
          {treinos.map((t) => (
            <CartaoTreino
              key={t.id}
              treino={t}
              subtitulo={`${t.aluno ? t.aluno.nome : "Aluno desvinculado"} · excluído ${formatarRelativo(t.deletadoEm)}`}
              acao={<View />}
              rodape={
                <View style={estilos.botoes}>
                  <Botao
                    titulo="Restaurar"
                    icone="rotate-ccw"
                    variante="secundario"
                    tamanho="sm"
                    onPress={() => restaurar(t)}
                    carregando={ocupado === t.id}
                    desabilitado={!t.aluno || (ocupado && ocupado !== t.id)}
                    estilo={estilos.flex}
                  />
                  <Botao
                    titulo="Apagar"
                    icone="trash-2"
                    variante="perigo"
                    tamanho="sm"
                    onPress={() => apagar(t)}
                    desabilitado={!!ocupado}
                    estilo={estilos.flex}
                  />
                </View>
              }
            />
          ))}
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    marginBottom: espaco.lg,
  },
  lista: { gap: espaco.sm },
  botoes: { flexDirection: "row", gap: espaco.sm, marginTop: espaco.md },
});
