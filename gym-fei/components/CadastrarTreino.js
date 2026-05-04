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
            alunos: [],
            alunosSelecionados: null,
        }
    }

    componentDidMount(){
        firebase.firestore().collection('usuarios').where('tipo', '==', 'aluno').get().then((snapshot) => {
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
            personalId: usuarioAtual.uid,
            alunoId: this.state.alunoSelecionado,
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

        if(!this.state.alunoSelecionado){
            alert("Selecione um aluno para associar o treino!");
            return;
        }

    }

    render(){
        return (
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
                    style={estilos.input}
                    placeholder="Grupo muscular"
                    placeholderTextColor="gray"
                    value={this.state.grupoMuscular}
                    onChangeText={(texto) => this.setState({ grupoMuscular: texto })}
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

                <TouchableOpacity
                    style={estilos.botao}
                    onPress={() => this.salvar()}
                >
                <Text style={estilos.textoBotao}>Salvar Treino</Text>
                </TouchableOpacity>

                <Text style={estilos.subtitulo}>Selecione o aluno:</Text>

                {this.state.alunos.map((aluno) => (
                <TouchableOpacity
                    key={aluno.id}
                    style={[
                    estilos.alunoItem,
                    this.state.alunoSelecionado === aluno.id && estilos.alunoSelecionado
                    ]}
                    onPress={() => this.setState({ alunoSelecionado: aluno.id })}
                >
                    <Text style={estilos.textoAluno}>{aluno.nome}</Text>
                </TouchableOpacity>
                ))}

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

    botaoVoltar: {
        backgroundColor: '#aaaaab',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
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

    subtitulo: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Montserrat',
    },

    alunoItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    marginBottom: 8,
    },

    alunoSelecionado: {
    borderColor: '#7c47f5',
    backgroundColor: '#1a1a1a',
    },

    textoAluno: {
    color: 'white',
    fontFamily: 'Montserrat',
    },
});