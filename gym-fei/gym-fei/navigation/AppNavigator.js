import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import Cadastro from '../components/Cadastro'
import Login from '../components/Login'
import Home from '../components/Home'

const Stack = createNativeStackNavigator();

export default class AppNavigator extends React.Component {
  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName = "Home">
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
            name="Home" 
            component={Home}  
            options={{headerShown:false}}
          />

        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
  