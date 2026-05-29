import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BarberCard({ item, onPress }) {
  const img = item.photo || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600';
  return (
    <TouchableOpacity onPress={onPress} style={s.card}>
      <Image source={{ uri: img }} style={s.img} />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.user?.name || item.shopName}</Text>
        <Text style={s.shop}>{item.shopName}</Text>
        <View style={s.row}>
          <Text style={s.meta}><Ionicons name="star" size={12} /> {item.rating?.toFixed?.(1) ?? '0.0'}</Text>
          <Text style={s.meta}>📍 {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km` : 'N/A'}</Text>
        </View>
        <Text style={s.tag}>{item.specialty}</Text>
      </View>
      <Text style={s.cta}>Profilo</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#ececec', alignItems: 'center' },
  img: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '800', color: '#111' },
  shop: { color: '#666', marginTop: 2 },
  row: { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  meta: { color: '#444', fontSize: 12 },
  tag: { marginTop: 6, color: '#111', fontWeight: '700' },
  cta: { color: '#fff', backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, overflow: 'hidden', fontWeight: '700' }
});

