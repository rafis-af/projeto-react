import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { obterGrupo } from "../data/catalogo";
import { cores, espaco, fontes, margemTela, raio } from "../theme";
import { vibrarSelecao } from "../utils/feedback";
import { novoExercicio } from "../utils/treino";
import { BotaoIcone } from "./Botao";
import Chip from "./Chip";
import Icone from "./Icone";
import Texto from "./Texto";

// Montagem da lista de exercícios: sugestões em um toque, contadores para
// séries/descanso (menos digitação) e reordenação.
export default function EditorExercicios({ exercicios, aoMudar, grupo, erro }) {
  const [idParaFocar, setIdParaFocar] = useState(null);
  const sugestoes = grupo
    ? obterGrupo(grupo).sugestoes.filter(
        (s) =>
          !exercicios.some(
            (ex) => ex.nome.trim().toLowerCase() === s.toLowerCase()
          )
      )
    : [];

  const adicionar = (nome = "") => {
    const novo = novoExercicio(nome);
    aoMudar([...exercicios, novo]);
    if (!nome) setIdParaFocar(novo.id);
  };
  const alterar = (id, campos) =>
    aoMudar(exercicios.map((ex) => (ex.id === id ? { ...ex, ...campos } : ex)));
  const remover = (id) => aoMudar(exercicios.filter((ex) => ex.id !== id));
  const mover = (indice, direcao) => {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= exercicios.length) return;
    const lista = [...exercicios];
    [lista[indice], lista[alvo]] = [lista[alvo], lista[indice]];
    vibrarSelecao();
    aoMudar(lista);
  };

  return (
    <View>
      {grupo ? (
        sugestoes.length > 0 && (
          <View style={estilos.sugestoes}>
            <Texto
              variante="legendaForte"
              cor="textoSecundario"
              estilo={estilos.sugestoesTitulo}
            >
              Toque para adicionar · {obterGrupo(grupo).nome}
            </Texto>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={estilos.sugestoesRolagem}
              contentContainerStyle={estilos.sugestoesConteudo}
            >
              {sugestoes.map((s) => (
                <Chip
                  key={s}
                  rotulo={s}
                  icone="plus"
                  onPress={() => adicionar(s)}
                />
              ))}
            </ScrollView>
          </View>
        )
      ) : (
        <View style={estilos.dica}>
          <Icone nome="lightbulb" tamanho={16} cor={cores.textoSecundario} />
          <Texto variante="legenda" cor="textoSecundario" estilo={estilos.flex}>
            Escolha o grupo muscular acima para ver sugestões de exercícios.
          </Texto>
        </View>
      )}

      {exercicios.map((ex, indice) => (
        <ItemExercicio
          key={ex.id}
          exercicio={ex}
          indice={indice}
          total={exercicios.length}
          focar={idParaFocar === ex.id}
          aoAlterar={(campos) => alterar(ex.id, campos)}
          aoRemover={() => remover(ex.id)}
          aoMover={(direcao) => mover(indice, direcao)}
        />
      ))}

      <Pressable
        onPress={() => adicionar()}
        accessibilityRole="button"
        accessibilityLabel="Adicionar exercício"
        style={({ pressed }) => [
          estilos.adicionar,
          !!erro && estilos.adicionarErro,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Icone nome="plus" tamanho={18} cor={cores.primariaClara} />
        <Texto variante="corpoForte" cor="primariaClara">
          Adicionar exercício
        </Texto>
      </Pressable>

      {!!erro && (
        <View style={estilos.linhaErro} accessibilityLiveRegion="polite">
          <Icone nome="circle-alert" tamanho={14} cor="#F87171" />
          <Texto variante="legenda" cor="#F87171">
            {erro}
          </Texto>
        </View>
      )}
    </View>
  );
}

function ItemExercicio({
  exercicio,
  indice,
  total,
  focar,
  aoAlterar,
  aoRemover,
  aoMover,
}) {
  return (
    <View style={estilos.item}>
      <View style={estilos.itemTopo}>
        <View style={estilos.numero}>
          <Texto variante="legendaForte" cor="primariaClara">
            {indice + 1}
          </Texto>
        </View>
        <TextInput
          value={exercicio.nome}
          onChangeText={(nome) => aoAlterar({ nome })}
          placeholder="Nome do exercício"
          placeholderTextColor={cores.textoTerciario}
          selectionColor={cores.primariaClara}
          autoFocus={focar}
          autoCapitalize="sentences"
          accessibilityLabel={`Nome do exercício ${indice + 1}`}
          maxFontSizeMultiplier={1.3}
          style={estilos.nome}
        />
        {total > 1 && (
          <>
            <BotaoIcone
              icone="chevron-up"
              rotulo="Mover para cima"
              tamanho={34}
              tamanhoIcone={18}
              variante="transparente"
              desabilitado={indice === 0}
              onPress={() => aoMover(-1)}
            />
            <BotaoIcone
              icone="chevron-down"
              rotulo="Mover para baixo"
              tamanho={34}
              tamanhoIcone={18}
              variante="transparente"
              desabilitado={indice === total - 1}
              onPress={() => aoMover(1)}
            />
          </>
        )}
        <BotaoIcone
          icone="trash-2"
          rotulo="Remover exercício"
          tamanho={34}
          tamanhoIcone={16}
          variante="perigo"
          onPress={aoRemover}
        />
      </View>

      <View style={estilos.linhaCampos}>
        <Contador
          rotulo="Séries"
          valor={exercicio.series}
          passo={1}
          minimo={1}
          maximo={20}
          aoMudar={(series) => aoAlterar({ series })}
        />
        <Contador
          rotulo="Descanso"
          valor={exercicio.descanso}
          passo={15}
          minimo={0}
          maximo={600}
          sufixo="s"
          aoMudar={(descanso) => aoAlterar({ descanso })}
        />
      </View>
      <View style={estilos.linhaCampos}>
        <CampoMini
          rotulo="Repetições"
          value={String(exercicio.repeticoes ?? "")}
          onChangeText={(repeticoes) => aoAlterar({ repeticoes })}
          placeholder="12"
          keyboardType={Platform.select({
            ios: "numbers-and-punctuation",
            default: "default",
          })}
          maxLength={12}
        />
        <CampoMini
          rotulo="Carga (kg)"
          value={String(exercicio.carga ?? "")}
          onChangeText={(carga) => aoAlterar({ carga })}
          placeholder="opcional"
          keyboardType="decimal-pad"
          maxLength={8}
        />
      </View>
    </View>
  );
}

function Contador({
  rotulo,
  valor,
  passo,
  minimo,
  maximo,
  sufixo = "",
  aoMudar,
}) {
  const n = Number(valor) || 0;
  const diminuir = () => aoMudar(Math.max(minimo, n - passo));
  const aumentar = () => aoMudar(Math.min(maximo, n + passo));
  return (
    <View style={estilos.campoMini}>
      <Texto
        variante="pequeno"
        cor="textoTerciario"
        estilo={estilos.rotuloMini}
      >
        {rotulo}
      </Texto>
      <View style={estilos.contador}>
        <Pressable
          onPress={diminuir}
          hitSlop={8}
          disabled={n <= minimo}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir ${rotulo.toLowerCase()}, atual ${n}${sufixo}`}
          aria-disabled={n <= minimo}
          style={estilos.contadorBotao}
        >
          <Icone
            nome="minus"
            tamanho={16}
            cor={n <= minimo ? cores.textoTerciario : cores.texto}
          />
        </Pressable>
        <Texto
          variante="corpoForte"
          estilo={estilos.contadorValor}
          accessibilityLiveRegion="polite"
        >
          {n}
          {sufixo}
        </Texto>
        <Pressable
          onPress={aumentar}
          hitSlop={8}
          disabled={n >= maximo}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${rotulo.toLowerCase()}, atual ${n}${sufixo}`}
          aria-disabled={n >= maximo}
          style={estilos.contadorBotao}
        >
          <Icone
            nome="plus"
            tamanho={16}
            cor={n >= maximo ? cores.textoTerciario : cores.texto}
          />
        </Pressable>
      </View>
    </View>
  );
}

function CampoMini({ rotulo, ...props }) {
  const [focado, setFocado] = useState(false);
  return (
    <View style={estilos.campoMini}>
      <Texto
        variante="pequeno"
        cor="textoTerciario"
        estilo={estilos.rotuloMini}
      >
        {rotulo}
      </Texto>
      <TextInput
        {...props}
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoTerciario}
        selectionColor={cores.primariaClara}
        maxFontSizeMultiplier={1.3}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={[estilos.inputMini, focado && estilos.inputMiniFocado]}
      />
    </View>
  );
}

const semContorno = Platform.select({
  web: { outlineStyle: "none", outlineWidth: 0 },
});

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  sugestoes: { marginBottom: espaco.md },
  sugestoesTitulo: { marginBottom: espaco.sm },
  sugestoesRolagem: { marginHorizontal: -margemTela },
  sugestoesConteudo: { paddingHorizontal: margemTela, gap: espaco.sm },
  dica: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    marginBottom: espaco.md,
  },
  item: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
    marginBottom: espaco.md,
    gap: espaco.md,
  },
  itemTopo: { flexDirection: "row", alignItems: "center", gap: espaco.xs },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: espaco.xs,
  },
  nome: {
    flex: 1,
    minHeight: 40,
    color: cores.texto,
    fontFamily: fontes.semibold,
    fontSize: 16,
    paddingVertical: 4,
    ...semContorno,
  },
  linhaCampos: { flexDirection: "row", gap: espaco.md },
  campoMini: { flex: 1, gap: 6 },
  rotuloMini: { textTransform: "uppercase", letterSpacing: 0.8 },
  contador: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: raio.sm,
    backgroundColor: cores.superficie2,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 4,
  },
  contadorBotao: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  contadorValor: { fontVariant: ["tabular-nums"] },
  inputMini: {
    height: 44,
    borderRadius: raio.sm,
    backgroundColor: cores.superficie2,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espaco.md,
    color: cores.texto,
    fontFamily: fontes.semibold,
    fontSize: 15,
    ...semContorno,
  },
  inputMiniFocado: { borderColor: cores.primaria },
  adicionar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaco.sm,
    borderRadius: raio.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: cores.bordaForte,
  },
  adicionarErro: { borderColor: "rgba(239, 68, 68, 0.6)" },
  linhaErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: espaco.sm,
  },
});
