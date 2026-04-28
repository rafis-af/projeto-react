import * as React from 'react';
import { Text, View, Button, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from '../config/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as Font from 'expo-font';
import { Image } from 'react-native';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      password: '',
      fontLoaded: false
    };
  }

  ler() {
    const email = this.state.user.trim().toLowerCase();
    const password = this.state.password;

    if (email === '' || password === '') {
      alert('Preencha todos os campos!');
      return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((user) => {
        alert("Login realizado com sucesso!");
        this.props.navigation.navigate('Home');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          alert('Usuário não encontrado');
        } else if (error.code === 'auth/wrong-password') {
          alert('Senha incorreta');
        } else if (error.code === 'auth/invalid-email') {
          alert('Email inválido');
        } else {
          alert("Ocorreu um erro inesperado: " + error.message);
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
    
            <Text style={estilos.titulo}>Bem-vindo(a) novamente ao GymFEI!</Text>
            <Text style={estilos.subtitulo}>Faça seu login para continuar.</Text>
            <Text 
              style={estilos.subtitulo}>Nao possui uma conta ainda?  
                <Text style={estilos.link}
                  onPress={() => this.props.navigation.navigate('Cadastro')}> Realizar cadastro
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