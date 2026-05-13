import * as React from "react";
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

export default class EditarTreino extends React.Component {
  constructor(props) {
    super(props);

    const treino = this.props.route.params.treino;

    this.state = {
      id: treino.id,

      nome: treino.nome,
      grupoMuscular: treino.grupoMuscular,
      exercicios: treino.exercicios.join(", "),
      objetivo: treino.objetivo,
      imagem: treino.imagem || "",
    };
  }

  salvar() {
    const lista = this.state.exercicios
      .split(",")
      .map((exercicio) => exercicio.trim());

    if (
      this.state.nome.trim() === "" ||
      this.state.grupoMuscular.trim() === "" ||
      this.state.exercicios.trim() === "" ||
      this.state.objetivo.trim() === ""
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    firebase
      .firestore()
      .collection("treinos")
      .doc(this.state.id)
      .update({
        nome: this.state.nome,
        grupoMuscular: this.state.grupoMuscular,
        exercicios: lista,
        objetivo: this.state.objetivo,
        imagem: this.state.imagem,
      })
      .then(() => {
        alert("Treino atualizado!");

        this.props.navigation.goBack();
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  render() {
    const imagens = [
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
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Editar Treino</Text>

        <TextInput
          style={estilos.input}
          placeholder="Nome"
          placeholderTextColor="gray"
          value={this.state.nome}
          onChangeText={(texto) => this.setState({ nome: texto })}
        />

        <Text style={estilos.subtitulo}>Selecione a musculatura</Text>

        <View style={estilos.containerImagens}>
          {imagens.map((img) => (
            <TouchableOpacity
              key={img.valor}
              style={[
                estilos.cardImagem,

                this.state.imagem === img.valor && estilos.imagemSelecionada,
              ]}
              onPress={() =>
                this.setState({
                  imagem: img.valor,
                  grupoMuscular: img.grupo,
                })
              }
            >
              <Image
                source={img.src}
                style={estilos.imagem}
                resizeMode="contain"
              />

              <Text style={estilos.textoImagem}>{img.grupo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[estilos.input, estilos.textArea]}
          placeholder="Exercícios"
          placeholderTextColor="gray"
          multiline
          value={this.state.exercicios}
          onChangeText={(texto) => this.setState({ exercicios: texto })}
        />

        <TextInput
          style={estilos.input}
          placeholder="Objetivo"
          placeholderTextColor="gray"
          value={this.state.objetivo}
          onChangeText={(texto) => this.setState({ objetivo: texto })}
        />

        <TouchableOpacity style={estilos.botao} onPress={() => this.salvar()}>
          <Text style={estilos.textoBotao}>Salvar Alterações</Text>
        </TouchableOpacity>

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
    padding: 25,
    justifyContent: "center",
  },

  titulo: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 15,
    color: "white",
    fontSize: 18,
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
    fontWeight: "bold",
  },

  subtitulo: {
    color: "white",
    fontSize: 20,
    marginBottom: 10,
  },

  containerImagens: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },

  cardImagem: {
    backgroundColor: "#171717",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: "center",
    width: 100,
  },

  imagemSelecionada: {
    borderColor: "#7c47f5",
  },

  imagem: {
    width: 60,
    height: 60,
  },

  textoImagem: {
    color: "white",
    marginTop: 5,
    fontSize: 14,
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
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },
});
