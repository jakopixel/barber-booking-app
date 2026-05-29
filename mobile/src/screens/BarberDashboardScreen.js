import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { request } from '../api/client.js';
import DarkCard from '../components/DarkCard.js';
import DarkButton from '../components/DarkButton.js';
import StatusBadge from '../components/StatusBadge.js';
import Chip from '../components/Chip.js';
import { C, T, SP } from '../constants/theme.js';

export function BarberDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [avail, setAvail] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const { data: appts = [], refetch } = useQuery({ queryKey: ['appt-today', today], queryFn: () => request(`/api/appointments?date=${today}`), enabled: !!user?.barber });
  const { data: sub } = useQuery({ queryKey: ['dash-sub'], queryFn: () => request('/api/subscription/my-subscription'), enabled: !!user?.barber });
  const { data: shop } = useQuery({ queryKey: ['my-shop'], queryFn: () => request('/api/shops/my-shop').catch(() => null), enabled: !!user?.barber });
  const stats = useMemo(() => ({
    total: appts.length,
    pending: appts.filter(a => a.status === 'pending').length,
    revenue: appts.filter(a => a.paymentStatus === 'paid').reduce((n, a) => n + (+a.price || 0), 0)
  }), [appts]);
  const cancel = id => Alert.alert('Cancella', 'Vuoi cancellare questa prenotazione?', [
    { text: 'No' },
    { text: 'Sì', style: 'destructive', onPress: async () => { await request(`/api/appointments/${id}`, { method: 'DELETE' }); qc.invalidateQueries({ queryKey: ['appt-today', today] }); } }
  ]);
  const renderRight = id => <TouchableOpacity onPress={() => cancel(id)} style={s.swipe}><Text style={s.swipeT}>Cancella</Text></TouchableOpacity>;
  const header = <>
    {sub?.subscriptionStatus !== 'active' && <DarkCard style={s.warn}><Text style={s.warnT}>Abbonamento quasi scaduto o inattivo. Rinnova per restare visibile.</Text></DarkCard>}
    <View style={s.stats}>{[
      ['Prenotazioni', stats.total, 'calendar-outline'],
      ['In attesa', stats.pending, 'clock-outline'],
      ['Revenue', `€${stats.revenue}`, 'cash']
    ].map(x => <DarkCard key={x[0]} style={s.stat}><MaterialCommunityIcons name={x[2]} size={24} color={C.p} /><Text style={s.num}>{x[1]}</Text><Text style={s.lab}>{x[0]}</Text></DarkCard>)}</View>
    <DarkCard style={s.avBox}>
      <Text style={s.section}>Disponibilità</Text>
      <View style={s.avRow}><Text style={s.avTxt}>{avail ? 'Aperto' : 'Chiuso'}</Text><Switch value={avail} onValueChange={setAvail} trackColor={{ false: C.border, true: C.p }} thumbColor={C.txt} /></View>
    </DarkCard>
    {!shop && <DarkButton title="Aggiungi Salone" onPress={() => navigation.navigate('CreateShop')} style={{ marginBottom: SP[2] }} />}
    {!!shop && <DarkButton title="Apri Salone" onPress={() => navigation.navigate('ShopProfile', { id: shop.id })} style={{ marginBottom: SP[2], backgroundColor: C.input }} textStyle={{ color: C.txt }} />}
    <Text style={s.section}>Prenotazioni oggi</Text>
  </>;
  return <FlatList
    style={s.bg}
    contentContainerStyle={s.wrap}
    data={appts}
    keyExtractor={i => String(i.id)}
    renderItem={({ item }) => <Swipeable renderRightActions={() => renderRight(item.id)}>
      <DarkCard style={s.item}>
        <View style={s.itemTop}><Text style={s.time}>{new Date(item.dateTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text><StatusBadge status={item.status} /></View>
        <Text style={s.client}>{item.client?.name || 'Cliente'}</Text>
        <Text style={s.srv}>{item.service?.name} · {item.duration} min</Text>
        <Chip text={item.paymentStatus} color={C.input} style={{ marginTop: 10 }} />
      </DarkCard>
    </Swipeable>}
    ListHeaderComponent={header}
    ListEmptyComponent={<DarkCard style={s.empty}><Text style={s.emptyT}>Nessuna prenotazione oggi</Text></DarkCard>}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    refreshControl={null}
  />;
}

export function ShopOwnerDashboard({ navigation }) {
  const { data } = useQuery({ queryKey: ['owner-dash'], queryFn: () => request('/api/owners/dashboard') });
  const vals = useMemo(() => (data?.monthly || [110, 180, 140, 220, 260, 300]), [data]);
  return <View style={s.bg}><FlatList
    contentContainerStyle={s.wrap}
    data={[1]}
    keyExtractor={() => 'x'}
    renderItem={() => <>
      <DarkCard style={s.revenue}><Text style={s.section}>Revenue abbonamenti</Text><Text style={s.rev}>€{data?.revenue || 0}</Text><Text style={s.sub}>{data?.activeBarbers || 0} barbieri attivi</Text></DarkCard>
      <DarkCard style={s.chart}><Text style={s.section}>Revenue mensile</Text><View style={s.bars}>{vals.map((n, i) => <View key={i} style={{ flex: 1, alignItems: 'center' }}><View style={[s.bar, { height: Math.max(36, n / 4) }]} /><Text style={s.cap}>{i + 1}</Text></View>)}</View></DarkCard>
      <Text style={s.section}>Barbieri</Text>
      {(data?.shops || []).flatMap(s => s.barbers || []).map(b => <DarkCard key={b.id} style={s.item}><View style={s.itemTop}><Text style={s.client}>{b.user?.name}</Text><StatusBadge status={b.subscriptionStatus} /></View><Text style={s.srv}>{b.shopName} · {b.specialty}</Text></DarkCard>)}
    </>}
  /></View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  wrap: { padding: 20, paddingBottom: 28 },
  warn: { marginBottom: 12, backgroundColor: C.card, borderColor: C.err },
  warnT: { color: C.txt, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: { flex: 1, alignItems: 'flex-start', gap: 8, padding: 16 },
  num: { color: C.txt, fontSize: 22, fontWeight: '900' },
  lab: { color: C.sub, fontSize: 12, fontWeight: '700' },
  avBox: { marginBottom: 12 },
  avRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avTxt: { color: C.txt, fontWeight: '800', fontSize: T.body },
  section: { color: C.txt, fontSize: T.h2, fontWeight: '900', marginBottom: 12 },
  item: { padding: 16 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 },
  time: { color: C.p, fontSize: 18, fontWeight: '900' },
  client: { color: C.txt, fontSize: T.body, fontWeight: '900' },
  srv: { color: C.sub, marginTop: 4, lineHeight: 20 },
  swipe: { justifyContent: 'center', alignItems: 'center', width: 100, backgroundColor: C.err, borderRadius: 16, marginVertical: 6 },
  swipeT: { color: C.txt, fontWeight: '900' },
  empty: { alignItems: 'center' },
  emptyT: { color: C.sub, fontWeight: '700' },
  revenue: { marginBottom: 12 },
  rev: { color: C.txt, fontSize: 34, fontWeight: '900', marginTop: 6 },
  sub: { color: C.sub, marginTop: 4 },
  chart: { marginBottom: 12 },
  bars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 120, marginTop: 10 },
  bar: { width: 16, borderRadius: 10, backgroundColor: C.p },
  cap: { color: C.sub, marginTop: 6, fontSize: 12, fontWeight: '700' }
});

