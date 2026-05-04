import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import firebase from '../config/config';


export default class CadastrarTreino extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            nome: '',
            grupoMuscular: '',
            exercicios: '',
            objetivo: '',
        }
    }

    salvar(){
        const usuarioAtual = firebase.auth().currentUser;

        if (!usuarioAtual) {
            alert("Usuário não autenticado. Faça login novamente.");
            this.props.navigation.navigate('Login');
            return;
        }
        
        if (this.state.nome.trim() === '' || 
            this.state.grupoMuscular.trim() === '' || 
            this.state.exercicios.trim() === '' || 
            this.state.objetivo.trim() === ''
            ) {
            alert("Preencha todos os campos!");
            return;
        }

        firebase.firestore().collection('treinos').add({
            nome: this.state.nome,
            grupoMuscular: this.state.grupoMuscular,
            exercicios: this.state.exercicios,
            objetivo: this.state.objetivo,
            personalId: usuarioAtual.uid
        })
        .then(() => {
            alert("Treino cadastrado com sucesso!");

            this.setState({
                nome: '',
                grupoMuscular: '',
                exercicios: '',
                objetivo: '',
            });

            this.props.navigation.navigate('HomeAdmin');
        })
        .catch((error) => {
            alert("Ocorreu um erro inesperado: " + error.message);
        });

    }

    render(){
        return (
            <View style={estilos.container}>
                <Text style={estilos.titulo}>Cadastrar Treino</Text>

                <TextInput
                    style={estilos.input}
                    placeholder="Nome do treino"
                    placeholderTextColor="gray"
                    value={this.state.nome}
                    onChangeText={(texto) => this.setState({ nome: texto })}
                />

                <TextInput
                    style={estilos.input}
                    placeholder="Grupo muscular"
                    placeholderTextColor="gray"
                    value={this.state.grupoMuscular}
                    onChangeText={(texto) => this.setState({ grupoMuscular: texto })}
                />

                <TextInput
                    style={estilos.input}
                    placeholder="Exercícios"
                    placeholderTextColor="gray"
                    value={this.state.exercicios}
                    onChangeText={(texto) => this.setState({ exercicios: texto })}
                />

                <TextInput
                    style={[estilos.input, estilos.textArea]}
                    placeholder="objetivo"
                    placeholderTextColor="gray"
                    multiline={true}
                    value={this.state.objetivo}
                    onChangeText={(texto) => this.setState({ objetivo: texto })}
                />

                <TouchableOpacity
                    style={estilos.botao}
                    onPress={() => this.salvar()}
                >
                <Text style={estilos.textoBotao}>Salvar Treino</Text>
                </TouchableOpacity>
            </View>
            );
    }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070706',
    padding: 25,
    justifyContent: 'center',
  },

  titulo: {
    color: 'whitesmoke',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 15,
    color: 'whitesmoke',
    fontSize: 18,
    fontFamily: 'Montserrat',
    marginBottom: 15,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  botao: {
    backgroundColor: '#7c47f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

  textoBotao: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
  },
});