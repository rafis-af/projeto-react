import * as React from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import firebase from "../config/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as Font from "expo-font";
import { Image } from "react-native";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      password: "",
    };
  }

  ler() {
    const email = this.state.user.trim().toLowerCase();
    const password = this.state.password;

    if (email === "" || password === "") {
      alert("Preencha todos os campos!");
      return;
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;

        firebase
          .firestore()
          .collection("usuarios")
          .doc(userId)
          .get()
          .then((doc) => {
            if (!doc.exists) {
              alert("Usuário não encontrado. Faça login novamente.");
              this.props.navigation.navigate("Login");
              return;
            }

            const dados = doc.data();
            if (dados.tipo === "admin") {
              this.props.navigation.navigate("HomeAdmin");
            } else {
              this.props.navigation.navigate("HomeUsuario");
            }
          });
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          alert("Usuário não encontrado");
        } else if (error.code === "auth/wrong-password") {
          alert("Senha incorreta");
        } else if (error.code === "auth/invalid-email") {
          alert("Email inválido");
        } else {
          alert("Ocorreu um erro inesperado: " + error.message);
        }
      });
  }

  async componentDidMount() {
    await Font.loadAsync({
      Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    if (!this.state.fontLoaded) {
      return null;
    }

    return (
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: "#070706",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Image
              source={require("../assets/img/gymfei-logo.png")}
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
                marginTop: 50,
              }}
            />

            <Text style={estilos.titulo}>
              Bem-vindo(a) novamente ao GymFEI!
            </Text>
            <Text style={estilos.subtitulo}>
              Faça seu login para continuar.
            </Text>
            <Text style={estilos.subtitulo}>
              Não possui uma conta ainda?
              <Text
                style={estilos.link}
                onPress={() => this.props.navigation.navigate("Cadastro")}
              >
                {" "}
                Realizar cadastro
              </Text>
            </Text>

            <Text style={estilos.texto}>Digite seu e-mail:</Text>

            <TextInput
              style={estilos.input}
              placeholder="Digite seu e-mail..."
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(texto) => this.setState({ user: texto })}
            />

            <Text style={estilos.texto}>Digite sua senha:</Text>

            <TextInput
              style={estilos.input}
              placeholder="Digite sua senha..."
              onChangeText={(texto) => this.setState({ password: texto })}
            />

            <TouchableOpacity
              style={estilos.botao}
              onPress={() => {
                this.ler();
              }}
            >
              <Text style={estilos.botaoTexto}>Realizar Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const estilos = StyleSheet.create({
  titulo: {
    color: "whitesmoke",
    fontSize: 30,
    textAlign: "center",
    marginLeft: 15,
    marginRight: 15,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },

  subtitulo: {
    color: "whitesmoke",
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    fontFamily: "Montserrat",
  },

  texto: {
    color: "whitesmoke",
    fontSize: 25,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 20,
    fontFamily: "Montserrat",
  },

  input: {
    height: 50,
    paddingLeft: 20,
    fontSize: 20,
    borderWidth: 1,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    borderColor: "gray",
    placeholderTextColor: "lightgray",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Montserrat",
    color: "whitesmoke",
  },

  link: {
    color: "#a973f9",
    fontSize: 20,
    fontFamily: "Montserrat",
    gap: 5,
  },

  botao: {
    backgroundColor: "#a973f9",
    padding: 15,
    borderRadius: 8,
    marginLeft: 15,
    marginRight: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  botaoTexto: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Montserrat",
    fontWeight: "500",
  },
});
