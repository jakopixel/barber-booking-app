import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DarkCard from '../components/DarkCard.js';
import DarkButton from '../components/DarkButton.js';
import { C, T, SP } from '../constants/theme.js';

export default function OnboardingScreen({ navigation }) {
  return <LinearGradient colors={['#2a1240', '#121212', '#0e0e0e']} style={s.bg}>
    <View style={s.wrap}>
      <Text style={s.kicker}>Barber Pro</Text>
      <Text style={s.title}>15€/mese per restare visibile e ricevere prenotazioni.</Text>
      <Text style={s.sub}>Prova gratuita di 7 giorni per i nuovi barbieri. Poi rinnovo automatico con Stripe.</Text>
      <DarkCard style={s.card}>
        {[['search', 'Ricerca attiva'], ['calendar-check-outline', 'Prenotazioni'], ['store-outline', 'Salone e servizi']].map(x => <View key={x[0]} style={s.li}><MaterialCommunityIcons name={x[0]} size={20} color={C.s} /><Text style={s.liT}>{x[1]}</Text></View>)}
      </DarkCard>
      <View style={{ height: SP[2] }} />
      <DarkButton title="Inizia prova 7 giorni gratis" onPress={() => navigation.navigate('Subscription')} />
    </View>
  </LinearGradient>;
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, padding: 20, justifyContent: 'center' },
  kicker: { color: C.s, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: C.txt, fontSize: 32, fontWeight: '900', marginTop: 12, lineHeight: 40 },
  sub: { color: C.sub, marginTop: 12, lineHeight: 22, fontSize: T.body },
  card: { marginTop: 20 },
  li: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  liT: { color: C.txt, fontWeight: '800' }
});
