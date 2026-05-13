import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import firebase from "../config/config";

export default class TreinosExcluidos extends React.Component {
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
    firebase
      .firestore()
      .collection("treinos")
      .where("deletado", "==", true)
      .get()
      .then((snapshot) => {
        let lista = [];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        

        this.setState({
          treinos: lista,
        });
      
      })
      .catch((error) => {
        alert(error.message);
      });
      
  }

  restaurarTreino(id) {
    firebase
      .firestore()
      .collection("treinos")
      .doc(id)
      .update({
        deletado: false,
      })
      .then(() => {
        alert("Treino restaurado!");

        this.carregarTreinos();
      })
      .catch((error) => {
        alert(error.message);
      });
      
  }

  render() {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Treinos Excluídos</Text>

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
                style={estilos.botao}
                onPress={() => this.restaurarTreino(item.id)}
              >
                <Text style={estilos.textoBotao}>Restaurar</Text>
              </TouchableOpacity>
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
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
    marginTop:85,
  },

  texto:{
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#171717",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  nome: {
    color: "white",
    fontSize: 20,
    marginBottom: 10,
  },

  botao: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
  },

  textoBotao: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },

  btnVoltar: {
    backgroundColor: "#aaaaab",
    padding: 15,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  btnVoltarTexto: {
    fontSize: 18,
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },
});
