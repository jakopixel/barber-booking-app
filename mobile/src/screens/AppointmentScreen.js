import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { request } from '../api/client.js';
import DarkCard from '../components/DarkCard.js';
import StatusBadge from '../components/StatusBadge.js';
import EmptyState from '../components/EmptyState.js';
import { C, T } from '../constants/theme.js';

export default function AppointmentScreen() {
  const [tab, setTab] = useState('upcoming');
  const { data = [], refetch, isRefetching } = useQuery({ queryKey: ['appointments'], queryFn: () => request('/api/appointments') });
  const items = useMemo(() => data.filter(a => tab === 'upcoming' ? ['pending', 'confirmed'].includes(a.status) : a.status === 'completed'), [data, tab]);
  const cancel = id => Alert.alert('Cancella', 'Vuoi cancellare la prenotazione?', [
    { text: 'No' },
    { text: 'Sì', style: 'destructive', onPress: async () => { await request(`/api/appointments/${id}`, { method: 'DELETE' }); refetch(); } }
  ]);
  const right = id => <TouchableOpacity onPress={() => cancel(id)} style={s.swipe}><Text style={s.swipeT}>Cancella</Text></TouchableOpacity>;
  return <View style={s.bg}>
    <View style={s.tabs}>{['upcoming', 'completed'].map(x => <TouchableOpacity key={x} onPress={() => setTab(x)} style={[s.tab, tab === x && s.tabOn]}><Text style={tab === x ? s.tabOnT : s.tabT}>{x}</Text></TouchableOpacity>)}</View>
    <FlatList
      data={items}
      keyExtractor={i => String(i.id)}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.p} colors={[C.p]} />}
      contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
      renderItem={({ item }) => <Swipeable renderRightActions={() => right(item.id)}>
        <DarkCard style={s.card}>
          <View style={s.row}><Text style={s.time}>{new Date(item.dateTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text><StatusBadge status={item.status} /></View>
          <Text style={s.h1}>{item.service?.name}</Text>
          <View style={s.line}><MaterialCommunityIcons name="account-outline" size={16} color={C.p} /><Text style={s.txt}>{item.client?.name || 'Cliente'}</Text></View>
          <View style={s.line}><MaterialCommunityIcons name="cash" size={16} color={C.s} /><Text style={s.txt}>{item.paymentStatus} • €{item.price}</Text></View>
        </DarkCard>
      </Swipeable>}
      ListEmptyComponent={<EmptyState icon="calendar-remove" title="Nessuna prenotazione" text="Le tue prenotazioni appariranno qui." />}
    />
  </View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg, padding: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  tabOn: { backgroundColor: C.p, borderColor: C.p },
  tabT: { color: C.txt, fontWeight: '700' },
  tabOnT: { color: C.txt, fontWeight: '900' },
  card: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  time: { color: C.p, fontSize: 18, fontWeight: '900' },
  h1: { color: C.txt, fontSize: T.h2, fontWeight: '900', marginBottom: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  txt: { color: C.sub, fontWeight: '700' },
  swipe: { justifyContent: 'center', alignItems: 'center', width: 96, backgroundColor: C.err, borderRadius: 16, marginVertical: 6 },
  swipeT: { color: C.txt, fontWeight: '900' }
});
