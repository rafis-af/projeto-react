import * as React from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Touchable,
} from "react-native";
import firebase from "../config/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as Font from "expo-font";
import { Image } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fraseMotivacional: "",
    };

    this.frase = [
      "O único lugar onde o sucesso vem antes do trabalho é no dicionário. - Vidal Sassoon",
      "A dor que você sente hoje será a força que você sentirá amanhã. - Arnold Schwarzenegger",
      "Não conte os dias, faça os dias contarem. - Muhammad Ali",
      "O sucesso é a soma de pequenos esforços repetidos dia após dia. - Robert Collier",
      "Acredite em si mesmo e todo o resto virá naturalmente. - Elissa Gabbert",
      "A única maneira de fazer um excelente trabalho é amar o que você faz. - Steve Jobs",
      "O corpo alcança o que a mente acredita. - Napoleon Hill",
    ];
  }

  componentDidMount() {
    const fraseAleatoria = Math.floor(Math.random() * this.frase.length);
    this.setState({ fraseMotivacional: this.frase[fraseAleatoria] });
  }

  sair() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        alert("Logout realizado com sucesso!");
        this.props.navigation.navigate("Login");
      })
      .catch((error) => {
        alert("Ocorreu um erro inesperado: " + error.message);
      });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#070707",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <View
          style={{ backgroundColor: "#160e2a", padding: 20, paddingTop: 75 }}
        >
          <Image
            source={require("../assets/img/gymfei-logo-removebg-preview.png")}
            style={{
              width: 110,
              height: 90,
              alignSelf: "center",
              position: "relative",
              top: 5,
            }}
          />
          <TouchableOpacity
            style={estilos.botao}
            onPress={() => {
              this.sair();
            }}
          >
            <Image
              source={require("../assets/img/computer-icons-quit.png")}
              style={{ width: 40, height: 40, position: "relative" }}
            />
          </TouchableOpacity>
        </View>
        <Text style={estilos.texto}>Bem vindo(a) ao GymFEI!</Text>
        <Text style={estilos.subtexto}>
          Aqui você pode acompanhar seu progresso, acessar treinos
          personalizados e muito mais!
        </Text>
        <Text style={estilos.textoFrase}>{this.state.fraseMotivacional}</Text>
        <View>
          <TouchableOpacity
            title="Meus treinos"
            onPress={() => this.props.navigation.navigate("Treinos")}
            style={estilos.btnNav}
          >
            <Text style={estilos.btnNavText}>Meus Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            title="ProgressoAluno"
            onPress={() => this.props.navigation.navigate("ProgressoAluno")}
            style={estilos.btnNav}
          >
            <Text style={estilos.btnNavText}>Progresso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  botao: {
    backgroundColor: "#aaaaab",
    padding: 15,
    marginTop: 90,
    marginLeft: 15,
    alignSelf: "flex-start",
    position: "absolute",
    borderRadius: 8,
    display: "flex",
  },
  botaoTexto: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
  texto: {
    color: "whitesmoke",
    fontSize: 24,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtexto: {
    color: "whitesmoke",
    fontSize: 18,
    fontFamily: "Montserrat",
    fontWeight: "300",
    textAlign: "center",
    marginTop: 10,
  },
  textoFrase: {
    color: "#a970f7",
    fontSize: 22,
    fontFamily: "Montserrat",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 50,
  },
  btnNav: {
    backgroundColor: "#5a2c99",
    padding: 25,
    margin: 20,
    borderRadius: 8,
  },
  btnNavText: {
    color: "whitesmoke",
    fontSize: 23,
    fontFamily: "Montserrat",
    fontWeight: "500",
    textAlign: "center",
  },
});
