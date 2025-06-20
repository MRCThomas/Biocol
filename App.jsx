// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import SearchScreen from './src/screens/SearchScreen';
import OperatorDetailScreen from './src/screens/OperatorDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Search" 
      component={SearchScreen} 
      options={{ title: 'Recherche Bio' }}
    />
    <Stack.Screen 
      name="OperatorDetail" 
      component={OperatorDetailScreen} 
      options={{ title: 'Détails Opérateur' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'SearchTab') {
                iconName = 'search';
              } else if (route.name === 'Favorites') {
                iconName = 'favorite';
              } else if (route.name === 'Preferences') {
                iconName = 'settings';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="SearchTab" 
            component={SearchStack} 
            options={{ title: 'Recherche', headerShown: false }}
          />
          <Tab.Screen 
            name="Favorites" 
            component={FavoritesScreen} 
            options={{ title: 'Favoris' }}
          />
          <Tab.Screen 
            name="Preferences" 
            component={PreferencesScreen} 
            options={{ title: 'Préférences' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
