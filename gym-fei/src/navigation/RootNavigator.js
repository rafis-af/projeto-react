import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BarraAbas, Botao, EstadoVazio, MarcaLogo } from "../components";
import { useAuth } from "../context/AuthContext";
import BoasVindas from "../screens/auth/BoasVindas";
import Cadastro from "../screens/auth/Cadastro";
import Login from "../screens/auth/Login";
import DetalheTreino from "../screens/aluno/DetalheTreino";
import InicioAluno from "../screens/aluno/InicioAluno";
import MeusTreinos from "../screens/aluno/MeusTreinos";
import Progresso from "../screens/aluno/Progresso";
import TreinoConcluido from "../screens/aluno/TreinoConcluido";
import TreinoEmAndamento from "../screens/aluno/TreinoEmAndamento";
import Perfil from "../screens/Perfil";
import Alunos from "../screens/personal/Alunos";
import DetalheAluno from "../screens/personal/DetalheAluno";
import FormTreino from "../screens/personal/FormTreino";
import InicioPersonal from "../screens/personal/InicioPersonal";
import Lixeira from "../screens/personal/Lixeira";
import TreinosPersonal from "../screens/personal/TreinosPersonal";
import { cores, espaco } from "../theme";

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

const opcoesPilha = {
  headerShown: false,
  contentStyle: { backgroundColor: cores.fundo },
  animation: "slide_from_right",
};

const opcoesAbas = {
  headerShown: false,
  sceneStyle: { backgroundColor: cores.fundo },
};

// Abas do personal: Início, Alunos, [+ Novo treino], Treinos, Perfil
function AbasPersonal({ navigation }) {
  return (
    <Abas.Navigator
      screenOptions={opcoesAbas}
      tabBar={(props) => (
        <BarraAbas
          {...props}
          acaoCentral={{
            icone: "plus",
            rotulo: "Criar novo treino",
            onPress: () => navigation.navigate("FormTreino"),
          }}
        />
      )}
    >
      <Abas.Screen
        name="Inicio"
        component={InicioPersonal}
        options={{ title: "Início", icone: "house" }}
      />
      <Abas.Screen
        name="Alunos"
        component={Alunos}
        options={{ title: "Alunos", icone: "users" }}
      />
      <Abas.Screen
        name="Treinos"
        component={TreinosPersonal}
        options={{ title: "Treinos", icone: "dumbbell" }}
      />
      <Abas.Screen
        name="Perfil"
        component={Perfil}
        options={{ title: "Perfil", icone: "circle-user-round" }}
      />
    </Abas.Navigator>
  );
}

// Abas do aluno: Início, Treinos, Progresso, Perfil
function AbasAluno() {
  return (
    <Abas.Navigator
      screenOptions={opcoesAbas}
      tabBar={(props) => <BarraAbas {...props} />}
    >
      <Abas.Screen
        name="Inicio"
        component={InicioAluno}
        options={{ title: "Início", icone: "house" }}
      />
      <Abas.Screen
        name="Treinos"
        component={MeusTreinos}
        options={{ title: "Treinos", icone: "dumbbell" }}
      />
      <Abas.Screen
        name="Progresso"
        component={Progresso}
        options={{ title: "Progresso", icone: "chart-column" }}
      />
      <Abas.Screen
        name="Perfil"
        component={Perfil}
        options={{ title: "Perfil", icone: "circle-user-round" }}
      />
    </Abas.Navigator>
  );
}

function TelaCarregando() {
  return (
    <View style={estilos.centro} accessibilityLabel="Carregando">
      <MarcaLogo tamanho={84} />
      <ActivityIndicator
        color={cores.primariaClara}
        style={{ marginTop: espaco.xxl }}
      />
    </View>
  );
}

function TelaErroPerfil({ mensagem, aoTentar, aoSair }) {
  return (
    <View style={[estilos.centro, { padding: espaco.xxl }]}>
      <EstadoVazio
        icone="wifi-off"
        titulo="Não conseguimos abrir sua conta"
        descricao={mensagem}
        acao={{
          titulo: "Tentar novamente",
          icone: "refresh-cw",
          onPress: aoTentar,
        }}
      />
      <Botao
        titulo="Sair da conta"
        variante="fantasma"
        larguraTotal={false}
        onPress={aoSair}
      />
    </View>
  );
}

export default function RootNavigator() {
  const { sessao, perfil, iniciando, erroPerfil, recarregarPerfil, sair } =
    useAuth();

  if (iniciando) return <TelaCarregando />;
  if (sessao && erroPerfil) {
    return (
      <TelaErroPerfil
        mensagem={erroPerfil}
        aoTentar={recarregarPerfil}
        aoSair={sair}
      />
    );
  }
  if (sessao && !perfil) return <TelaCarregando />;

  return (
    <Pilha.Navigator screenOptions={opcoesPilha}>
      {!sessao ? (
        <>
          <Pilha.Screen
            name="BoasVindas"
            component={BoasVindas}
            options={{ animation: "fade" }}
          />
          <Pilha.Screen name="Login" component={Login} />
          <Pilha.Screen name="Cadastro" component={Cadastro} />
        </>
      ) : perfil.tipo === "personal" ? (
        <>
          <Pilha.Screen
            name="AbasPersonal"
            component={AbasPersonal}
            options={{ animation: "fade" }}
          />
          <Pilha.Screen
            name="FormTreino"
            component={FormTreino}
            options={{ animation: "slide_from_bottom" }}
          />
          <Pilha.Screen name="DetalheAluno" component={DetalheAluno} />
          <Pilha.Screen name="Lixeira" component={Lixeira} />
        </>
      ) : (
        <>
          <Pilha.Screen
            name="AbasAluno"
            component={AbasAluno}
            options={{ animation: "fade" }}
          />
          <Pilha.Screen name="DetalheTreino" component={DetalheTreino} />
          <Pilha.Screen
            name="TreinoEmAndamento"
            component={TreinoEmAndamento}
            options={{ animation: "slide_from_bottom", gestureEnabled: false }}
          />
          <Pilha.Screen
            name="TreinoConcluido"
            component={TreinoConcluido}
            options={{ animation: "fade", gestureEnabled: false }}
          />
        </>
      )}
    </Pilha.Navigator>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.fundo,
  },
});
