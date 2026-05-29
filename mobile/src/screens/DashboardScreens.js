import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { request } from '../api/client.js';

export function BarberDashboardScreen() {
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  const { data: appts = [] } = useQuery({ queryKey: ['barber-day'], queryFn: () => request(`/api/appointments?date=${new Date().toISOString().slice(0, 10)}`), enabled: !!user?.barber });
  const { data } = useQuery({ queryKey: ['barber-sub'], queryFn: () => request('/api/subscription/my-subscription'), enabled: !!user?.barber });
  const bar = data?.barber || user?.barber;
  const soon = bar?.subscriptionEndDate && (new Date(bar.subscriptionEndDate).getTime() - Date.now()) / 86400000 <= 3;
  const stats = useMemo(() => ({ total: appts.length, confirmed: appts.filter(x => x.status === 'confirmed').length, revenue: appts.filter(x => x.paymentStatus === 'paid').reduce((a, b) => a + (+b.price || 0), 0) }), [appts]);
  return <View style={s.wrap}>
    {soon && <View style={s.warn}><Text style={s.warnT}>Il tuo abbonamento scade il {new Date(bar.subscriptionEndDate).toLocaleDateString('it-IT')}</Text></View>}
    <Text style={s.title}>Oggi</Text>
    <View style={s.grid}>
      <View style={s.card}><Text style={s.n}>{stats.total}</Text><Text>Prenotazioni</Text></View>
      <View style={s.card}><Text style={s.n}>{stats.confirmed}</Text><Text>Confermate</Text></View>
      <View style={s.card}><Text style={s.n}>€{stats.revenue}</Text><Text>Revenue</Text></View>
    </View>
    <View style={s.row}><Text>Disponibile</Text><Switch value={open} onValueChange={setOpen} /></View>
    <TouchableOpacity style={s.btn} onPress={() => Alert.alert('Info', 'Disponibilità aggiornata localmente')}><Text style={s.btnT}>Salva</Text></TouchableOpacity>
  </View>;
}

export function ShopOwnerDashboard() {
  const { data } = useQuery({ queryKey: ['owner-dashboard'], queryFn: () => request('/api/owners/dashboard') });
  return <View style={s.wrap}>
    <Text style={s.title}>Owner Dashboard</Text>
    <View style={s.card}><Text style={s.n}>€{data?.revenue || 0}</Text><Text>Revenue abbonamenti</Text></View>
    <View style={s.card}><Text style={s.n}>{data?.activeBarbers || 0}</Text><Text>Barbieri attivi</Text></View>
  </View>;
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea', padding: 16, gap: 12 },
  warn: { backgroundColor: '#111', padding: 12, borderRadius: 14 },
  warnT: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '900' },
  grid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, minWidth: '30%', flexGrow: 1 },
  n: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14 },
  btn: { backgroundColor: '#111', padding: 14, borderRadius: 14, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '800' }
});
