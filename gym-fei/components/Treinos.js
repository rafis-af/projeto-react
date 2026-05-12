import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Button, Touchable, Image } from "react-native";
import firebase from '../config/config';
import IniciarTreino from "./IniciarTreino";
import ScreenContainer from '../components/ScreenContainer';

export default class Treinos extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            treinos: [],
            imagem: '',
        }
    }

    componentDidMount() {
        const usuario = firebase.auth().currentUser;
        if(!usuario) {  
            alert("Usuário não autenticado. Faça login novamente.");
            this.props.navigation.navigate('Login');
            return;
        }

        firebase.firestore().collection('treinos').where('alunoId', '==', usuario.uid).get()
            .then((snapshot) => {
                let treinos = [];

                snapshot.forEach((doc) => {
                    treinos.push({ id: doc.id, ...doc.data() });
                });

                this.setState({ treinos : treinos});

            })
            .catch((error) => {
                alert("Ocorreu um erro inesperado: " + error.message);
            });

    }

    render() {
        const imagensMap = {
            peito: require('../assets/img/peitoral.png'),
            costas: require('../assets/img/costas.png'),
            pernas: require('../assets/img/pernas.png'),
            bracos: require('../assets/img/bracos.png'),
            ombros: require('../assets/img/ombros.png'),
        };


        return (
        <View style={estilos.container}>
            <Text style={estilos.titulo}>Treinos disponíveis</Text>
            <Text style={estilos.texto}>Selecione um treino para iniciar</Text>

            <TouchableOpacity
                style={estilos.btnVoltar}
                onPress={() => this.props.navigation.goBack()}
            >
                <Text style={estilos.btnVoltarTexto}>Voltar</Text>
            </TouchableOpacity>

            {this.state.treinos.length === 0 && (
                <Text style={estilos.texto}>Nenhum treino encontrado.</Text>
            )}

            <FlatList
                data={this.state.treinos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity   
                        style={estilos.card}>
                        <Text style={estilos.nome}>{item.nome}</Text>
                        <Text style={estilos.texto}>Grupo: {item.grupoMuscular}</Text>
                        <Text style={estilos.texto}>Objetivo: {item.objetivo}</Text>
                        <Image 
                            source={imagensMap[item.imagem]}
                            style={{
                                width: 200,
                                height: 200,
                                alignSelf: 'center',
                                marginTop: 15,
                            }}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={estilos.btnIniciar} 
                            onPress={() => this.props.navigation.navigate('IniciarTreino', { treino: item })}
                        >
                            <Text style={estilos.btnIniciarTexto}>Iniciar Treino</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />
        </View>
        );
    }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070706',
    padding: 20,
    paddingTop:90,
  },
  titulo: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat',
  },
  card: {
    backgroundColor: '#171717',
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#7c47f5',
  },
  nome: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  texto: {
    color: '#ccc',
    fontSize: 20,
    marginTop: 5,
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  btnIniciar: {
    marginTop: 10,
    backgroundColor: '#7c47f5',
    padding: 20,
    borderRadius: 8,
  },
  btnIniciarTexto: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },
  btnVoltar: {
    backgroundColor: '#aaaaab',
    padding: 15,
    marginBottom: 20,
    marginTop:20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  btnVoltarTexto: {
    fontSize: 18,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },
});