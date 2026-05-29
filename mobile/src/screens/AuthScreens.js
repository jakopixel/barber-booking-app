import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext.js';
import DarkInput from '../components/DarkInput.js';
import DarkButton from '../components/DarkButton.js';
import DarkCard from '../components/DarkCard.js';
import { C, T, SP } from '../constants/theme.js';

export default function AuthScreens({ route, navigation }) {
  const mode = route.name;
  const { signIn, signUp } = useAuth();
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', shopName: '', specialty: '', bio: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = async () => {
    try { mode === 'Login' ? await signIn(form.email, form.password) : await signUp({ ...form, role }); } catch (e) { Alert.alert('Errore', e.message); }
  };
  return <LinearGradient colors={['#1c102a', '#121212', '#0d0d0d']} style={{ flex: 1 }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <Text style={s.kicker}>Barber Booking</Text>
          <Text style={s.title}>{mode === 'Login' ? 'Bentornato' : 'Crea il tuo profilo'}</Text>
          <Text style={s.sub}>Gestisci prenotazioni, salone e abbonamento da un'unica app.</Text>
        </View>
        <DarkCard style={s.card}>
          <DarkInput icon="email-outline" label="Email" value={form.email} onChangeText={v => upd('email', v)} autoCapitalize="none" keyboardType="email-address" />
          <View style={{ height: SP[1] }} />
          <DarkInput icon="lock-outline" label="Password" value={form.password} onChangeText={v => upd('password', v)} secureTextEntry />
          {mode !== 'Login' && <>
            <View style={{ height: SP[1] }} />
            <DarkInput icon="account-outline" label="Nome" value={form.name} onChangeText={v => upd('name', v)} />
            <View style={{ height: SP[1] }} />
            <DarkInput icon="phone-outline" label="Telefono" value={form.phone} onChangeText={v => upd('phone', v)} keyboardType="phone-pad" />
            <View style={s.roles}>{['client', 'barber', 'owner'].map(x => <TouchableOpacity key={x} onPress={() => setRole(x)} style={[s.role, role === x && s.roleOn]}><Text style={role === x ? s.roleOnT : s.roleT}>{x}</Text></TouchableOpacity>)}</View>
            {role === 'barber' && <>
              <View style={{ height: SP[1] }} />
              <DarkInput icon="store-outline" label="Nome salone" value={form.shopName} onChangeText={v => upd('shopName', v)} />
              <View style={{ height: SP[1] }} />
              <DarkInput icon="content-cut" label="Specialty" value={form.specialty} onChangeText={v => upd('specialty', v)} />
              <View style={{ height: SP[1] }} />
              <DarkInput icon="text" label="Bio" value={form.bio} onChangeText={v => upd('bio', v)} multiline style={{ alignItems: 'flex-start' }} inpStyle={{ minHeight: 90, textAlignVertical: 'top' }} />
            </>}
          </>}
          <View style={{ height: SP[2] }} />
          <DarkButton title={mode === 'Login' ? 'Entra' : 'Crea account'} onPress={submit} />
          <View style={s.div}><Text style={s.divT}>oppure</Text></View>
          <TouchableOpacity style={s.social} onPress={() => Alert.alert('Social', 'Accesso social non ancora collegato')}>
            <MaterialCommunityIcons name="google" size={20} color={C.txt} /><Text style={s.socialT}>Continua con Google</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate(mode === 'Login' ? 'Register' : 'Login')} style={{ marginTop: 14 }}>
            <Text style={s.link}>{mode === 'Login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}</Text>
          </TouchableOpacity>
        </DarkCard>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>;
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 20, paddingTop: 54, paddingBottom: 24 },
  hero: { marginBottom: 20 },
  kicker: { color: C.s, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: C.txt, fontSize: 32, fontWeight: '900', marginTop: 8 },
  sub: { color: C.sub, fontSize: T.body, marginTop: 8, lineHeight: 22 },
  card: { gap: 0 },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  role: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: C.input, borderWidth: 1, borderColor: C.border },
  roleOn: { backgroundColor: C.p, borderColor: C.p },
  roleT: { color: C.txt, fontWeight: '800' },
  roleOnT: { color: C.txt, fontWeight: '900' },
  div: { alignItems: 'center', marginTop: 16, marginBottom: 10 },
  divT: { color: C.sub, fontWeight: '700' },
  social: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.input, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: C.border },
  socialT: { color: C.txt, fontWeight: '800' },
  link: { color: C.s, textAlign: 'center', fontWeight: '800' }
});

