import { Pressable, StyleSheet, View } from "react-native";

import {
  Avatar,
  AvisoDemo,
  Botao,
  CabecalhoSecao,
  Cartao,
  CartaoConvite,
  Icone,
  Selo,
  Tela,
  Texto,
  TituloGrande,
} from "../components";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { useDados } from "../hooks/useDados";
import { useVincularPersonal } from "../hooks/useVincularPersonal";
import { MODO_DEMO, VERSAO_APP } from "../lib/config";
import { api } from "../services/api";
import { traduzirErro } from "../services/erros";
import { cores, espaco, raio } from "../theme";
import { formatarDataCompleta } from "../utils/datas";

function Opcao({ icone, titulo, descricao, onPress, perigo = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [
        estilos.opcao,
        pressed && { backgroundColor: cores.superficie2 },
      ]}
    >
      <View
        style={[
          estilos.opcaoIcone,
          perigo && { backgroundColor: cores.perigoSuave },
        ]}
      >
        <Icone
          nome={icone}
          tamanho={18}
          cor={perigo ? "#F87171" : cores.primariaClara}
        />
      </View>
      <View style={estilos.flex}>
        <Texto variante="corpoForte" cor={perigo ? "#F87171" : "texto"}>
          {titulo}
        </Texto>
        {!!descricao && (
          <Texto variante="legenda" cor="textoSecundario">
            {descricao}
          </Texto>
        )}
      </View>
      <Icone nome="chevron-right" tamanho={18} cor={cores.textoTerciario} />
    </Pressable>
  );
}

export default function Perfil() {
  const { perfil, atualizarPerfil, sair } = useAuth();
  const { confirmar, pedirTexto, toast } = useFeedback();
  const vincular = useVincularPersonal();
  const ehPersonal = perfil.tipo === "personal";

  const { dados: personal } = useDados(
    () =>
      ehPersonal ? Promise.resolve(null) : api.obterPessoa(perfil.personalId),
    [perfil.personalId, ehPersonal]
  );

  const editarNome = () =>
    pedirTexto({
      titulo: "Editar nome",
      rotulo: "Nome completo",
      valorInicial: perfil.nome,
      icone: "user-round-pen",
      autoCapitalize: "words",
      maxLength: 80,
      aoConfirmar: async (nome) => {
        if (nome.length < 2) throw new Error("Digite pelo menos 2 letras.");
        atualizarPerfil(await api.atualizarNome(perfil.id, nome));
      },
    }).then((ok) => ok && toast("Nome atualizado!"));

  const desvincular = async () => {
    const ok = await confirmar({
      titulo: "Desvincular do personal?",
      mensagem:
        "Os treinos montados por esse personal deixam de aparecer para você.",
      textoConfirmar: "Desvincular",
      perigo: true,
      icone: "unlink",
    });
    if (!ok) return;
    try {
      atualizarPerfil(await api.desvincularPersonal());
      toast("Vínculo desfeito", "info");
    } catch (e) {
      toast(traduzirErro(e), "erro");
    }
  };

  const restaurarDemo = async () => {
    const ok = await confirmar({
      titulo: "Restaurar dados de exemplo?",
      mensagem:
        "Tudo o que foi criado no modo demonstração será apagado e os dados iniciais voltam.",
      textoConfirmar: "Restaurar",
      perigo: true,
      icone: "rotate-ccw",
    });
    if (!ok) return;
    await api.restaurarDemo();
    toast("Dados de demonstração restaurados", "info");
  };

  const sairDaConta = async () => {
    const ok = await confirmar({
      titulo: "Sair da conta?",
      mensagem: "Você precisará entrar de novo com seu e-mail e senha.",
      textoConfirmar: "Sair",
      perigo: true,
      icone: "log-out",
    });
    if (!ok) return;
    try {
      await sair();
    } catch (e) {
      toast(traduzirErro(e), "erro");
    }
  };

  return (
    <Tela>
      <TituloGrande titulo="Perfil" />

      <Cartao estilo={estilos.cabecalho}>
        <Avatar nome={perfil.nome} tamanho={64} />
        <View style={estilos.flex}>
          <Texto variante="titulo2" numberOfLines={1}>
            {perfil.nome}
          </Texto>
          <Texto variante="legenda" cor="textoSecundario" numberOfLines={1}>
            {perfil.email}
          </Texto>
          <Selo
            texto={ehPersonal ? "Personal trainer" : "Aluno"}
            icone={ehPersonal ? "clipboard-list" : "dumbbell"}
            estilo={estilos.selo}
          />
        </View>
      </Cartao>

      {ehPersonal ? (
        <View style={estilos.bloco}>
          <CartaoConvite codigo={perfil.codigoConvite} />
        </View>
      ) : (
        <>
          <CabecalhoSecao titulo="Meu personal" />
          {personal ? (
            <Cartao estilo={estilos.personal}>
              <Avatar nome={personal.nome} tamanho={46} />
              <View style={estilos.flex}>
                <Texto variante="corpoForte">{personal.nome}</Texto>
                <Texto variante="legenda" cor="textoSecundario">
                  Personal trainer
                </Texto>
              </View>
              <Botao
                titulo="Trocar"
                variante="secundario"
                tamanho="sm"
                larguraTotal={false}
                onPress={vincular}
              />
            </Cartao>
          ) : (
            <Cartao>
              <Texto variante="corpoForte">Você ainda não tem personal</Texto>
              <Texto
                variante="legenda"
                cor="textoSecundario"
                estilo={estilos.semPersonal}
              >
                Peça o código ao seu personal para receber os treinos dele.
              </Texto>
              <Botao
                titulo="Vincular com código"
                icone="ticket"
                tamanho="sm"
                onPress={vincular}
              />
            </Cartao>
          )}
        </>
      )}

      <CabecalhoSecao titulo="Conta" />
      <View style={estilos.opcoes}>
        <Opcao
          icone="pencil"
          titulo="Editar nome"
          descricao="Como você aparece no app"
          onPress={editarNome}
        />
        {!ehPersonal && personal && (
          <Opcao
            icone="unlink"
            titulo="Desvincular do personal"
            descricao="Sair da lista do seu personal"
            onPress={desvincular}
          />
        )}
        {MODO_DEMO && (
          <Opcao
            icone="rotate-ccw"
            titulo="Restaurar dados de exemplo"
            descricao="Volta o modo demonstração ao início"
            onPress={restaurarDemo}
          />
        )}
        <Opcao
          icone="log-out"
          titulo="Sair da conta"
          onPress={sairDaConta}
          perigo
        />
      </View>

      <AvisoDemo estilo={estilos.bloco} />

      <View style={estilos.rodape}>
        <Texto variante="legenda" cor="textoTerciario" alinhamento="center">
          GymFEI {VERSAO_APP} · conta criada em{" "}
          {formatarDataCompleta(perfil.criadoEm)}
        </Texto>
        <Texto variante="legenda" cor="textoTerciario" alinhamento="center">
          Projeto acadêmico · FEI ·{" "}
          {MODO_DEMO ? "modo demonstração" : "dados no Supabase"}
        </Texto>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: espaco.lg },
  selo: { marginTop: espaco.sm },
  bloco: { marginTop: espaco.xxl },
  personal: { flexDirection: "row", alignItems: "center", gap: espaco.md },
  semPersonal: { marginTop: espaco.xs, marginBottom: espaco.lg },
  opcoes: {
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    overflow: "hidden",
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    paddingHorizontal: espaco.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  opcaoIcone: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  rodape: { marginTop: espaco.xxl, gap: 2 },
});
