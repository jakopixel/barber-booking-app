import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { request } from '../api/client.js';

export default function AppointmentScreen() {
  const [tab, setTab] = useState('upcoming');
  const { data = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => request('/api/appointments') });
  const items = useMemo(() => data.filter(a => tab === 'upcoming' ? ['pending', 'confirmed'].includes(a.status) : a.status === 'completed'), [data, tab]);
  return <View style={s.wrap}>
    <View style={s.tabs}>{['upcoming', 'completed'].map(x => <TouchableOpacity key={x} onPress={() => setTab(x)} style={[s.tab, tab === x && s.tabOn]}><Text style={tab === x ? s.tabOnT : s.tabT}>{x}</Text></TouchableOpacity>)}</View>
    <FlatList data={items} keyExtractor={i => i.id} renderItem={({ item }) => <View style={s.card}><Text style={s.h1}>{item.service?.name}</Text><Text>{new Date(item.dateTime).toLocaleString('it-IT')}</Text><Text>{item.status} • {item.paymentStatus}</Text></View>} />
  </View>;
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea', padding: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#ddd' },
  tabOn: { backgroundColor: '#111', borderColor: '#111' },
  tabT: { color: '#111', fontWeight: '700' },
  tabOnT: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10 },
  h1: { fontWeight: '800', marginBottom: 4 }
});

