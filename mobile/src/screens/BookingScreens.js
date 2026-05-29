import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { useStripe } from '@stripe/stripe-react-native';
import { request } from '../api/client.js';

const slots = d => [...Array(20)].map((_, i) => {
  const x = new Date(d); x.setHours(9 + Math.floor(i / 2), i % 2 ? 30 : 0, 0, 0); return x;
}).filter(x => x.getHours() < 19);

export function ServiceSelectionScreen({ route, navigation }) {
  const { barberId } = route.params;
  const { data = [] } = useQuery({ queryKey: ['services', barberId], queryFn: () => request(`/api/barbers/${barberId}/services`) });
  return <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, gap: 12 }}>
    <Text style={s.title}>Scegli servizio</Text>
    {data.map(srv => <TouchableOpacity key={srv.id} style={s.card} onPress={() => navigation.navigate('DateTimePicker', { barberId, service: srv })}><Text style={s.h1}>{srv.name}</Text><Text>€{srv.price} • {srv.duration} min</Text></TouchableOpacity>)}
  </ScrollView>;
}

export function DateTimePickerScreen({ route, navigation }) {
  const { barberId, service } = route.params;
  const [day, setDay] = useState(new Date());
  const [slot, setSlot] = useState(null);
  const list = useMemo(() => slots(day), [day]);
  return <View style={s.wrap}><View style={s.pad}>
    <Text style={s.title}>Scegli data e orario</Text>
    <DateTimePicker value={day} mode="date" display="default" onChange={(_, d) => d && setDay(d)} />
    <View style={s.grid}>{list.map(x => <TouchableOpacity key={x.toISOString()} style={[s.slot, slot?.toISOString() === x.toISOString() && s.slotOn]} onPress={() => setSlot(x)}><Text style={slot?.toISOString() === x.toISOString() ? s.slotOnT : s.slotT}>{x.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text></TouchableOpacity>)}</View>
    <TouchableOpacity disabled={!slot} style={[s.btn, !slot && { opacity: .5 }]} onPress={() => navigation.navigate('Confirmation', { barberId, service, dateTime: slot.toISOString() })}><Text style={s.btnT}>Avanti</Text></TouchableOpacity>
  </View></View>;
}

export function ConfirmationScreen({ route, navigation }) {
  const { barberId, service, dateTime } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const pay = async () => {
    try {
      const appt = await request('/api/appointments', { method: 'POST', body: { barberId, serviceId: service.id, dateTime } });
      const { clientSecret } = await request('/api/payments/create-intent', { method: 'POST', body: { appointmentId: appt.id, amount: service.price } });
      const { error: e1 } = await initPaymentSheet({ paymentIntentClientSecret: clientSecret, merchantDisplayName: 'Barber Booking' });
      if (e1) throw new Error(e1.message);
      const { error: e2 } = await presentPaymentSheet();
      if (e2) throw new Error(e2.message);
      Alert.alert('Ok', 'Prenotazione confermata');
      navigation.navigate('Appointments');
    } catch (e) { Alert.alert('Errore', e.message); }
  };
  return <View style={s.wrap}><View style={s.pad}>
    <Text style={s.title}>Conferma</Text>
    <Text style={s.card}>Servizio: {service.name}</Text>
    <Text style={s.card}>Data: {new Date(dateTime).toLocaleString('it-IT')}</Text>
    <Text style={s.card}>Totale: €{service.price}</Text>
    <TouchableOpacity style={s.btn} onPress={pay}><Text style={s.btnT}>Conferma e paga</Text></TouchableOpacity>
  </View></View>;
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea' },
  pad: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14 },
  btn: { backgroundColor: '#111', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnT: { color: '#fff', fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  slot: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  slotOn: { backgroundColor: '#111', borderColor: '#111' },
  slotT: { color: '#111', fontWeight: '700' },
  slotOnT: { color: '#fff', fontWeight: '700' },
  h1: { fontWeight: '800', marginBottom: 2 }
});

