import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { useStripe } from '@stripe/stripe-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DarkCard from '../components/DarkCard.js';
import DarkButton from '../components/DarkButton.js';
import { request } from '../api/client.js';
import { C, T, SP } from '../constants/theme.js';

const slots = d => [...Array(20)].map((_, i) => {
  const x = new Date(d); x.setHours(9 + Math.floor(i / 2), i % 2 ? 30 : 0, 0, 0); return x;
}).filter(x => x.getHours() < 19);

export function ServiceSelectionScreen({ route, navigation }) {
  const { barberId } = route.params;
  const { data = [] } = useQuery({ queryKey: ['services', barberId], queryFn: () => request(`/api/barbers/${barberId}/services`) });
  return <FlatList
    style={s.bg}
    contentContainerStyle={s.wrap}
    data={data}
    keyExtractor={i => String(i.id)}
    ListHeaderComponent={<Text style={s.title}>Scegli servizio</Text>}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    renderItem={({ item }) => <DarkCard style={s.card}>
      <View style={s.row}>
        <Text style={s.h1}>{item.name}</Text>
        <Text style={s.price}>€{item.price}</Text>
      </View>
      <View style={s.row2}>
        <View style={s.meta}><MaterialCommunityIcons name="clock-outline" size={16} color={C.p} /><Text style={s.metaT}>{item.duration} min</Text></View>
        <TouchableOpacity onPress={() => navigation.navigate('DateTimePicker', { barberId, service: item })}><Text style={s.link}>Seleziona</Text></TouchableOpacity>
      </View>
      {!!item.description && <Text style={s.sub}>{item.description}</Text>}
    </DarkCard>}
    ListEmptyComponent={<DarkCard><Text style={s.sub}>Nessun servizio disponibile.</Text></DarkCard>}
  />;
}

export function DateTimePickerScreen({ route, navigation }) {
  const { barberId, service } = route.params;
  const [day, setDay] = useState(new Date());
  const [slot, setSlot] = useState(null);
  const list = useMemo(() => slots(day), [day]);
  return <View style={s.bg}>
    <View style={s.wrap}>
      <Text style={s.title}>Scegli data e orario</Text>
      <DarkCard style={s.card}>
        <DateTimePicker value={day} mode="date" display="default" onChange={(_, d) => d && setDay(d)} />
        <View style={s.grid}>
          {list.map(x => {
            const on = slot?.toISOString() === x.toISOString();
            return <TouchableOpacity key={x.toISOString()} style={[s.slot, on && s.slotOn]} onPress={() => setSlot(x)}>
              <Text style={on ? s.slotOnT : s.slotT}>{x.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>;
          })}
        </View>
      </DarkCard>
      <View style={{ height: SP[2] }} />
      <DarkButton title="Avanti" disabled={!slot} onPress={() => navigation.navigate('Confirmation', { barberId, service, dateTime: slot.toISOString() })} />
    </View>
  </View>;
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
  return <View style={s.bg}><View style={s.wrap}>
    <Text style={s.title}>Conferma</Text>
    <DarkCard style={s.card}>
      <Text style={s.h1}>{service.name}</Text>
      <Text style={s.sub}>{new Date(dateTime).toLocaleString('it-IT')}</Text>
      <View style={s.line}><Text style={s.metaT}>Totale</Text><Text style={s.price}>€{service.price}</Text></View>
    </DarkCard>
    <View style={{ height: SP[2] }} />
    <DarkButton title="Conferma e paga" onPress={pay} />
  </View></View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  wrap: { padding: 20, paddingBottom: 28 },
  title: { color: C.txt, fontSize: T.h1, fontWeight: '900', marginBottom: 16 },
  card: { marginBottom: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  h1: { color: C.txt, fontSize: T.h2, fontWeight: '900', flex: 1, paddingRight: 10 },
  price: { color: C.s, fontSize: 18, fontWeight: '900' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaT: { color: C.sub, fontWeight: '700' },
  sub: { color: C.sub, marginTop: 10, lineHeight: 22 },
  link: { color: C.p, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  slot: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.input },
  slotOn: { backgroundColor: C.p, borderColor: C.p },
  slotT: { color: C.txt, fontWeight: '700' },
  slotOnT: { color: C.txt, fontWeight: '900' },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }
});
