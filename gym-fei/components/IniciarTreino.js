import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import ScreenContainer from '../components/ScreenContainer';
export default class IniciarTreino extends React.Component {
  constructor(props) {
    super(props);

    const treino = this.props.route.params.treino;

    this.state = {
      treino: treino,
      exercicioAtual: 0,
      descanso: false,
      tempo:10,
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
        exercicioAtual: this.state.exercicioAtual + 1
      });
    } else {
      const usuario = firebase.auth().currentUser;
      firebase.firestore().collection('historicoTreinos').doc(usuario.uid).update({
        alunoId: usuario.uid,
        treinoId: this.state.treino.id,
        nomeTreino: this.state.treino.nome,
        grupoMuscular: this.state.treino.grupoMuscular,
        quantidadeExercicios: this.state.treino.exercicios.length,
        data: new Date(),
      });

      alert("Treino finalizado!");
      this.props.navigation.goBack();
    }
  }

  anterior() {
    if (this.state.exercicioAtual > 0) {
      this.setState({
        exercicioAtual: this.state.exercicioAtual - 1
      });
    }
  }

  iniciarDescanso() {
    this.setState({descansando: true, tempo: 10,});

    this.interval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.tempo <= 1) {
          clearInterval(this.interval);

          Vibration.vibrate(2000); // vibra 2 segundos

          if (prevState.exercicioAtual >= prevState.treino.exercicios.length - 1) {
            alert("Treino finalizado!");
            this.props.navigation.goBack();
            return prevState;
          }

          return {
            descansando: false,
            exercicioAtual: prevState.exercicioAtual + 1,
            tempo: 10,
          };
        }

        return {
          tempo: prevState.tempo - 1
        };
      });
    }, 1000);
  }
  
  render() {
    const { treino, exercicioAtual } = this.state;
    const exercicio = treino.exercicios[exercicioAtual];

    return (
      <View style={estilos.container}>

        <TouchableOpacity
          style={estilos.botaoVoltar}
          onPress={() => this.props.navigation.goBack()}
      >
          <Text style={estilos.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>

        <Text style={estilos.titulo}>{treino.nome}</Text>

        <Text style={estilos.progresso}>
          Exercício {exercicioAtual + 1} de {treino.exercicios.length}
        </Text>

        <Text style={estilos.exercicio}>
          {exercicio}
        </Text>

        <View style={estilos.botoes}>

          {!this.state.descansando ? (
            <>
              <Text style={estilos.exercicio}>
                {exercicio}
              </Text>

              <TouchableOpacity
                style={estilos.botao}
                onPress={() => this.iniciarDescanso()}
              >
                <Text style={estilos.textoBotao}>
                  Concluir Exercício
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={estilos.descansoTexto}>
                Descanso
              </Text>

              <Text style={estilos.timer}>
                {this.state.tempo}s
              </Text>
            </>
          )}

        </View>
        <TouchableOpacity
          style={[estilos.botao, { backgroundColor: '#555' }]}
          onPress={() => this.anterior()}
          disabled={exercicioAtual === 0}
        >
          <Text style={estilos.textoBotao}>
            Anterior
          </Text>
        </TouchableOpacity>

      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070706',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  titulo: {
    color: 'white',
    fontSize: 28,
    marginBottom: 20,
    fontFamily: 'Montserrat',
  },

  progresso: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 10,
  },

  exercicio: {
    color: '#7c47f5',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },

  botoes: {
    flexDirection: 'row',
    gap: 20,
  },

  botao: {
    backgroundColor: '#7c47f5',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
  },

  textoBotao: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  descansoTexto: {
  color: '#22c55e',
  fontSize: 28,
  marginBottom: 10,
  },

  timer: {
    color: '#22c55e',
    fontSize: 60,
    fontWeight: 'bold',
  },
  botaoVoltar: {
    backgroundColor: '#aaaaab',
    padding: 15,
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  textoBotaoVoltar: {
    color: 'white',
    fontSize: 18,
    textAlign: 'left',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },

});