import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { request } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export default function SubscriptionScreen() {
  const { user, refresh } = useAuth();
  const { data } = useQuery({ queryKey: ['my-sub'], queryFn: () => request('/api/subscription/my-subscription'), enabled: !!user?.barber });
  const bar = data?.barber || user?.barber;
  const sub = data?.subscription;
  const act = async urlPath => {
    try { const { url } = await request(urlPath, { method: 'POST' }); await Linking.openURL(url); } catch (e) { Alert.alert('Errore', e.message); }
  };
  return (
    <View style={s.wrap}>
      <Text style={s.t1}>Piano 15€/mese</Text>
      <Text style={s.t2}>Stripe Billing con rinnovo automatico.</Text>
      <View style={s.card}>
        <Text style={s.row}>Stato: <Text style={s.bold}>{bar?.subscriptionStatus || 'inactive'}</Text></Text>
        <Text style={s.row}>Scadenza: <Text style={s.bold}>{bar?.subscriptionEndDate ? new Date(bar.subscriptionEndDate).toLocaleDateString('it-IT') : '-'}</Text></Text>
        <Text style={s.row}>Abbonamento: <Text style={s.bold}>{sub?.status || 'nessuno'}</Text></Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => act('/api/subscription/create-checkout')}><Text style={s.bt}>Abbonati con Stripe</Text></TouchableOpacity>
      <TouchableOpacity style={[s.btn, s.alt]} onPress={() => act('/api/subscription/create-customer-portal')}><Text style={s.bt2}>Gestisci abbonamento</Text></TouchableOpacity>
      <TouchableOpacity onPress={refresh}><Text style={s.link}>Aggiorna stato</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea', padding: 20, gap: 12 },
  t1: { fontSize: 28, fontWeight: '900', color: '#111' },
  t2: { color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 8 },
  row: { color: '#333' },
  bold: { fontWeight: '800', color: '#111' },
  btn: { backgroundColor: '#111', padding: 16, borderRadius: 14, alignItems: 'center' },
  alt: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  bt: { color: '#fff', fontWeight: '800' },
  bt2: { color: '#111', fontWeight: '800' },
  link: { color: '#111', textAlign: 'center', fontWeight: '700', marginTop: 4 }
});

