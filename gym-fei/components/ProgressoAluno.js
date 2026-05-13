import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import firebase from "../config/config";
export default class ProgressoAluno extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      historico: [],
      totalTreinos: 0,

      peito: 0,
      costas: 0,
      pernas: 0,
      bracos: 0,
      ombros: 0,
    };
  }

  componentDidMount() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    const usuario = firebase.auth().currentUser;

    if (!usuario) {
      this.props.navigation.goBack();
      return;
    }

    firebase
      .firestore()
      .collection("historicoTreinos")
      .where("alunoId", "==", usuario.uid)
      .orderBy("data", "desc")
      .get()
      .then((snapshot) => {
        let lista = [];

        let peito = 0;
        let costas = 0;
        let pernas = 0;
        let bracos = 0;
        let ombros = 0;

        snapshot.forEach((doc) => {
          const treino = {
            id: doc.id,
            ...doc.data(),
          };

          lista.push(treino);

          switch (treino.grupoMuscular) {
            case "Peito":
              peito++;
              break;

            case "Costas":
              costas++;
              break;

            case "Pernas":
              pernas++;
              break;

            case "Braços":
              bracos++;
              break;

            case "Ombros":
              ombros++;
              break;
          }
        });

        this.setState({
          historico: lista,
          totalTreinos: lista.length,

          peito,
          costas,
          pernas,
          bracos,
          ombros,
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  render() {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Meu Progresso</Text>

        <View style={estilos.card}>
          <Text style={estilos.total}>
            Total de treinos: {this.state.totalTreinos}
          </Text>
        </View>

        <View style={estilos.card}>
          <Text style={estilos.texto}>Peito: {this.state.peito}</Text>

          <Text style={estilos.texto}>Costas: {this.state.costas}</Text>

          <Text style={estilos.texto}>Pernas: {this.state.pernas}</Text>

          <Text style={estilos.texto}>Braços: {this.state.bracos}</Text>

          <Text style={estilos.texto}>Ombros: {this.state.ombros}</Text>
        </View>

        <Text style={estilos.subtitulo}>Últimos treinos</Text>

        <FlatList
          data={this.state.historico.slice(0, 2)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={estilos.item}>
              <Text style={estilos.nomeTreino}>{item.nomeTreino}</Text>

              <Text style={estilos.grupo}>{item.grupoMuscular}</Text>

              <Text style={estilos.grupo}>
                {item.data?.toDate().toLocaleDateString("pt-BR")}
              </Text>
            </View>
          )}
        />

        <TouchableOpacity
          style={estilos.btnVoltar}
          onPress={() => this.props.navigation.goBack()}
        >
          <Text style={estilos.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070706",
    padding: 20,
  },

  titulo: {
    color: "white",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    paddingTop: 75,
  },

  subtitulo: {
    color: "white",
    fontSize: 24,
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#171717",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#7c47f5",
  },

  total: {
    color: "#7c47f5",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },

  texto: {
    color: "white",
    fontSize: 18,
    marginBottom: 5,
  },

  item: {
    backgroundColor: "#171717",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  nomeTreino: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  grupo: {
    color: "#ccc",
    marginTop: 5,
    fontSize: 16,
  },

  btnVoltar: {
    backgroundColor: "#aaaaab",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },

  btnVoltarTexto: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
});
