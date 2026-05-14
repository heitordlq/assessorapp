import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../screens/Login';
import { Register } from '../screens/Register';
import { Dashboard } from '../screens/Dashboard';
import { Messages } from '../screens/Messages';
import { MessageForm } from '../screens/MessageForm';
import { Reports } from '../screens/Reports';
import { IconButton } from 'react-native-paper';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Messages') {
            iconName = 'message';
          } else if (route.name === 'Reports') {
            iconName = 'chart-bar';
          }

          return <IconButton icon={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Reports" component={Reports} />
    </Tab.Navigator>
  );
}

export function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!signed ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} />
            <Stack.Screen name="MessageForm" component={MessageForm} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 