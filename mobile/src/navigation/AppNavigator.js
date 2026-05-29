import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import AuthScreen from '../screens/AuthScreen.js';
import HomeScreen from '../screens/HomeScreen.js';
import BarberProfileScreen from '../screens/BarberProfileScreen.js';
import { ServiceSelectionScreen, DateTimePickerScreen, ConfirmationScreen } from '../screens/BookingScreens.js';
import AppointmentScreen from '../screens/AppointmentScreen.js';
import OnboardingScreen from '../screens/OnboardingScreen.js';
import SubscriptionScreen from '../screens/SubscriptionScreen.js';
import { BarberDashboardScreen, ShopOwnerDashboard } from '../screens/DashboardScreens.js';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  const barberActive = user?.role !== 'barber' || user?.barber?.subscriptionStatus === 'active';
  return (
    <NavigationContainer>
      <Stack.Navigator key={user?.id || 'guest'} screenOptions={{ headerTitleStyle: { fontWeight: '800' } }} initialRouteName={user ? (user.role === 'barber' && !barberActive ? 'Onboarding' : 'Home') : 'Login'}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="Register" component={AuthScreen} />
          </>
        ) : (
          <>
            {user.role === 'barber' && !barberActive && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
            {user.role === 'barber' && <Stack.Screen name="Subscription" component={SubscriptionScreen} />}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="BarberProfile" component={BarberProfileScreen} />
            <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
            <Stack.Screen name="DateTimePicker" component={DateTimePickerScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="Appointments" component={AppointmentScreen} />
            <Stack.Screen name="BarberDashboard" component={BarberDashboardScreen} />
            <Stack.Screen name="ShopOwnerDashboard" component={ShopOwnerDashboard} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

