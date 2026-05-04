import * as React from 'react';
import { Text, View, Button, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from '../config/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as Font from 'expo-font';
import { Image } from 'react-native';


export default class Cadastro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      password: '',
      fontLoaded: false
    };
  }

  gravar() {

  const email = this.state.user.trim().toLowerCase();
  const password = this.state.password;

  console.log("Email:", email);
  console.log("Senha:", password);

  if (email === '' || password === '') {
    alert('Preencha todos os campos!');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const userId = userCredential.user.uid;
      
      firebase.firestore().collection('usuarios').doc(userId).set({
        nome: this.state.nome,
        email: email,
        tipo: 'aluno',
      })
      
      .then((user) => {
        alert("Usuário cadastrado com sucesso!");
        
        this.props.navigation.navigate('Login');
      })
    })
      .catch((error) => {

        if (error.code === 'auth/email-already-in-use') {
          alert('Esse email já está em uso');
        } else if (error.code === 'auth/weak-password') {
          alert('Senha fraca (mínimo 6 caracteres)');
        } else if (error.code === 'auth/invalid-email') {
          alert('Email inválido');
        } else {
          alert(error.message);
        }
    });
  }

  async componentDidMount(){
    await Font.loadAsync({
      'Montserrat': require('../assets/fonts/Montserrat-Regular.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    if(!this.state.fontLoaded){
      return null;
    }

    return (
      <View style={{flex: 1, backgroundColor: '#070706', margin: 0, padding: 0, boxSizing: 'border-box'}}>
        <Image 
          source = {require('../assets/img/gymfei-logo.png')}
          style = {{width: 200, height: 200, alignSelf: 'center', marginTop: 20}}
        />

        <Text style={estilos.titulo}>Bem-vindo(a) ao GymFEI!</Text>
        <Text style={estilos.subtitulo}>Faça seu cadastro para começar a usar o aplicativo.</Text>
        <Text 
          style={estilos.subtitulo}>Já possui um cadastro?  
            <Text style={estilos.link}
              onPress={() => this.props.navigation.navigate('Login')}> Realizar login
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
            this.gravar();
          }}
        >
          <Text style={estilos.botaoTexto}>Realizar Cadastro</Text>
        </TouchableOpacity> 
      </View>
    );
  }
}

const estilos = StyleSheet.create({
    titulo: {
      color: 'whitesmoke',
      fontSize: 30,
      alignSelf: 'center',
      marginTop: 20,
      fontWeight: '700',
      fontFamily: 'Montserrat',
    },

    subtitulo: {
      color: 'whitesmoke',              
      fontSize: 20,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 5,
      fontFamily: 'Montserrat',
    },

    texto: {
      color: 'whitesmoke',
      fontSize: 25,
      marginLeft: 250,
      marginBottom: 20,
      fontFamily: 'Montserrat',
    },
    
    input: {
      height: 50,
      padding: 20,
      fontSize: 20,
      borderWidth: 1,
      marginLeft: 250,
      marginRight: 250,
      marginBottom: 20,
      borderRadius: 8,
      borderColor: 'gray',
      placeholderTextColor: 'lightgray',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'Montserrat',
      color: 'whitesmoke',
    },

    link: {
      color: '#a973f9',
      fontSize: 20,
      fontFamily: 'Montserrat',
      gap: 5,
    },

    botao: {
      backgroundColor: '#a973f9',
      padding: 15,
      marginLeft: 250,
      marginRight: 250,
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    botaoTexto: {
      color: 'whitesmoke',
      fontSize: 20,
      fontFamily: 'Montserrat',
      fontWeight: '500',
    },
});
