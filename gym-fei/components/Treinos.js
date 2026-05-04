import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import firebase from '../config/config';

export default class Treinos extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            treinos: [],
        }
    }

    componentDidMount() {
        firebase.firestore().collection('treinos').get()
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
        return (
        <View style={estilos.container}>
            <Text style={estilos.titulo}>Treinos disponíveis</Text>

            <FlatList
                data={this.state.treinos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={estilos.card}>
                        <Text style={estilos.nome}>{item.nome}</Text>
                        <Text style={estilos.texto}>Grupo: {item.grupoMuscular}</Text>
                        <Text style={estilos.texto}>Objetivo: {item.objetivo}</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  texto: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'Montserrat',
  },
});