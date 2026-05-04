import * as React from 'react';
import { Text, View, Button, TextInput, Alert, StyleSheet, TouchableOpacity, Touchable } from 'react-native';
import firebase from '../config/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as Font from 'expo-font';
import { Image } from 'react-native';
import CadastrarTreino from './CadastrarTreino';
import GerenciarTreino from './GerenciarTreino';
import Progresso from './Progresso';

export default class Home extends React.Component {
  
  sair(){
    firebase.auth().signOut()
    .then(() => {
      alert("Logout realizado com sucesso!");
      this.props.navigation.navigate('Login');
    })
    .catch((error) => {
      alert("Ocorreu um erro inesperado: " + error.message);
    });
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#070707', margin: 0, padding: 0, boxSizing: 'border-box'}}>
        <View style={{backgroundColor: '#160e2a', padding: 20}}>
          <Image 
            source = {require('../assets/img/gymfei-logo-removebg-preview.png')}
            style = {{width: 110, height: 90, alignSelf: 'center', position: 'relative', top: 0}}
          />
          <TouchableOpacity
            style={estilos.botao}
            onPress={() => {
              this.sair();
            }}
          >
            <Image 
              source = {require('../assets/img/computer-icons-quit.png')} 
              style={{width: 40, height: 40, position: 'relative'}} 
            />
          </TouchableOpacity> 
        </View>
        <Text style={estilos.texto}>Painel do Personal do GymFEI.</Text>
        <Text style={estilos.subtexto}>Gerencie o treino dos seus alunos</Text>
        <View>
          <TouchableOpacity 
            title="Meus treinos" 
            onPress={() => this.props.navigation.navigate('CadastrarTreino')}
            style={estilos.btnNav} 
          >
            <Text style={estilos.btnNavText}>Cadastrar Treinos</Text>
          </TouchableOpacity>
          

          <TouchableOpacity 
            title="Cadastrar Treino" 
            onPress={() => this.props.navigation.navigate('GerenciarTreino')} 
            style={estilos.btnNav}
          >
            <Text style={estilos.btnNavText}>Gerenciar Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            title="Progresso" 
            onPress={() => this.props.navigation.navigate('Progresso')} 
            style={estilos.btnNav}
            >
            <Text style={estilos.btnNavText}>Progresso dos alunos</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    );
  }
}

const estilos = StyleSheet.create({
    botao: {
      backgroundColor: '#aaaaab',
      padding: 15,
      marginTop: 10,
      alignSelf:'flex-start',
      position: 'absolute',
      borderRadius: 8,
      display: 'flex',
    },
    botaoTexto: {
      color: 'whitesmoke',
      fontSize: 20,
      fontFamily: 'Montserrat',
      fontWeight: '500',
    },
    texto: {
      color: 'whitesmoke',
      fontSize: 24,
      fontFamily: 'Montserrat',
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 10,
    },
    subtexto: {
      color: 'whitesmoke',
      fontSize: 18,
      fontFamily: 'Montserrat',
      fontWeight: '300',
      textAlign: 'center',
      marginTop: 10,
    },
    textoFrase: {
      color:'#a970f7',
      fontSize: 22,
      fontFamily: 'Montserrat',
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 50,
    },
    btnNav: {
      backgroundColor: '#5a2c99',
      padding: 25,
      marginLeft: 300,
      marginRight: 300,
      marginTop: 20,
      borderRadius: 8,
    },
    btnNavText: {
      color: 'whitesmoke',
      fontSize: 23,
      fontFamily: 'Montserrat',
      fontWeight: '500',
      textAlign: 'center',
    },
  });