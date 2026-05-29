import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { request } from '../api/client.js';

export default function BarberProfileScreen({ route, navigation }) {
  const { id } = route.params;
  const { data, isLoading } = useQuery({ queryKey: ['barber', id], queryFn: () => request(`/api/barbers/${id}`) });
  const bar = data;
  const book = () => bar?.subscriptionStatus !== 'active' ? Alert.alert('Non disponibile', 'Questo barbiere non è disponibile al momento') : navigation.navigate('ServiceSelection', { barberId: id });
  if (isLoading) return <View style={s.wrap}><Text>Loading...</Text></View>;
  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 24 }}>
      <Image source={{ uri: bar.photo || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900' }} style={s.img} />
      <View style={s.card}>
        <Text style={s.name}>{bar.user?.name}</Text>
        <Text style={s.shop}>{bar.shopName}</Text>
        <Text style={s.meta}>⭐ {bar.rating?.toFixed?.(1) || '0.0'} • {bar.specialty}</Text>
        <Text style={s.bio}>{bar.bio}</Text>
        <TouchableOpacity style={s.btn} onPress={book}><Text style={s.btnT}>Prenota</Text></TouchableOpacity>
      </View>
      <Text style={s.sec}>Servizi</Text>
      {(bar.services || []).map(srv => <View key={srv.id} style={s.item}><Text style={s.i1}>{srv.name}</Text><Text>€{srv.price} · {srv.duration} min</Text></View>)}
      <Text style={s.sec}>Recensioni</Text>
      {(bar.reviews || []).map(r => <View key={r.id} style={s.item}><Text style={s.i1}>⭐ {r.rating}</Text><Text>{r.comment || '-'}</Text></View>)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea' },
  img: { width: '100%', height: 260 },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 8 },
  name: { fontSize: 26, fontWeight: '900' },
  shop: { color: '#666' },
  meta: { fontWeight: '700' },
  bio: { color: '#333', lineHeight: 22 },
  btn: { marginTop: 8, backgroundColor: '#111', padding: 14, borderRadius: 14, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '800' },
  sec: { marginHorizontal: 16, marginTop: 4, marginBottom: 8, fontSize: 18, fontWeight: '800' },
  item: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fff', padding: 14, borderRadius: 14, gap: 4 },
  i1: { fontWeight: '800' }
});

