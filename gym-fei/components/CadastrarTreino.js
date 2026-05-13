import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import firebase from "../config/config";
import ScreenContainer from "../components/ScreenContainer";

export default class CadastrarTreino extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nome: "",
      grupoMuscular: "",
      exercicios: "",
      objetivo: "",
      alunos: [],
      alunoSelecionado: null,
      imagem: "",
      imagemSelecionada: "",
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("usuarios")
      .where("tipo", "==", "aluno")
      .get()
      .then((snapshot) => {
        let lista = [];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        this.setState({ alunos: lista });
      });
  }

  salvar() {
    const usuarioAtual = firebase.auth().currentUser;
    const lista = this.state.exercicios
      .split(",")
      .map((exercicio) => exercicio.trim());

    if (!usuarioAtual) {
      alert("Usuário não autenticado. Faça login novamente.");
      this.props.navigation.navigate("Login");
      return;
    }

    if (
      this.state.nome.trim() === "" ||
      this.state.grupoMuscular.trim() === "" ||
      this.state.exercicios.trim() === "" ||
      this.state.objetivo.trim() === ""
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    if (!this.state.alunoSelecionado) {
      alert("Selecione um aluno para associar o treino!");
      return;
    }

    if (this.state.imagemSelecionada === "") {
      alert("Insira uma musculatura valida!");
      return;
    }

    firebase
      .firestore()
      .collection("treinos")
      .add({
        nome: this.state.nome,
        grupoMuscular: this.state.grupoMuscular,
        exercicios: lista,
        objetivo: this.state.objetivo,
        personalId: usuarioAtual.uid,
        alunoId: this.state.alunoSelecionado,
        imagem: this.state.imagemSelecionada,
        deletado: false,
      })
      .then(() => {
        alert("Treino cadastrado com sucesso!");

        this.setState({
          nome: "",
          grupoMuscular: "",
          exercicios: "",
          objetivo: "",
        });

        this.props.navigation.navigate("HomeAdmin");
      })
      .catch((error) => {
        alert("Ocorreu um erro inesperado: " + error.message);
      });
  }

  render() {
    const imagem = [
      {
        grupo: "Peito",
        valor: "peito",
        src: require("../assets/img/peitoral.png"),
      },
      {
        grupo: "Costas",
        valor: "costas",
        src: require("../assets/img/costas.png"),
      },
      {
        grupo: "Pernas",
        valor: "pernas",
        src: require("../assets/img/pernas.png"),
      },
      {
        grupo: "Braços",
        valor: "bracos",
        src: require("../assets/img/bracos.png"),
      },
      {
        grupo: "Ombros",
        valor: "ombros",
        src: require("../assets/img/ombros.png"),
      },
    ];

    return (
      <ScreenContainer>
        <View style={estilos.container}>
          <TouchableOpacity
            style={estilos.botaoVoltar}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text style={estilos.textoBotaoVoltar}>Voltar</Text>
          </TouchableOpacity>

          <Text style={estilos.titulo}>Cadastrar Treino</Text>

          <TextInput
            style={estilos.input}
            placeholder="Nome do treino"
            placeholderTextColor="gray"
            value={this.state.nome}
            onChangeText={(texto) => this.setState({ nome: texto })}
          />

          <TextInput
            style={[estilos.input, estilos.textArea]}
            placeholder="Exercícios"
            placeholderTextColor="gray"
            multiline={true}
            value={this.state.exercicios}
            onChangeText={(texto) => this.setState({ exercicios: texto })}
          />

          <TextInput
            style={estilos.input}
            placeholder="Objetivo"
            placeholderTextColor="gray"
            multiline={true}
            value={this.state.objetivo}
            onChangeText={(texto) => this.setState({ objetivo: texto })}
          />

          <TouchableOpacity style={estilos.botao} onPress={() => this.salvar()}>
            <Text style={estilos.textoBotao}>Salvar Treino</Text>
          </TouchableOpacity>

          <Text style={estilos.subtitulo}>Selecione o aluno:</Text>

          {this.state.alunos.map((aluno) => (
            <TouchableOpacity
              key={aluno.id}
              style={[
                estilos.alunoItem,
                this.state.alunoSelecionado === aluno.id &&
                  estilos.alunoSelecionado,
              ]}
              onPress={() => this.setState({ alunoSelecionado: aluno.id })}
            >
              <Text style={estilos.textoAluno}>{aluno.nome}</Text>
            </TouchableOpacity>
          ))}

          <Text style={estilos.subtitulo}>Escolha a imagem:</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {imagem.map((img) => (
              <TouchableOpacity
                key={img.valor}
                onPress={() =>
                  this.setState({
                    grupoMuscular: img.grupo,
                    imagemSelecionada: img.valor,
                  })
                }
                style={{
                  margin: 5,
                  borderWidth:
                    this.state.imagemSelecionada === img.valor ? 3 : 0,
                  borderColor: "#7c47f5",
                  borderRadius: 10,
                  padding: 5,
                }}
              >
                <Image
                  source={img.src}
                  style={{
                    width: 150,
                    height: 120,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScreenContainer>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070706",
    padding: 25,
    justifyContent: "center",
  },

  titulo: {
    color: "whitesmoke",
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 80,
  },

  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 15,
    color: "whitesmoke",
    fontSize: 18,
    fontFamily: "Montserrat",
    marginBottom: 15,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  botao: {
    backgroundColor: "#7c47f5",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

  textoBotao: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },

  botaoVoltar: {
    backgroundColor: "#aaaaab",
    padding: 15,
    borderRadius: 8,
    marginTop: 0,
    display: "flex",
    justifyContent: "center",
    alignSelf: "center",
    position: "relative",
    top: 60,
  },

  textoBotaoVoltar: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },

  subtitulo: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "Montserrat",
    marginTop: 20,
  },

  alunoItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    marginBottom: 8,
  },

  alunoSelecionado: {
    borderColor: "#7c47f5",
    backgroundColor: "#1a1a1a",
  },

  textoAluno: {
    color: "white",
    fontFamily: "Montserrat",
  },
});
