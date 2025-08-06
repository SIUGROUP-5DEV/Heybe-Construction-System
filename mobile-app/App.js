import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CarsScreen from './src/screens/CarsScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// API Service
import { setAuthToken } from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Cars') {
            iconName = 'directions-car';
          } else if (route.name === 'Customers') {
            iconName = 'people';
          } else if (route.name === 'Invoices') {
            iconName = 'receipt';
          } else if (route.name === 'Payments') {
            iconName = 'payment';
          } else if (route.name === 'Reports') {
            iconName = 'assessment';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cars" component={CarsScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Stored token:', token ? 'Found' : 'Not found');
      
      if (token) {
        setAuthToken(token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Loading screen
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Main" component={TabNavigator} />
          ) : (
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}