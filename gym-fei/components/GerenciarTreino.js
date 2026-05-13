import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import firebase from "../config/config";
import { StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default class GerenciarTreino extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treinos: [],
    };
  }

  componentDidMount() {
    this.carregarTreinos();
  }

  carregarTreinos() {
    const usuario = firebase.auth().currentUser;
    if (!usuario) {
      alert("Usuário não autenticado. Faça login novamente.");
      this.props.navigation.navigate("Login");
      return;
    }

    firebase
      .firestore()
      .collection("treinos")
      .where("personalId", "==", usuario.uid)
      .where("deletado", "==", false)
      .get()
      .then((snapshot) => {
        let treinos = [];

        snapshot.forEach((doc) => {
          treinos.push({ id: doc.id, ...doc.data() });
        });

        this.setState({ treinos: treinos });
      })
      .catch((error) => {
        alert("Ocorreu um erro inesperado: " + error.message);
      });
  }

  deletarTreino(treinoId) {
    const usuario = firebase.auth().currentUser;
    if (!usuario) {
      alert("Usuário não autenticado. Faça login novamente.");
      this.props.navigation.navigate("Login");
      return;
    }

    firebase
      .firestore()
      .collection("treinos")
      .doc(treinoId)
      .update({
        deletado:true,
      })
      .then(() => {
        this.carregarTreinos();
        alert("Treino deletado com sucesso!");
      })
      .catch((error) => {
        alert("Ocorreu um erro inesperado: " + error.message);
      });
  }

  render() {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Gerenciar Treinos</Text>

        <TouchableOpacity
          style={estilos.btnVoltar}
          onPress={() => this.props.navigation.goBack()}
        >
          <Text style={estilos.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        {this.state.treinos.length === 0 && (
          <Text style={estilos.texto}>Nenhum treino encontrado.</Text>
        )}

        <FlatList
          data={this.state.treinos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={estilos.card}>
              <Text style={estilos.nome}>{item.nome}</Text>

              <TouchableOpacity
                style={estilos.botaoEditar}
                onPress={() =>
                  this.props.navigation.navigate("EditarTreino", {
                    treino: item,
                  })
                }
              >
                <Text style={estilos.textoBotao}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botaoExcluir}
                onPress={() => this.deletarTreino(item.id)}
              >
                <Text style={estilos.textoBotao}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070706",
    padding: 20,
    paddingTop: 90,
  },

  titulo: {
    color: "white",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#171717",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 40,
  },

  nome: {
    color: "white",
    fontSize: 30,
    marginBottom: 10,
    textAlign: "center",
  },

  botaoEditar: {
    backgroundColor: "#f59e0b",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 5,
  },

  botaoExcluir: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
  },

  textoBotao: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  btnVoltar: {
    backgroundColor: "#aaaaab",
    padding: 15,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignSelf: "center",
  },
  btnVoltarTexto: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  texto: {
    color: "whitesmoke",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
});
