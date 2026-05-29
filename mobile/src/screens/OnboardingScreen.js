import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={s.wrap}>
      <Text style={s.kicker}>Barber Pro</Text>
      <Text style={s.title}>15€/mese per restare visibile e ricevere prenotazioni.</Text>
      <Text style={s.txt}>Prova gratuita di 7 giorni per i nuovi barbieri. Dopo il trial, Stripe rinnova automaticamente.</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Subscription')}><Text style={s.btnText}>Inizia prova 7 giorni gratis</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#111' },
  kicker: { color: '#c8b88a', fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 12 },
  txt: { color: '#cfcfcf', marginTop: 12, lineHeight: 22 },
  btn: { backgroundColor: '#fff', marginTop: 24, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#111', fontWeight: '900' }
});

