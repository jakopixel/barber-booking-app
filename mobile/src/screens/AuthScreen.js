import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext.js';

export default function AuthScreen({ route, navigation }) {
  const mode = route.name;
  const { signIn, signUp } = useAuth();
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', shopName: '', specialty: '', bio: '' });
  const upd = (k, v) => setForm(x => ({ ...x, [k]: v }));
  const submit = async () => {
    try {
      mode === 'Login' ? await signIn(form.email, form.password) : await signUp({ ...form, role });
    } catch (e) { Alert.alert('Errore', e.message); }
  };
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.title}>{mode === 'Login' ? 'Accedi' : 'Registrati'}</Text>
      {mode !== 'Login' && <View style={s.roles}>{['client', 'barber', 'owner'].map(x => <TouchableOpacity key={x} onPress={() => setRole(x)} style={[s.role, role === x && s.roleOn]}><Text style={role === x ? s.roleOnText : s.roleText}>{x}</Text></TouchableOpacity>)}</View>}
      {mode !== 'Login' && <TextInput placeholder="Nome" style={s.in} value={form.name} onChangeText={v => upd('name', v)} />}
      <TextInput placeholder="Email" autoCapitalize="none" style={s.in} value={form.email} onChangeText={v => upd('email', v)} />
      <TextInput placeholder="Password" secureTextEntry style={s.in} value={form.password} onChangeText={v => upd('password', v)} />
      {mode !== 'Login' && <TextInput placeholder="Telefono" style={s.in} value={form.phone} onChangeText={v => upd('phone', v)} />}
      {mode !== 'Login' && role === 'barber' && <>
        <TextInput placeholder="Shop name" style={s.in} value={form.shopName} onChangeText={v => upd('shopName', v)} />
        <TextInput placeholder="Specialty" style={s.in} value={form.specialty} onChangeText={v => upd('specialty', v)} />
        <TextInput placeholder="Bio" style={s.in} value={form.bio} onChangeText={v => upd('bio', v)} />
      </>}
      <TouchableOpacity style={s.btn} onPress={submit}><Text style={s.btnText}>{mode === 'Login' ? 'Entra' : 'Crea account'}</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => route.name === 'Login' ? navigation.navigate('Register') : navigation.navigate('Login')}>
        <Text style={s.link}>{mode === 'Login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 60, gap: 12, backgroundColor: '#f5f2ea', flexGrow: 1 },
  title: { fontSize: 34, fontWeight: '900', color: '#111', marginBottom: 8 },
  in: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece7dd', borderRadius: 14, padding: 14 },
  btn: { backgroundColor: '#111', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '800' },
  link: { textAlign: 'center', marginTop: 12, fontWeight: '700', color: '#111' },
  roles: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  role: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#ddd' },
  roleOn: { backgroundColor: '#111', borderColor: '#111' },
  roleText: { color: '#111' },
  roleOnText: { color: '#fff' }
});
