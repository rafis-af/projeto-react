import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import firebase from "../config/config";
export default class IniciarTreino extends React.Component {
  constructor(props) {
    super(props);

    const treino = this.props.route.params.treino;

    this.state = {
      treino: treino,
      exercicioAtual: 0,
      descansando: false,
      tempo: 5,
    };
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  proximo() {
    if (this.state.exercicioAtual < this.state.treino.exercicios.length - 1) {
      this.setState({
        exercicioAtual: this.state.exercicioAtual + 1,
      });
    }
  }

  anterior() {
    if (this.state.exercicioAtual > 0) {
      this.setState({
        exercicioAtual: this.state.exercicioAtual - 1,
      });
    }
  }

  iniciarDescanso() {
    this.setState({
      descansando: true,
      tempo: 5,
    });

    this.interval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.tempo <= 1) {
          clearInterval(this.interval);

          Vibration.vibrate(2000);

          if (
            prevState.exercicioAtual >=
            prevState.treino.exercicios.length - 1
          ) {
            this.concluirTreino();

            return {
              descansando: false,
              tempo: 5,
            };
          }

          return {
            descansando: false,
            exercicioAtual: prevState.exercicioAtual + 1,
            tempo: 5,
          };
        }

        return {
          tempo: prevState.tempo - 1,
        };
      });
    }, 1000);
  }

  concluirTreino() {
    const treino = this.props.route.params.treino;
    const usuario = firebase.auth().currentUser;

    firebase
      .firestore()
      .collection("historicoTreinos")
      .add({
        alunoId: usuario.uid,
        treinoId: treino.id,
        nomeTreino: treino.nome,
        grupoMuscular: treino.grupoMuscular,
        quantidadeExercicios: treino.exercicios.length,
        data: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        alert("Treino concluído!");
        this.props.navigation.goBack();
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  render() {
    const { treino, exercicioAtual } = this.state;
    const exercicio = treino.exercicios[exercicioAtual];

    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>{treino.nome}</Text>

        <Text style={estilos.progresso}>
          Exercício {exercicioAtual + 1} de {treino.exercicios.length}
        </Text>

        <View style={estilos.botoes}>
          {!this.state.descansando ? (
            <>
              <Text style={estilos.exercicio}>{exercicio}</Text>

              <TouchableOpacity
                style={estilos.botao}
                onPress={() => this.iniciarDescanso()}
              >
                <Text style={estilos.textoBotao}>Concluir Exercício</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={estilos.descansoTexto}>Descanso</Text>

              <Text style={estilos.timer}>{this.state.tempo}s</Text>
            </>
          )}
        </View>

        {/* <TouchableOpacity
          style={estilos.botao}
          onPress={() => this.concluirTreino()}
        >
          <Text>Concluir treino</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[estilos.botao, { backgroundColor: "#555" }]}
          onPress={() => this.anterior()}
          disabled={exercicioAtual === 0}
        >
          <Text style={estilos.textoBotao}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={estilos.botaoVoltar}
          onPress={() => this.props.navigation.goBack()}
        >
          <Text style={estilos.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070706",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  titulo: {
    color: "white",
    fontSize: 28,
    marginBottom: 20,
    fontFamily: "Montserrat",
  },

  progresso: {
    color: "#aaa",
    fontSize: 18,
    marginBottom: 10,
  },

  exercicio: {
    color: "#7c47f5",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },

  botao: {
    backgroundColor: "#7c47f5",
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    marginTop: 20,
  },

  textoBotao: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  descansoTexto: {
    color: "#22c55e",
    fontSize: 28,
    marginBottom: 10,
    textAlign: "center",
  },

  timer: {
    color: "#22c55e",
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
  },
  botaoVoltar: {
    backgroundColor: "#aaaaab",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },

  textoBotaoVoltar: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },
});
