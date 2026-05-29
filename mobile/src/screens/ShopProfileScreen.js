import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { request } from '../api/client.js';
import DarkCard from '../components/DarkCard.js';
import BarberCard from '../components/BarberCard.js';
import DarkButton from '../components/DarkButton.js';
import { C, T, SP } from '../constants/theme.js';

export default function ShopProfileScreen({ route, navigation }) {
  const { id } = route.params;
  const { data, isLoading } = useQuery({ queryKey: ['shop', id], queryFn: () => request(`/api/shops/${id}`) });
  const openMap = () => {
    const q = encodeURIComponent(data?.address || '');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => Alert.alert('Errore', 'Mappa non disponibile'));
  };
  if (isLoading) return <View style={s.bg} />;
  return <ScrollView style={s.bg} contentContainerStyle={s.wrap}>
    <Image source={{ uri: data?.photo || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200' }} style={s.hero} />
    <DarkCard style={s.card}>
      <Text style={s.title}>{data?.name}</Text>
      <View style={s.line}><MaterialCommunityIcons name="map-marker-outline" size={18} color={C.p} /><Text style={s.txt}>{data?.address}</Text></View>
      <View style={s.line}><MaterialCommunityIcons name="phone-outline" size={18} color={C.p} /><Text style={s.txt}>{data?.phone}</Text></View>
      {!!data?.openingHours && <Text style={s.sub}>Orari: {data.openingHours}</Text>}
      {!!data?.description && <Text style={s.sub}>{data.description}</Text>}
      <View style={{ height: SP[1] }} />
      <DarkButton title="Mappa" onPress={openMap} />
    </DarkCard>
    <Text style={s.sec}>Barbieri</Text>
    {(data?.barbers || []).map(b => <View key={b.id} style={{ marginBottom: 12 }}><BarberCard item={b} onPress={() => navigation.navigate('BarberProfile', { id: b.id })} onBook={() => navigation.navigate('BarberProfile', { id: b.id })} /></View>)}
  </ScrollView>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  wrap: { paddingBottom: 28 },
  hero: { width: '100%', height: 260, backgroundColor: C.input },
  card: { margin: 20, marginTop: -28 },
  title: { color: C.txt, fontSize: 28, fontWeight: '900', marginBottom: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  txt: { color: C.txt, fontWeight: '700', flex: 1 },
  sub: { color: C.sub, lineHeight: 22, marginTop: 4 },
  sec: { color: C.txt, fontSize: T.h2, fontWeight: '900', marginHorizontal: 20, marginTop: 8, marginBottom: 12 }
});

