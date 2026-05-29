import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import DarkCard from '../components/DarkCard.js';
import DarkInput from '../components/DarkInput.js';
import DarkButton from '../components/DarkButton.js';
import { useAuth } from '../context/AuthContext.js';
import { request } from '../api/client.js';
import { C, T, SP } from '../constants/theme.js';

export default function CreateShopScreen({ navigation }) {
  const { refresh } = useAuth();
  const [form, setForm] = useState({ name: '', address: '', phone: '', lat: '', lng: '', openingHours: '', photo: '', description: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const geo = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permesso negato', 'Abilita la posizione per compilare lat/lng');
    const p = await Location.getCurrentPositionAsync({});
    upd('lat', String(p.coords.latitude)); upd('lng', String(p.coords.longitude));
  };
  const submit = async () => {
    try {
      if (!form.name || !form.address || !form.phone || !form.openingHours) return Alert.alert('Errore', 'Compila i campi obbligatori');
      const shop = await request('/api/shops', { method: 'POST', body: { ...form, lat: form.lat || undefined, lng: form.lng || undefined } });
      await refresh();
      navigation.replace('ShopProfile', { id: shop.id });
    } catch (e) { Alert.alert('Errore', e.message); }
  };
  return <ScrollView style={s.bg} contentContainerStyle={s.wrap}>
    <Text style={s.title}>Crea il tuo Salone</Text>
    <DarkCard style={s.card}>
      <DarkInput icon="store-outline" label="Nome" value={form.name} onChangeText={v => upd('name', v)} />
      <View style={{ height: SP[1] }} />
      <DarkInput icon="map-marker-outline" label="Indirizzo" value={form.address} onChangeText={v => upd('address', v)} />
      <View style={{ height: SP[1] }} />
      <DarkInput icon="phone-outline" label="Telefono" value={form.phone} onChangeText={v => upd('phone', v)} keyboardType="phone-pad" />
      <View style={{ height: SP[1] }} />
      <View style={s.geoRow}><DarkInput icon="latitude" label="Lat" value={form.lat} onChangeText={v => upd('lat', v)} keyboardType="decimal-pad" style={{ flex: 1 }} /><View style={{ width: 10 }} /><DarkInput icon="longitude" label="Lng" value={form.lng} onChangeText={v => upd('lng', v)} keyboardType="decimal-pad" style={{ flex: 1 }} /></View>
      <TouchableOpacity onPress={geo} style={s.geoBtn}><Text style={s.geoT}>Usa posizione GPS</Text></TouchableOpacity>
      <View style={{ height: SP[1] }} />
      <DarkInput icon="clock-outline" label='OpeningHours JSON es. {"mon":"9-18"}' value={form.openingHours} onChangeText={v => upd('openingHours', v)} />
      <View style={{ height: SP[1] }} />
      <DarkInput icon="image-outline" label="Foto URL opzionale" value={form.photo} onChangeText={v => upd('photo', v)} />
      <View style={{ height: SP[1] }} />
      <DarkInput icon="file-document-outline" label="Descrizione opzionale" value={form.description} onChangeText={v => upd('description', v)} multiline inpStyle={{ minHeight: 88, textAlignVertical: 'top' }} />
      <View style={{ height: SP[2] }} />
      <DarkButton title="Crea Salone" onPress={submit} />
    </DarkCard>
  </ScrollView>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  wrap: { padding: 20, paddingBottom: 28 },
  title: { color: C.txt, fontSize: T.h1, fontWeight: '900', marginBottom: 16 },
  card: { gap: 0 },
  geoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  geoBtn: { backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  geoT: { color: C.s, fontWeight: '900' }
});

