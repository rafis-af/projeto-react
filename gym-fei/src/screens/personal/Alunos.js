import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  Avatar,
  CampoTexto,
  Cartao,
  CartaoConvite,
  Esqueleto,
  EstadoVazio,
  Icone,
  Tela,
  Texto,
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { cores, espaco, raio } from "../../theme";
import { formatarRelativo } from "../../utils/datas";

const normalizar = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Alunos({ navigation }) {
  const { perfil } = useAuth();
  const [busca, setBusca] = useState("");
  const {
    dados: alunos,
    carregando,
    atualizando,
    erro,
    recarregar,
  } = useDados(() => api.listarAlunos(perfil.id), [perfil.id]);

  const filtrados = (alunos ?? []).filter((a) =>
    normalizar(a.nome).includes(normalizar(busca.trim()))
  );
  const total = alunos?.length ?? 0;

  return (
    <Tela aoAtualizar={recarregar} atualizando={atualizando}>
      <TituloGrande
        titulo="Alunos"
        subtitulo={
          carregando
            ? " "
            : total === 0
              ? "Nenhum aluno vinculado"
              : `${total} ${total === 1 ? "aluno vinculado" : "alunos vinculados"}`
        }
      />

      {carregando ? (
        <View style={estilos.lista}>
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} altura={76} raio={raio.lg} />
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
        <>
          <EstadoVazio
            icone="users"
            titulo="Seus alunos aparecem aqui"
            descricao="Compartilhe o seu código. Quando o aluno criar a conta com ele, entra direto nesta lista."
          />
          <CartaoConvite codigo={perfil.codigoConvite} />
        </>
      ) : (
        <>
          {total > 3 && (
            <CampoTexto
              icone="search"
              placeholder="Buscar aluno pelo nome"
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar aluno"
            />
          )}

          {filtrados.length === 0 ? (
            <EstadoVazio
              icone="search-x"
              titulo="Ninguém encontrado"
              descricao={`Nenhum aluno com "${busca}".`}
            />
          ) : (
            <View style={estilos.lista}>
              {filtrados.map((aluno) => (
                <Cartao
                  key={aluno.id}
                  onPress={() =>
                    navigation.navigate("DetalheAluno", { alunoId: aluno.id })
                  }
                  rotuloAcessivel={`${aluno.nome}, ${aluno.totalTreinos} treinos`}
                  estilo={estilos.item}
                >
                  <Avatar nome={aluno.nome} tamanho={46} />
                  <View style={estilos.flex}>
                    <Texto variante="corpoForte" numberOfLines={1}>
                      {aluno.nome}
                    </Texto>
                    <View style={estilos.metas}>
                      <Icone
                        nome="dumbbell"
                        tamanho={13}
                        cor={cores.textoSecundario}
                      />
                      <Texto variante="legenda" cor="textoSecundario">
                        {aluno.totalTreinos}{" "}
                        {aluno.totalTreinos === 1 ? "treino" : "treinos"}
                      </Texto>
                      <Texto variante="legenda" cor="textoTerciario">
                        ·
                      </Texto>
                      <Texto
                        variante="legenda"
                        cor={
                          aluno.ultimoTreinoEm
                            ? "textoSecundario"
                            : "textoTerciario"
                        }
                      >
                        {aluno.ultimoTreinoEm
                          ? `treinou ${formatarRelativo(aluno.ultimoTreinoEm)}`
                          : "ainda não treinou"}
                      </Texto>
                    </View>
                  </View>
                  <Icone
                    nome="chevron-right"
                    tamanho={20}
                    cor={cores.textoTerciario}
                  />
                </Cartao>
              ))}
            </View>
          )}

          <View style={estilos.convite}>
            <CartaoConvite codigo={perfil.codigoConvite} />
          </View>
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1, gap: 3 },
  lista: { gap: espaco.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingVertical: espaco.md,
  },
  metas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  convite: { marginTop: espaco.xxl },
});
