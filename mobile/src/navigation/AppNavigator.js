import React from 'react';
import { NavigationContainer, DarkTheme as NavDark } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import AuthScreens from '../screens/AuthScreens.js';
import HomeScreen from '../screens/HomeScreen.js';
import BarberProfileScreen from '../screens/BarberProfileScreen.js';
import AppointmentScreen from '../screens/AppointmentScreen.js';
import OnboardingScreen from '../screens/OnboardingScreen.js';
import SubscriptionScreen from '../screens/SubscriptionScreen.js';
import { BarberDashboardScreen, ShopOwnerDashboard } from '../screens/BarberDashboardScreen.js';
import CreateShopScreen from '../screens/CreateShopScreen.js';
import ShopProfileScreen from '../screens/ShopProfileScreen.js';
import { ServiceSelectionScreen, DateTimePickerScreen, ConfirmationScreen } from '../screens/BookingScreens.js';
import { C } from '../constants/theme.js';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stk = { headerStyle: { backgroundColor: C.bg }, headerTintColor: C.txt, headerTitleStyle: { color: C.txt, fontWeight: '900' }, contentStyle: { backgroundColor: C.bg }, animation: 'fade_from_bottom' };
const tab = ({ route }) => ({ tabBarIcon: ({ color, size }) => {
  const map = { Home: ['home', Ionicons], Appointments: ['calendar-outline', Ionicons], Dashboard: ['grid-outline', Ionicons], Subscription: ['card-outline', Ionicons] };
  const [name, Icon] = map[route.name] || ['ellipse-outline', Ionicons];
  return <Icon name={name} size={size} color={color} />;
}, tabBarActiveTintColor: C.p, tabBarInactiveTintColor: '#888', tabBarStyle: { backgroundColor: C.bg, borderTopColor: C.border, height: 62, paddingBottom: 8, paddingTop: 8 }, tabBarLabelStyle: { fontWeight: '700' }, headerStyle: { backgroundColor: C.bg }, headerTintColor: C.txt, headerTitleStyle: { fontWeight: '900' } });

function AuthStack() {
  return <Stack.Navigator screenOptions={stk} initialRouteName="Login">
    <Stack.Screen name="Login" component={AuthScreens} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={AuthScreens} options={{ headerShown: false }} />
  </Stack.Navigator>;
}

function OnboardingStack() {
  return <Stack.Navigator screenOptions={stk}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Abbonamento' }} />
  </Stack.Navigator>;
}

function Tabs() {
  const { user } = useAuth();
  const dash = user?.role === 'owner' ? ShopOwnerDashboard : BarberDashboardScreen;
  return <Tab.Navigator screenOptions={tab}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="Appointments" component={AppointmentScreen} options={{ title: 'Prenotazioni' }} />
    <Tab.Screen name="Dashboard" component={dash} options={{ title: 'Dashboard' }} />
    {user?.role === 'barber' && <Tab.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Piano' }} />}
  </Tab.Navigator>;
}

function MainStack() {
  return <Stack.Navigator screenOptions={stk} initialRouteName="Tabs">
    <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
    <Stack.Screen name="BarberProfile" component={BarberProfileScreen} options={{ title: 'Profilo' }} />
    <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} options={{ title: 'Servizi' }} />
    <Stack.Screen name="DateTimePicker" component={DateTimePickerScreen} options={{ title: 'Orario' }} />
    <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Conferma' }} />
    <Stack.Screen name="CreateShop" component={CreateShopScreen} options={{ title: 'Crea salone' }} />
    <Stack.Screen name="ShopProfile" component={ShopProfileScreen} options={{ title: 'Salone' }} />
  </Stack.Navigator>;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}><ActivityIndicator color={C.p} /></View>;
  const barberActive = user?.role !== 'barber' || user?.barber?.subscriptionStatus === 'active';
  return <NavigationContainer theme={{ ...NavDark, colors: { ...NavDark.colors, background: C.bg, card: C.bg, text: C.txt, border: C.border, primary: C.p } }}>
    {!user ? <AuthStack /> : user.role === 'barber' && !barberActive ? <OnboardingStack /> : <MainStack />}
  </NavigationContainer>;
}
