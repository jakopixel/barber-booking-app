import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { request } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import DarkCard from '../components/DarkCard.js';
import DarkButton from '../components/DarkButton.js';
import StatusBadge from '../components/StatusBadge.js';
import { C, T, SP } from '../constants/theme.js';

export default function SubscriptionScreen() {
  const { user, refresh } = useAuth();
  const { data } = useQuery({ queryKey: ['my-sub'], queryFn: () => request('/api/subscription/my-subscription'), enabled: !!user?.barber });
  const [open, setOpen] = useState(null);
  const sub = data || {};
  const items = useMemo(() => [
    { t: 'Visibilità in ricerca', i: 'check-circle-outline' },
    { t: 'Prenotazioni illimitate', i: 'check-circle-outline' },
    { t: 'Supporto prioritario', i: 'check-circle-outline' }
  ], []);
  const act = async p => { try { const r = await request(p, { method: 'POST' }); if (r.url) await Linking.openURL(r.url); else if (r.sessionId) await Linking.openURL(`https://checkout.stripe.com/pay/${r.sessionId}`); } catch (e) { Alert.alert('Errore', e.message); } };
  const faqs = [
    ['Posso annullare?', 'Sì, dal customer portal Stripe.'],
    ['Ho 7 giorni gratis?', 'Sì, il primo avvio ha la prova gratuita.'],
    ['Cosa succede se scade?', 'Il profilo viene nascosto dalle ricerche.']
  ];
  return <ScrollView style={s.bg} contentContainerStyle={s.wrap}>
    <Text style={s.h1}>Abbonamento</Text>
    <DarkCard style={s.price}>
      <Text style={s.eur}>15€/mese</Text>
      <Text style={s.sub}>Stripe Billing con rinnovo automatico e prova di 7 giorni.</Text>
      <View style={{ marginTop: 14 }}><StatusBadge status={sub.subscriptionStatus || user?.barber?.subscriptionStatus || 'inactive'} /></View>
      <Text style={s.meta}>Scadenza: {sub.endDate ? new Date(sub.endDate).toLocaleDateString('it-IT') : '-'}</Text>
      <View style={{ marginTop: 14 }}>{items.map(x => <View key={x.t} style={s.li}><MaterialCommunityIcons name={x.i} size={20} color={C.ok} /><Text style={s.liT}>{x.t}</Text></View>)}</View>
    </DarkCard>
    <DarkButton title="Inizia Prova 7 Giorni" onPress={() => act('/api/subscription/create-checkout')} />
    <View style={{ height: SP[1] }} />
    <DarkButton title="Gestisci abbonamento" onPress={() => act('/api/subscription/create-customer-portal')} style={{ backgroundColor: C.input }} textStyle={{ color: C.txt }} />
    <View style={{ height: SP[3] }} />
    <Text style={s.h2}>FAQ</Text>
    {faqs.map(([q, a], i) => <DarkCard key={q} style={{ marginTop: 12, padding: 16 }}>
      <TouchableOpacity onPress={() => setOpen(open === i ? null : i)} style={s.faqRow}>
        <Text style={s.q}>{q}</Text>
        <MaterialCommunityIcons name={open === i ? 'chevron-up' : 'chevron-down'} size={22} color={C.p} />
      </TouchableOpacity>
      {open === i && <Text style={s.a}>{a}</Text>}
    </DarkCard>)}
    <View style={{ height: SP[2] }} />
    <TouchableOpacity onPress={refresh}><Text style={s.refresh}>Aggiorna stato</Text></TouchableOpacity>
  </ScrollView>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  wrap: { padding: 20, paddingBottom: 28 },
  h1: { color: C.txt, fontSize: T.h1, fontWeight: '900', marginBottom: 16 },
  h2: { color: C.txt, fontSize: T.h2, fontWeight: '900' },
  price: { borderWidth: 1, borderColor: C.p, backgroundColor: C.card },
  eur: { color: C.txt, fontSize: 30, fontWeight: '900' },
  sub: { color: C.sub, marginTop: 8, lineHeight: 22 },
  meta: { color: C.sub, marginTop: 12, fontWeight: '700' },
  li: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  liT: { color: C.txt, fontWeight: '700' },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  q: { color: C.txt, fontWeight: '900', flex: 1, paddingRight: 12 },
  a: { color: C.sub, marginTop: 12, lineHeight: 22 },
  refresh: { color: C.s, textAlign: 'center', fontWeight: '900' }
});

