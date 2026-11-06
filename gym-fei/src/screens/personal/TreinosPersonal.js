import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  BotaoIcone,
  CampoTexto,
  CartaoTreino,
  Chip,
  Esqueleto,
  EstadoVazio,
  Tela,
  TituloGrande,
} from "../../components";
import { useAuth } from "../../context/AuthContext";
import { GRUPOS_MUSCULARES } from "../../data/catalogo";
import { useDados } from "../../hooks/useDados";
import { api } from "../../services/api";
import { espaco, margemTela, raio } from "../../theme";

export default function TreinosPersonal({ navigation }) {
  const { perfil } = useAuth();
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState(null);

  const { dados, carregando, atualizando, erro, recarregar } =
    useDados(async () => {
      const [ativos, excluidos] = await Promise.all([
        api.listarTreinosDoPersonal(perfil.id),
        api.listarTreinosDoPersonal(perfil.id, { deletados: true }),
      ]);
      return { ativos, totalExcluidos: excluidos.length };
    }, [perfil.id]);

  const termo = busca.trim().toLowerCase();
  const filtrados = (dados?.ativos ?? []).filter(
    (t) =>
      (!grupo || t.grupoMuscular === grupo) &&
      (!termo ||
        t.nome.toLowerCase().includes(termo) ||
        t.aluno?.nome.toLowerCase().includes(termo))
  );
  const total = dados?.ativos.length ?? 0;

  return (
    <Tela aoAtualizar={recarregar} atualizando={atualizando}>
      <TituloGrande
        titulo="Treinos"
        subtitulo={
          carregando
            ? " "
            : `${total} ${total === 1 ? "treino ativo" : "treinos ativos"}`
        }
        direita={
          <BotaoIcone
            icone="trash-2"
            rotulo={`Lixeira, ${dados?.totalExcluidos ?? 0} itens`}
            contador={dados?.totalExcluidos}
            onPress={() => navigation.navigate("Lixeira")}
          />
        }
      />

      {carregando ? (
        <View style={estilos.lista}>
          {[0, 1, 2, 3].map((i) => (
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
          icone="clipboard-plus"
          titulo="Nenhum treino criado"
          descricao="Monte treinos com séries, cargas e descanso para cada aluno."
          acao={{
            titulo: "Criar primeiro treino",
            icone: "plus",
            onPress: () => navigation.navigate("FormTreino"),
          }}
        />
      ) : (
        <>
          <CampoTexto
            icone="search"
            placeholder="Buscar por treino ou aluno"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar treino"
            estilo={estilos.busca}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={estilos.filtros}
            contentContainerStyle={estilos.filtrosConteudo}
          >
            <Chip
              rotulo="Todos"
              selecionado={!grupo}
              onPress={() => setGrupo(null)}
            />
            {GRUPOS_MUSCULARES.map((g) => (
              <Chip
                key={g.id}
                rotulo={g.nome}
                selecionado={grupo === g.id}
                onPress={() => setGrupo(grupo === g.id ? null : g.id)}
              />
            ))}
          </ScrollView>

          {filtrados.length === 0 ? (
            <EstadoVazio
              icone="search-x"
              titulo="Nada por aqui"
              descricao="Nenhum treino corresponde aos filtros escolhidos."
            />
          ) : (
            <View style={estilos.lista}>
              {filtrados.map((t) => (
                <CartaoTreino
                  key={t.id}
                  treino={t}
                  subtitulo={
                    t.aluno ? `Aluno: ${t.aluno.nome}` : "Aluno desvinculado"
                  }
                  onPress={() =>
                    navigation.navigate("FormTreino", { treinoId: t.id })
                  }
                />
              ))}
            </View>
          )}
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: espaco.sm },
  busca: { marginBottom: espaco.md },
  filtros: {
    marginHorizontal: -margemTela,
    marginBottom: espaco.lg,
    flexGrow: 0,
  },
  filtrosConteudo: { paddingHorizontal: margemTela, gap: espaco.sm },
});
