import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { request } from '../api/client.js';
import DarkCard from '../components/DarkCard.js';
import DarkButton from '../components/DarkButton.js';
import RatingStars from '../components/RatingStars.js';
import Chip from '../components/Chip.js';
import { C, T, SP } from '../constants/theme.js';

export default function BarberProfileScreen({ route, navigation }) {
  const { id } = route.params;
  const { data: bar, isLoading } = useQuery({ queryKey: ['barber', id], queryFn: () => request(`/api/barbers/${id}`) });
  const book = () => bar?.subscriptionStatus !== 'active' ? Alert.alert('Non disponibile', 'Questo barbiere non è disponibile al momento') : navigation.navigate('ServiceSelection', { barberId: id });
  if (isLoading) return <View style={s.bg} />;
  return <View style={s.bg}>
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={s.heroWrap}>
        <Image source={{ uri: bar?.photo || bar?.shop?.photo || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200' }} style={s.hero} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={s.overlay} />
        <View style={s.heroText}>
          <Text style={s.name}>{bar?.user?.name}</Text>
          <Text style={s.shop}>{bar?.shop?.name || bar?.shopName}</Text>
          <View style={s.row}><RatingStars value={bar?.rating || 0} /><Text style={s.dist}>{bar?.specialty}</Text></View>
        </View>
      </View>
      <DarkCard style={{ margin: 20, marginTop: -20 }}>
        <Text style={s.bio}>{bar?.bio || 'Nessuna bio disponibile.'}</Text>
        <View style={{ height: SP[2] }} />
        <Chip text={bar?.specialty || 'Specialty'} />
      </DarkCard>
      <Text style={s.sec}>Servizi</Text>
      {(bar?.services || []).map(srv => <DarkCard key={srv.id} style={s.item}><View style={s.itemRow}><Text style={s.srv}>{srv.name}</Text><Text style={s.price}>€{srv.price}</Text></View><View style={s.itemRow}><View style={s.meta}><MaterialCommunityIcons name="clock-outline" size={16} color={C.p} /><Text style={s.metaT}>{srv.duration} min</Text></View></View></DarkCard>)}
      <Text style={s.sec}>Recensioni</Text>
      {(bar?.reviews || []).map(r => <DarkCard key={r.id} style={s.item}><View style={s.itemRow}><RatingStars value={r.rating} size={16} /><Text style={s.date}>{new Date(r.createdAt).toLocaleDateString('it-IT')}</Text></View><Text style={s.bio}>{r.comment || '-'}</Text></DarkCard>)}
    </ScrollView>
    <View style={s.bottom}><DarkButton title="Prenota Ora" onPress={book} /></View>
  </View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 320, backgroundColor: C.input },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  name: { color: C.txt, fontSize: 28, fontWeight: '900' },
  shop: { color: C.s, fontSize: 18, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  dist: { color: C.sub, fontWeight: '800' },
  bio: { color: C.sub, lineHeight: 22 },
  sec: { color: C.txt, fontSize: T.h2, fontWeight: '900', marginHorizontal: 20, marginTop: 12, marginBottom: 12 },
  item: { marginHorizontal: 20, marginBottom: 12, padding: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  srv: { color: C.txt, fontWeight: '900', fontSize: T.body, flex: 1, paddingRight: 10 },
  price: { color: C.s, fontWeight: '900' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaT: { color: C.sub, fontWeight: '700' },
  date: { color: C.sub, fontSize: T.cap, fontWeight: '700' },
  bottom: { position: 'absolute', left: 20, right: 20, bottom: 18 }
});

