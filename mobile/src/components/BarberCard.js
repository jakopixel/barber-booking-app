import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DarkCard from './DarkCard.js';
import DarkButton from './DarkButton.js';
import RatingStars from './RatingStars.js';
import Chip from './Chip.js';
import { C, T, SP } from '../constants/theme.js';

export default function BarberCard({ item, onPress, onBook }) {
  const img = item.photo || item.shop?.photo || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900';
  return <DarkCard style={s.card}>
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: img }} style={s.img} />
      <View style={s.box}>
        <View style={s.row}><Text style={s.name}>{item.user?.name || item.shopName}</Text><MaterialCommunityIcons name="chevron-right" size={20} color={C.sub} /></View>
        <Text style={s.shop}>{item.shop?.name || item.shopName}</Text>
        <View style={s.metaRow}>
          <RatingStars value={item.rating || 0} size={16} />
          <View style={s.meta}><MaterialCommunityIcons name="map-marker-outline" size={14} color={C.p} /><Text style={s.metaT}>{item.distance != null ? `${item.distance.toFixed(1)} km` : 'N/A'}</Text></View>
        </View>
        <View style={s.chips}><Chip text={item.specialty} /><Chip text={item.shop?.address?.split(',')[0] || 'Salone'} color={C.input} /></View>
      </View>
    </TouchableOpacity>
    <DarkButton title="Prenota" onPress={onBook || onPress} style={{ marginTop: 16 }} />
  </DarkCard>;
}

const s = StyleSheet.create({
  card: { padding: 16 },
  img: { width: '100%', height: 170, borderRadius: 12, backgroundColor: C.input, marginBottom: SP[2] },
  box: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: C.txt, fontSize: T.h2, fontWeight: '900', flex: 1, paddingRight: 12 },
  shop: { color: C.sub, fontSize: T.body },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaT: { color: C.sub, fontSize: 12, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 2 }
});
