import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import Cadastro from '../components/Cadastro'
import Login from '../components/Login'
import HomeUsuario from '../components/HomeUsuario'
import HomeAdmin from '../components/HomeAdmin'
import CadastrarTreino from '../components/CadastrarTreino';
import GerenciarTreino from '../components/GerenciarTreino';
import Treinos from '../components/Treinos';
import IniciarTreino from '../components/IniciarTreino';
import ProgressoAluno from '../components/ProgressoAluno';

const Stack = createNativeStackNavigator();

export default class AppNavigator extends React.Component {
  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName = "Login">
          <Stack.Screen 
            name="Cadastro" 
            component={Cadastro} 
            options={{headerShown:false}}            
            />

          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{headerShown:false}}
          />
          
          <Stack.Screen 
            name="HomeUsuario" 
            component={HomeUsuario}  
            options={{headerShown:false}}
          />

          <Stack.Screen 
            name="HomeAdmin" 
            component={HomeAdmin}  
            options={{headerShown:false}}
          />

          <Stack.Screen
            name="CadastrarTreino"
            component={CadastrarTreino}
            options={{headerShown:false}}
          />

          <Stack.Screen
            name="Treinos"
            component={Treinos}
            options={{headerShown:false}}
          />
          <Stack.Screen
            name="GerenciarTreino"
            component={GerenciarTreino}
            options={{headerShown:false}}
          />

          <Stack.Screen
            name="IniciarTreino"
            component={IniciarTreino}
            options={{headerShown:false}}
            /> 

          <Stack.Screen
            name="ProgressoAluno"
            component={ProgressoAluno}
            options={{headerShown:false}}
          />
          
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
  